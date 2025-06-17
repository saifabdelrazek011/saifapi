import mongoose from "mongoose";
import { userDB } from "../databases/mongodb.databases.js";

const user = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter your first name"],
    },
    lastName: {
      type: String,
    },
    username: {
      type: String,
      required: [true, "Please enter your username"],
      unique: [true, "Username already exists"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username must be at most 20 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: [true, "Email already exists"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
      trim: true,
      validator: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value
          );
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },
    roles: {
      type: [String],
      enum: [
        "user",
        "authAdmin",
        "superAdmin",
        "shorturlsAdmin",
        "postsAdmin",
        "subscriptionAdmin",
        "newsletterAdmin",
        "newsletterProvider",
        "newsletterProviderWorker",
      ],
      default: "user",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeValidation: {
      type: Number,
      select: false,
    },
    forgetPasswordCode: {
      type: String,
      select: false,
    },
    forgetPasswordCodeValidation: {
      type: Number,
      select: false,
    },
    newsletterProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewsletterProvider",
    },
  },
  {
    timestamps: true,
  }
);

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lookupHash: {
      type: String,
      required: true,
      unique: true,
    },
    encryptedApiKey: {
      type: String,
      required: true,
      unique: true,
    },
    hashedApiKey: {
      type: String,
      required: true,
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

export const User = userDB.model("User", user);
export const userApiKey = userDB.model("ApiKey", apiKeySchema);

export default User;
