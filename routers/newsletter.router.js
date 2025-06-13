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
  changeProviderApiKey,
  deleteProviderApiKey,
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
  apiKeyUserMiddleware,
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
  apiKeyUserMiddleware,
  deleteNewsletterProvider
);

newsletterRouter.get(
  "/emails",
  identifier,
  apiKeyUserMiddleware,
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

newsletterRouter.post(
  "/apikey",
  identifier,
  apiKeyUserMiddleware,
  createProviderApiKey
);

newsletterRouter.patch(
  "/apikey",
  identifier,
  apiKeyUserMiddleware,
  changeProviderApiKey
);

newsletterRouter.delete(
  "/apikey",
  identifier,
  apiKeyUserMiddleware,
  deleteProviderApiKey
);

newsletterRouter.post(
  "/send",
  identifier,
  apiKeyUserMiddleware,
  sendNewsletter
);

export default newsletterRouter;
