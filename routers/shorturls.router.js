import express from "express";
import {
  getShortUrlsViews,
  createShortUrl,
  useShortUrl,
  updateShortUrl,
  deleteShortUrl,
} from "../controllers/shorturls.controller.js";
import identifier from "../middlewares/identification.js";

const shortUrlsRouter = express.Router();

shortUrlsRouter.get("/", getShortUrlsViews);
shortUrlsRouter.post("/", identifier, createShortUrl);
shortUrlsRouter.get("/:shorturl", useShortUrl);
shortUrlsRouter.patch("/:shorturlId", identifier, updateShortUrl);
shortUrlsRouter.delete("/:shorturlId", identifier, deleteShortUrl);

export default shortUrlsRouter;
