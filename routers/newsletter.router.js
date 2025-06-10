import express from "express";

import {
  getNewsletterSubscribers,
  subscribeToNewsletter,
} from "../controllers/newsletter.controller.js";
import { identifier } from "../middlewares/identification.js";

const newsletterRouter = express.Router();

newsletterRouter.get("/emails", identifier, getNewsletterSubscribers);

newsletterRouter.post("/subscribe", subscribeToNewsletter);

export default newsletterRouter;
