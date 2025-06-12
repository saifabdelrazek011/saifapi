import mongoose from "mongoose";
import { newsletterDB } from "../databases/mongodb.databases.js";
import { doHash } from "../utils/hashing.js";
import { createAPIKEY } from "../utils/apikey.js";
import { HASH_SALT } from "../config/env.js";

const newsletterProviderSchema = new mongoose.Schema(
  {
    providerName: {
      type: String,
      required: [true, "Provider name is required"],
      trim: true,
    },
    providerEmail: {
      type: String,
      required: [true, "Provider email is required"],
      unique: true,
      trim: true,
    },
    providerPassword: {
      type: String,
      required: [true, "Provider password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
      trim: true,
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value
          );
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
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
      select: false,
    },
    providerApiKey: {
      type: String,
      unique: true,
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
      default: [],
      required: [true, "At least one newsletter ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

const NewsletterProvider = newsletterDB.model(
  "NewsletterProvider",
  newsletterProviderSchema
);
const NewsletterSubscription = newsletterDB.model(
  "NewsletterSubscription",
  newsletterSubscriberSchema
);

export { NewsletterProvider, NewsletterSubscription };
