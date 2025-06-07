import mongoose from "mongoose";
import { subscriptionDB } from "../databases/connections.js";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    price: {
      type: Number,
      required: [true, "Subscription price is required"],
      min: 0,
    },
    currency: {
      type: String,
      required: [true, "Subscription currency is required"],
      trim: true,
      enum: ["USD", "EUR", "GBP", "INR", "AUD", "CAD"],
      default: "USD",
    },
    frequency: {
      type: String,
      required: [true, "Subscription frequency is required"],
      trim: true,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
    category: {
      type: String,
      required: [true, "Subscription category is required"],
      trim: true,
      enum: [
        "Entertainment",
        "Utilities",
        "Food",
        "Transportation",
        "Health",
        "Productivity",
        "Other",
      ],
      default: "other",
    },
    paymentMethod: {
      type: String,
      required: [true, "Subscription payment method is required"],
      trim: true,
      enum: ["credit_card", "debit_card", "paypal", "bank_transfer"],
      default: "credit_card",
    },
    status: {
      type: String,
      required: [true, "Subscription status is required"],
      trim: true,
      enum: ["active", "inactive", "cancelled"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: [true, "Subscription start date is required"],

      validate: {
        validator: function (value) {
          return value <= new Date(); // Check if the start date is not in the future
        },
        message: "Start date cannot be in the future",
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.startDate; // Check if the renewal date is after the start date
        },
        message: "Renewal date must be after the start date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-calculate renewal date if missing
subscriptionSchema.pre("save", function (next) {
  if (!this.renewalDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(
      this.renewalDate.getDate() + renewalPeriods[this.frequency]
    );
  }

  // Auto-update the status if renewal date has passed
  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }

  next();
});

const Subscription = subscriptionDB.model("Subscription", subscriptionSchema);

export default Subscription;
