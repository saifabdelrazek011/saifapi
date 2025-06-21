import express from "express";
import {
  createShortUrl,
  useShortUrl,
  updateShortUrl,
  deleteShortUrl,
  getAllShortUrls,
  getUserShortUrls,
  getMyShortUrls,
  getShortUrlInfo,
  getShortUrlById,
} from "./shorturls.controller.js";
import { apiKeyUserMiddleware, identifier } from "../middlewares/index.js";

const shortUrlsRouter = express.Router();

shortUrlsRouter.post("/", apiKeyUserMiddleware, identifier, createShortUrl);
shortUrlsRouter.get("/", apiKeyUserMiddleware, identifier, getMyShortUrls);
shortUrlsRouter.get(
  "/:shorturlId",
  apiKeyUserMiddleware,
  identifier,
  getShortUrlById
);
shortUrlsRouter.patch(
  "/:shorturlId",
  apiKeyUserMiddleware,
  identifier,
  updateShortUrl
);
shortUrlsRouter.delete(
  "/:shorturlId",
  apiKeyUserMiddleware,
  identifier,
  deleteShortUrl
);

shortUrlsRouter.get("/all", identifier, getAllShortUrls);
shortUrlsRouter.get("/info/:shorturl", getShortUrlInfo);
shortUrlsRouter.get("/user/:userId", identifier, getUserShortUrls);
shortUrlsRouter.get("/to/:shorturl", useShortUrl);
shortUrlsRouter.get("/to", useShortUrl);

shortUrlsRouter.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Short URLs router is working fine.",
  });
});

export default shortUrlsRouter;
export { shortUrlsRouter };
