import mongoose from "mongoose";
import { newsletterDB } from "../databases/mongodb.databases.js";

const newsletterProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Provider name is required"],
      trim: true,
    },
    providerEmail: {
      type: String,
      required: [true, "Provider email is required"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    providerEmailVerified: {
      type: Boolean,
      default: false,
    },
    providerEmailVerificationCode: {
      type: String,
      select: false,
    },
    providerEmailVerificationExpires: {
      type: Date,
      default: Date.now,
    },
    providerEmailPassword: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const newsletterSubscriberSchema = new mongoose.Schema(
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
    newsletterIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Newsletter",
      required: [true, "At least one newsletter ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

const NewsletterProvider = newsletterDB.model(
  "Newsletter",
  newsletterProviderSchema
);
const NewsletterSubscription = newsletterDB.model(
  "NewsletterSubscription",
  newsletterSubscriberSchema
);

export { NewsletterProvider, NewsletterSubscription };
