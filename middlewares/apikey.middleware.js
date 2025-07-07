import { providerApiKey } from "../newsletter/newsletter.model.js";
import User, { userApiKey } from "../users/users.model.js";
import { hmacProcess } from "../utils/index.js";

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
  const apiKey =
    req?.headers["x-api-key"] || req?.query?.apiKey || req?.body?.apiKey;

  if (!apiKey) {
    next();
    return;
  }

  const lookupHash = hmacProcess(apiKey);

  if (!lookupHash) {
    next();
    return;
  }

  const apikeyData = await userApiKey.findOne({ lookupHash });

  if (!apikeyData) {
    next();
    return;
  }

  const user = await User.findById(apikeyData.userId).select("+password");

  if (!user) {
    next();
    return;
  }

  if (user.isBanned) {
    next();
    return;
  }

  req.user = user;

  next();
};
