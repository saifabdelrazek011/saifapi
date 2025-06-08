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
      !viewerUser.role === "admin" &&
      !viewerUser.role === "superAdmin"
    ) {
      return res
        .status(403)
        .send("Forbidden: You are not allowed to view this user's short URLs.");
    }

    const shortUrls = await ShortUrl.find({ createdBy: userId });
    if (!shortUrls || shortUrls.length === 0) {
      return res.status(404).send("No short URLs found for this user.");
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

// GET ALL SHORT URLS
export const getAllShortUrls = async (req, res) => {
  const viewerId = req.user.userId;
  const viewerUser = await User.findById(viewerId);
  try {
    if (
      !viewerUser ||
      !viewerUser.role === "admin" ||
      !viewerUser.role === "superAdmin"
    ) {
      return res
        .status(403)
        .send("Forbidden: You are not allowed to view all short URLs.");
    }

    const shortUrls = await ShortUrl.find();
    if (!shortUrls || shortUrls.length === 0) {
      return res.status(404).send("No short URLs found.");
    }

    res.status(200).json({
      success: true,
      message: "All short URLs fetched successfully.",
      shortUrls: shortUrls,
    });
  } catch (error) {
    console.error("Error fetching all short URLs:", error);
    res.status(500).send("Internal Server Error: " + error.message);
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
      return res.status(400).send(`Validation error: ${error.message}`);
    }
    const domain = `${req.protocol}://${req.headers.host}`;

    if (!fullUrl) {
      return res.status(400).send("Full URL is required.");
    }
    if (!creatorId) {
      return res
        .status(401)
        .send("Unauthorized: you must be logged in to create a short URL.");
    }

    const short = shortUrl || nanoid(7);
    const existingShort = await ShortUrl.findOne({ short });
    if (existingShort) {
      return res.status(400).send("Custom short URL already exists.");
    }

    const existingFull = await ShortUrl.findOne({ full: fullUrl });
    if (existingFull) {
      return res
        .status(400)
        .send(
          `Full URL already exists at <a href="${domain}/v1/shorturls/${existingFull.short}">${domain}/v1/shorturls/${existingFull.short}</a>`
        );
    }

    await ShortUrl.create({ full: fullUrl, short, createdBy: creatorId });
    return res.status(201).send({
      success: true,
      message: "Short URL created successfully.",
      shortUrl: `${domain}/v1/shorturls/${short}`,
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).send("Internal Server Error");
  }
};

// REDIRECT TO THE FULL URL
export const useShortUrl = async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shorturl });
    if (!shortUrl) {
      return res.status(404).send("Short URL not found. ");
    }
    shortUrl.clicks++;
    await shortUrl.save();
    res.redirect(shortUrl.full);
  } catch (error) {
    console.error("Error fetching short URL:", error);
    res.status(500).send("Internal Server Error");
  }
};

// UPDATE AN EXISTING SHORT URL
export const updateShortUrl = async (req, res) => {
  const { fullUrl, shortUrl } = req.body;
  const updaterId = req.user.userId;
  const { shorturlId } = req.params;

  try {
    const requestedUrl = await ShortUrl.findById(shorturlId);

    const updaterUser = await User.findById(updaterId);
    if (
      !updaterUser ||
      (!updaterUser.role === "admin" &&
        !updaterUser.role === "superAdmin" &&
        requestedUrl.createdBy.toString() !== updaterId)
    ) {
      return res
        .status(403)
        .send("Forbidden: You are not allowed to update this short URL.");
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
      return res.status(404).send("Short URL not found.");
    }
    const deleterUser = await User.findById(deleterId);
    if (
      !deleterUser ||
      (!deleterUser.role === "admin" &&
        !deleterUser.role === "superAdmin" &&
        requestedUrl.createdBy.toString() !== deleterId)
    ) {
      return res
        .status(403)
        .send("Forbidden: You are not allowed to delete this short URL.");
    }
    await ShortUrl.findByIdAndDelete(shorturlId);

    res.status(200).send("Short URL deleted successfully.");
  } catch (error) {
    console.error("Error deleting short URL:", error);
    res.status(500).send("Internal Server Error");
  }
};
