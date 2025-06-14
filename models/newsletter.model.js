import mongoose from "mongoose";
import { newsletterDB } from "../databases/mongodb.databases.js";

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    names: {
      type: Map,
      of: String,
      required: true,
      default: {},
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
    },
    senderName: {
      type: String,
      required: [true, "Sender name is required"],
      trim: true,
    },
    emailServiceName: {
      type: String,
      required: [true, "Email service name is required"],
      trim: true,
    },
    emailServiceAddress: {
      type: String,
      required: [true, "Email service address is required"],
      trim: true,
    },
    emailServicePassword: {
      type: String,
      required: [true, "Email service password is required"],
      select: false,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

const providerApiKeySchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewsletterProvider",
      required: [true, "Provider ID is required"],
    },
    lookupHash: {
      type: String,
      required: [true, "Lookup hash is required"],
      unique: true,
    },
    hashedApiKey: {
      type: String,
      required: [true, "Hashed API key is required"],
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const NewsletterSubscription = newsletterDB.model(
  "NewsletterSubscription",
  newsletterSubscriberSchema
);
const NewsletterProvider = newsletterDB.model(
  "NewsletterProvider",
  newsletterProviderSchema
);
const providerApiKey = newsletterDB.model(
  "ProviderApiKey",
  providerApiKeySchema
);

export { NewsletterSubscription, NewsletterProvider, providerApiKey };
