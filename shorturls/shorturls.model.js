import { nanoid } from "nanoid";
import { shortUrlDB } from "./shorturls.db.js";
import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema(
  {
    full: {
      type: String,
      required: true,
      unique: true,
    },
    short: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(6),
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

const ShortUrl = shortUrlDB.model("ShortUrl", shortUrlSchema);

export default ShortUrl;
export { ShortUrl };
