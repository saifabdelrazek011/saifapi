import express from "express";

import {
  getNewsletterSubscribers,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  sendNewsletter,
  AddNewsletterProvider,
} from "../controllers/newsletter.controller.js";
import { identifier } from "../middlewares/identification.js";

const newsletterRouter = express.Router();

newsletterRouter.post("/provider", identifier, AddNewsletterProvider);

newsletterRouter.get("/emails", identifier, getNewsletterSubscribers);

newsletterRouter.post("/subscribe", subscribeToNewsletter);

newsletterRouter.patch("/unsubscribe", unsubscribeFromNewsletter);

newsletterRouter.post("/send", identifier, sendNewsletter);

export default newsletterRouter;
