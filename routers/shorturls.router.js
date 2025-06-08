import express from "express";
import {
  createShortUrl,
  useShortUrl,
  updateShortUrl,
  deleteShortUrl,
  getAllShortUrls,
  getUserShortUrls,
  getMyShortUrls,
} from "../controllers/shorturls.controller.js";
import identifier from "../middlewares/identification.js";

const shortUrlsRouter = express.Router();

shortUrlsRouter.post("/", identifier, createShortUrl);
shortUrlsRouter.get("/", identifier, getMyShortUrls);
shortUrlsRouter.get("/all", identifier, getAllShortUrls);
shortUrlsRouter.get("/:shorturl", useShortUrl);
shortUrlsRouter.patch("/:shorturlId", identifier, updateShortUrl);
shortUrlsRouter.delete("/:shorturlId", identifier, deleteShortUrl);
shortUrlsRouter.get("/user/:userId", identifier, getUserShortUrls);

export default shortUrlsRouter;
