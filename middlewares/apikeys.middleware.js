import { providerApiKey } from "../models/newsletter.model.js";
import { userApiKey } from "../models/users.model.js";
import { hmacProcess } from "../utils/hashing.js";

// Authenticate newsletter providers via API keys.
export const apiKeyNewsletterMiddleware = async (req, res, next) => {
  if (req.user) {
    next();
    return;
  }

  const apiKey =
    req.headers["x-api-key"] || req.query.apiKey || req.body.apiKey;

  if (!apiKey) {
    return res
      .status(403)
      .json({ success: false, message: "API key is required" });
  }

  const lookupHash = hmacProcess(apiKey);
  if (!lookupHash) {
    return res
      .status(403)
      .json({ success: false, message: "Error processing API key" });
  }
  const apikeyData = await providerApiKey.findOne({ lookupHash });
  if (!apikeyData) {
    return res.status(403).json({ success: false, message: "Invalid API key" });
  }

  req.user = apikeyData;

  next();
};

// This middleware is used to authenticate users via API keys.
export const apiKeyUserMiddleware = async (req, res, next) => {
  if (req.user) {
    next();
    return;
  }

  const apiKey =
    req.headers["x-api-key"] || req.query.apiKey || req.body.apiKey;

  if (!apiKey) {
    next({
      status: 403,
      success: false,
      message: "API key is required",
    });
    return;
  }

  const lookupHash = hmacProcess(apiKey);

  if (!lookupHash) {
    return res
      .status(403)
      .json({ success: false, message: "Error processing API key" });
  }

  const apikeyData = await userApiKey.findOne({ lookupHash });
  if (!apikeyData) {
    return res.status(403).json({ success: false, message: "Invalid API key" });
  }

  req.user = apikeyData;

  if (!apikeyData) {
    next({
      status: 403,
      success: false,
      message: "Invalid API key",
    });
    return;
  }

  req.user = apikeyData;
  next();
};
