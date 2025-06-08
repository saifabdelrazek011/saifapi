import express from "express";
import {
  createShortUrl,
  useShortUrl,
  updateShortUrl,
  deleteShortUrl,
  getAllShortUrls,
  getUserShortUrls,
} from "../controllers/shorturls.controller.js";
import identifier from "../middlewares/identification.js";

const shortUrlsRouter = express.Router();

shortUrlsRouter.get("/all", identifier, getAllShortUrls);
shortUrlsRouter.get("/user/:userId", identifier, getUserShortUrls);
shortUrlsRouter.post("/", identifier, createShortUrl);
shortUrlsRouter.get("/:shorturl", useShortUrl);
shortUrlsRouter.patch("/:shorturlId", identifier, updateShortUrl);
shortUrlsRouter.delete("/:shorturlId", identifier, deleteShortUrl);

export default shortUrlsRouter;
