import ShortUrl from "./shorturls.model.js";
import { nanoid } from "nanoid";

import { createShortUrlSchema } from "./shorturls.validation.js";

// GET A USER'S SHORT URLS
export const getUserShortUrls = async (req, res) => {
  const { userId } = req.params;
  const viewerUser = req.user;
  try {
    if (
      viewerUser._id.toString() !== userId &&
      !viewerUser.roles.includes("shorturlsAdmin") &&
      !viewerUser.roles.includes("superAdmin")
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You are not allowed to view this user's short URLs.",
      });
    }

    const shortUrls = await ShortUrl.find({ createdBy: userId });
    if (!shortUrls || shortUrls.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No short URLs found for this user.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Short URLs fetched successfully.",
      shortUrls: shortUrls,
    });
  } catch (error) {
    console.error("Error fetching user's short URLs:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// GET MY SHORT URLS
export const getMyShortUrls = async (req, res) => {
  const viewerUser = req.user;
  try {
    if (!viewerUser) {
      return res
        .status(404)
        .json({ success: false, message: "You are not registered." });
    }
    const shortUrls = await ShortUrl.find({ createdBy: viewerUser._id });
    if (!shortUrls || shortUrls.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No short URLs found for you." });
    }
    return res.status(200).json({
      success: true,
      message: "Your short URLs fetched successfully.",
      shortUrls: shortUrls,
    });
  } catch (error) {
    console.error("Error fetching viewer user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

// GET ALL SHORT URLS FOR ADMIN OR SUPERADMIN
export const getAllShortUrls = async (req, res) => {
  const viewerUser = req.user;
  try {
    if (!viewerUser) {
      return res
        .status(404)
        .json({ success: false, message: "You are not registered." });
    }

    if (
      viewerUser.roles.includes("shorturlsAdmin") ||
      viewerUser.roles.includes("superAdmin")
    ) {
      const shortUrls = await ShortUrl.find();
      if (!shortUrls || shortUrls.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No short URLs found." });
      }

      return res.status(200).json({
        success: true,
        message: "All short URLs fetched successfully.",
        shortUrls: shortUrls,
      });
    }
    return res.status(403).json({
      success: false,
      message: "Forbidden: You are not allowed to view all short URLs.",
    });
  } catch (error) {
    console.error("Error fetching all short URLs:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

// GET A SHORT URL BY ID
export const getShortUrlById = async (req, res) => {
  const { shorturlId } = req.params;
  const viewerUser = req.user;
  try {
    if (!viewerUser) {
      return res
        .status(404)
        .json({ success: false, message: "You are not registered." });
    }
    const shortUrl = await ShortUrl.findById(shorturlId);
    if (!shortUrl) {
      return res
        .status(404)
        .json({ success: false, message: "Short URL not found." });
    }
    if (
      viewerUser._id.toString() !== shortUrl.createdBy.toString() &&
      !viewerUser.roles.includes("shorturlsAdmin") &&
      !viewerUser.roles.includes("superAdmin")
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not allowed to view this short URL.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Short URL fetched successfully.",
      shortUrl: shortUrl,
    });
  } catch (error) {
    console.error("Error fetching short URL by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

// CREATE A NEW SHORT URL
export const createShortUrl = async (req, res) => {
  const creatorUser = req.user;
  const { fullUrl, shortUrl } = req.body;

  try {
    if (!creatorUser) {
      return res
        .status(404)
        .json({ success: false, message: "You are not registered." });
    }
    if (!creatorUser.verified) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You must be a verified user to create a short URL.",
      });
    }
    const { error, value } = createShortUrlSchema.validate({
      fullUrl,
      shortUrl,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${error.message}`,
      });
    }
    const domain = `https://sa.died.pw`;

    if (!fullUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Full URL is required." });
    }
    if (!creatorUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: you must be logged in to create a short URL.",
      });
    }

    const short = shortUrl || nanoid(7);
    const existingShort = await ShortUrl.findOne({ short });
    if (existingShort) {
      return res
        .status(400)
        .json({ success: false, message: "Custom short URL already exists." });
    }

    const existingFull = await ShortUrl.findOne({ full: fullUrl });
    if (existingFull) {
      return res.status(400).json({
        success: false,
        message: `Full URL already exists at ${domain}/v1/shorturls/${existingFull.short}`,
      });
    }

    await ShortUrl.create({ full: fullUrl, short, createdBy: creatorUser._id });
    return res.status(201).json({
      success: true,
      message: "Short URL created successfully.",
      shortUrl: `${domain}/v1/shorturls/${short}`,
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// REDIRECT TO THE FULL URL
export const useShortUrl = async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shorturl });
    if (!shortUrl) {
      res.redirect("/v1/shorturls/to/404");
      return;
    }
    shortUrl.clicks++;
    await shortUrl.save();
    res.redirect(shortUrl.full);
    return;
  } catch (error) {
    console.error("Error fetching short URL:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Send short URL information
export const getShortUrlInfo = async (req, res) => {
  const { shorturl } = req.params;
  const type = req.headers["type"];

  try {
    const shortUrl = await ShortUrl.findOne({ short: shorturl });
    if (!shortUrl) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Short URL information fetched successfully.",
      shortUrl: shortUrl,
    });
  } catch (error) {
    console.error("Error fetching short URL information:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// UPDATE AN EXISTING SHORT URL
export const updateShortUrl = async (req, res) => {
  const { fullUrl, shortUrl } = req.body;
  const updaterUser = req.user;
  const { shorturlId } = req.params;

  try {
    if (!updaterUser) {
      return res
        .status(404)
        .json({ success: false, message: "You are not registered." });
    }
    if (!updaterUser.verified) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You must be a verified user to update a short URL.",
      });
    }
    // Validate the input
    const { error, value } = createShortUrlSchema.validate({
      fullUrl,
      shortUrl,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: `Validation error: ${error.message}`,
      });
    }
    if (!fullUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Full URL is required." });
    }
    if (!updaterUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: you must be logged in to update a short URL.",
      });
    }
    if (!shorturlId) {
      return res
        .status(400)
        .json({ success: false, message: "Short URL ID is required." });
    }
    if (!shortUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Short URL is required." });
    }
    const requestedUrl = await ShortUrl.findById(shorturlId);

    if (!requestedUrl) {
      return res
        .status(404)
        .json({ success: false, message: "Short URL not found" });
    }

    if (
      !updaterUser ||
      (!updaterUser.roles.includes("shorturlsAdmin") &&
        !updaterUser.roles.includes("superAdmin") &&
        requestedUrl.createdBy.toString() !== updaterUser._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not allowed to update this short URL.",
      });
    }

    const updated = await ShortUrl.findByIdAndUpdate(
      shorturlId,
      { full: fullUrl, short: shortUrl },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found or update failed",
      });
    }
    res.status(200).json({
      success: true,
      message: "Short URL updated successfully",
      shortUrl: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE A SHORT URL
export const deleteShortUrl = async (req, res) => {
  const deleterUser = req.user;
  const { shorturlId } = req.params;
  try {
    if (!deleterUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: you must be logged in to delete a short URL.",
      });
    }

    const requestedUrl = await ShortUrl.findById(shorturlId);
    if (!requestedUrl) {
      return res
        .status(404)
        .json({ success: false, message: "Short URL not found." });
    }

    if (
      !deleterUser ||
      (!deleterUser.roles.includes("shorturlsAdmin") &&
        !deleterUser.roles.includes("superAdmin") &&
        requestedUrl.createdBy.toString() !== deleterUser._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not allowed to delete this short URL.",
      });
    }
    await ShortUrl.findByIdAndDelete(shorturlId);

    res
      .status(200)
      .json({ success: true, message: "Short URL deleted successfully." });
  } catch (error) {
    console.error("Error deleting short URL:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
