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
  setUserAsProvider,
  removeUserAsProvider,
  setUserAsProviderWorker,
  removeUserAsProviderWorker,
  getNewsletterProviderWorkers,
  updateNewsletterSubscriptionName,
  setEmailServiceDetails,
} from "./newsletter.controller.js";
import { identifier } from "../middlewares/index.js";
import {
  apiKeyNewsletterMiddleware,
  apiKeyUserMiddleware,
} from "../middlewares/index.js";

const newsletterRouter = express.Router();

// Subscribe and unsubscribe Controller
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

newsletterRouter.patch(
  "/subscribe",
  apiKeyNewsletterMiddleware,
  updateNewsletterSubscriptionName
);

// Newsletter Providers Controller
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

// Set and remove user as provider and worker
newsletterRouter.patch(
  "/providers/set",
  identifier,
  apiKeyUserMiddleware,
  setUserAsProvider
);

newsletterRouter.patch(
  "/providers/remove",
  identifier,
  apiKeyUserMiddleware,
  removeUserAsProvider
);

newsletterRouter.patch(
  "/providers/workers/set",
  identifier,
  apiKeyUserMiddleware,
  setUserAsProviderWorker
);

newsletterRouter.patch(
  "/providers/workers/remove",
  identifier,
  apiKeyUserMiddleware,
  removeUserAsProviderWorker
);

// Admins and providers routes
newsletterRouter.get(
  "/emails",
  identifier,
  apiKeyUserMiddleware,
  getNewsletterSubscribers
);

newsletterRouter.get(
  "/providers/workers",
  identifier,
  apiKeyUserMiddleware,
  getNewsletterProviderWorkers
);

// ApiKey routes
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

// Send Newsletter
newsletterRouter.post(
  "/send",
  identifier,
  apiKeyUserMiddleware,
  sendNewsletter
);

newsletterRouter.post(
  "/send/details",
  identifier,
  apiKeyUserMiddleware,
  setEmailServiceDetails
);

newsletterRouter.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Newsletter router is working fine.",
  });
});

export default newsletterRouter;
export { newsletterRouter };
