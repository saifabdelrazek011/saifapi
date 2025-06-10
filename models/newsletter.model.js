import mongoose from "mongoose";
import { newsletterDB } from "../databases/mongodb.databases.js";

const newsletterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const newsletterSubscribtionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Newsletter = newsletterDB.model("Newsletter", newsletterSchema);
const NewsletterSubscription = newsletterDB.model(
  "NewsletterSubscription",
  newsletterSubscribtionSchema
);

export { Newsletter, NewsletterSubscription };
