import ShortUrl from "../models/shorturls.model.js";
import { nanoid } from "nanoid";
import { ACCESS_TOKEN } from "../config/env.js";

export const getShortUrlsViews = async (req, res) => {
  try {
    const token = req.query.token;
    const shortUrls = await ShortUrl.find();

    if (token === ACCESS_TOKEN) {
      return res.render("shorturls-admin-view", {
        shortUrls: shortUrls,
        token: token,
      });
    }
    res.render("shorturls-viewer-view", { shortUrls: shortUrls });
  } catch (error) {
    console.error("Error fetching views:", error);
    res.status(500).send("Internal Server Error");
  }
};

// CREATE A NEW SHORT URL
export const createShortUrl = async (req, res) => {
  try {
    const { fullUrl, token, customShortUrl } = req.body;
    const domain = `${req.protocol}://${req.headers.host}`;

    if (token !== accessToken) {
      return res.status(403).send("Forbidden: Invalid access token");
    }
    if (!fullUrl) {
      return res.status(400).send("Full URL is required.");
    }

    const short = customShortUrl || nanoid(7);
    const existingShort = await ShortUrl.findOne({ short });
    if (existingShort) {
      return res.status(400).send("Custom short URL already exists.");
    }

    const existingFull = await ShortUrl.findOne({ full: fullUrl });
    if (existingFull) {
      return res
        .status(400)
        .send(
          `Full URL already exists at <a href="${domain}/${existingFull.short}">${domain}/${existingFull.short}</a>`
        );
    }

    await ShortUrl.create({ full: fullUrl, short });
    res.redirect("/?token=" + token);
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).send("Internal Server Error");
  }
};

// REDIRECT TO THE FULL URL
export const useShortUrl = async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shorturl });
    if (!shortUrl) return res.redirect("/");

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
  const { fullUrl, customShortUrl } = req.body;
  const token = req.query.token;
  const { shorturlId } = req.params;

  if (token !== accessToken) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  try {
    const updated = await ShortUrl.findByIdAndUpdate(
      shorturlId,
      { full: fullUrl, short: customShortUrl },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Short URL not found" });
    }

    res.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE A SHORT URL
export const deleteShortUrl = async (req, res) => {
  try {
    const { shorturlId } = req.params;
    const { token } = req.query;

    if (token !== accessToken) {
      return res.status(403).send("Forbidden: Invalid access token");
    }

    await ShortUrl.findByIdAndDelete(shorturlId);
    res.redirect("/?token=" + token);
  } catch (error) {
    console.error("Error deleting short URL:", error);
    res.status(500).send("Internal Server Error");
  }
};
