import { providerApiKey } from "../models/newsletter.model.js";
import User, { userApiKey } from "../models/users.model.js";
import { doHash, doHashValidation } from "../utils/hashing.js";

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

  const apikeys = await providerApiKey.find({});
  let matchedApiKey = null;

  for (const apikey of apikeys) {
    if (await doHashValidation(apiKey, apikey.hashedApiKey)) {
      matchedApiKey = apikey;
      break;
    }
  }

  if (!matchedApiKey) {
    return res
      .status(403)
      .json({ success: false, message: "Error hashing API key" });
  }

  req.user = matchedApiKey;

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

  const hashedApiKey = await doHash(apiKey);

  if (!hashedApiKey) {
    next({
      status: 403,
      success: false,
      message: "Error hashing API key",
    });
    return;
  }

  const apikey = await userApiKey.findOne({ hashedApiKey });

  if (!apikey) {
    next({
      status: 403,
      success: false,
      message: "Invalid API key",
    });
    return;
  }

  const user = await User.findById(apikey.userId);
  req.user = user;
  next();
};
