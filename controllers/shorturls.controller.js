import ShortUrl from "../models/shorturls.model.js";
import { nanoid } from "nanoid";
import User from "../models/users.model.js";

import { createShortUrlSchema } from "../middlewares/validators/shorturls.validator.js";

// GET A USER'S SHORT URLS
export const getUserShortUrls = async (req, res) => {
  const { userId } = req.params;
  const viewerId = req.user.userId;
  try {
    const viewerUser = await User.findById(viewerId);
    if (
      viewerId !== userId &&
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
  const viewerId = req.user.userId;
  try {
    const viewerUser = await User.findById(viewerId);
    if (!viewerUser) {
      return res
        .status(404)
        .json({ success: false, message: "You are not registered." });
    }
    const shortUrls = await ShortUrl.find({ createdBy: viewerId });
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
  const viewerId = req.user.userId;
  try {
    const viewerUser = await User.findById(viewerId);
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

// CREATE A NEW SHORT URL
export const createShortUrl = async (req, res) => {
  const creatorId = req.user.userId;
  const { fullUrl, shortUrl } = req.body;

  try {
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
    const domain = `${req.protocol}://${req.headers.host}`;

    if (!fullUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Full URL is required." });
    }
    if (!creatorId) {
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

    await ShortUrl.create({ full: fullUrl, short, createdBy: creatorId });
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
      return res
        .status(404)
        .json({ success: false, message: "Short URL not found." });
    }
    shortUrl.clicks++;
    await shortUrl.save();
    res.redirect(shortUrl.full);
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
  const updaterId = req.user.userId;
  const { shorturlId } = req.params;

  try {
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
    if (!updaterId) {
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

    const updaterUser = await User.findById(updaterId);
    if (
      !updaterUser ||
      (!updaterUser.roles.includes("shorturlsAdmin") &&
        !updaterUser.roles.includes("superAdmin") &&
        requestedUrl.createdBy.toString() !== updaterId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not allowed to update this short URL.",
      });
    }

    if (!requestedUrl) {
      return res
        .status(404)
        .json({ success: false, message: "Short URL not found" });
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
  const deleterId = req.user.userId;
  const { shorturlId } = req.params;
  try {
    const requestedUrl = await ShortUrl.findById(shorturlId);
    if (!requestedUrl) {
      return res
        .status(404)
        .json({ success: false, message: "Short URL not found." });
    }
    const deleterUser = await User.findById(deleterId);
    if (
      !deleterUser ||
      (!deleterUser.roles.includes("shorturlsAdmin") &&
        !deleterUser.roles.includes("superAdmin") &&
        requestedUrl.createdBy.toString() !== deleterId)
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
