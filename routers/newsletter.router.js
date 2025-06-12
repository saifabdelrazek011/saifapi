import express from "express";

import {
  getNewsletterSubscribers,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  sendNewsletter,
  AddNewsletterProvider,
  getNewsletterProviders,
  deleteNewsletterProvider,
  createProviderApiKey,
} from "../controllers/newsletter.controller.js";
import { identifier } from "../middlewares/identifier.middleware.js";
import {
  apiKeyNewsletterMiddleware,
  apiKeyUserMiddleware,
} from "../middlewares/apikeys.middleware.js";

const newsletterRouter = express.Router();

newsletterRouter.get(
  "/providers",
  identifier,
  apiKeyNewsletterMiddleware,
  getNewsletterProviders
);

newsletterRouter.post(
  "/providers",
  identifier,
  apiKeyUserMiddleware,
  AddNewsletterProvider
);

newsletterRouter.delete(
  "/providers",
  identifier,
  apiKeyNewsletterMiddleware,
  deleteNewsletterProvider
);

newsletterRouter.get(
  "/emails",
  identifier,
  apiKeyNewsletterMiddleware,
  getNewsletterSubscribers
);

newsletterRouter.post(
  "/subscribe",
  apiKeyNewsletterMiddleware,
  subscribeToNewsletter
);

newsletterRouter.patch(
  "/unsubscribe",
  apiKeyNewsletterMiddleware,
  unsubscribeFromNewsletter
);

newsletterRouter.patch("/apikey", identifier, createProviderApiKey);

newsletterRouter.post("/send", identifier, sendNewsletter);

export default newsletterRouter;
