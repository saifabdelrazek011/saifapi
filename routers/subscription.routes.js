import { Router } from "express";
import {
  createSubscription,
  getUserSubscriptions,
} from "../controllers/subscription.controller.js";
import { identifier } from "../middlewares/identifier.middleware.js";
const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) =>
  res.send({ title: "GET all subscriptions" })
);
subscriptionRouter.get("/:id", (req, res) =>
  res.send({ title: "GET subscriptions details" })
);
subscriptionRouter.post("/", identifier, createSubscription);

subscriptionRouter.put("/:id", (req, res) =>
  res.send({ title: "UPDATE subscriptions" })
);
subscriptionRouter.delete("/:id", (req, res) =>
  res.send({ title: "DELETE all subscriptions" })
);
subscriptionRouter.get("/user/:id", identifier, getUserSubscriptions);
subscriptionRouter.put("/:id/cancel", (req, res) => {
  res.send({ title: "CANCEL subscriptions" });
});
subscriptionRouter.get("/upcoming-renewals", (req, res) => {
  res.send({ title: "GET upcoming renewal" });
});

export default subscriptionRouter;
