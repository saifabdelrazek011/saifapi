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
} from "./shorturls.controller.js";
import { identifier } from "../middlewares/index.js";

const shortUrlsRouter = express.Router();

shortUrlsRouter.post("/", identifier, createShortUrl);
shortUrlsRouter.get("/mine", identifier, getMyShortUrls);
shortUrlsRouter.get("/all", identifier, getAllShortUrls);
shortUrlsRouter.get("/to/:shorturl", useShortUrl);
shortUrlsRouter.get("/to", useShortUrl);
shortUrlsRouter.get("/info/:shorturl", getShortUrlInfo);
shortUrlsRouter.patch("/:shorturlId", identifier, updateShortUrl);
shortUrlsRouter.delete("/:shorturlId", identifier, deleteShortUrl);
shortUrlsRouter.get("/user/:userId", identifier, getUserShortUrls);

shortUrlsRouter.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Short URLs router is working fine.",
  });
});

export default shortUrlsRouter;
export { shortUrlsRouter };
