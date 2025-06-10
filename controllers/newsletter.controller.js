import { NewsletterSubscription } from "../models/newsletter.model.js";
import { newsletterSubscriptionSchema } from "../middlewares/validators/newsletter.validator.js";

export const getNewsletterSubscribers = async (req, res) => {
  const viewerId = req.user.userId;
  try {
    const viewer = await User.findById(viewerId);
    if (
      !viewer ||
      !viewer.role ||
      (viewer.role !== "admin" && viewer.role !== "superadmin")
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to access this resource.",
      });
    }

    const wantedFields = req.query.fields
      ? req.query.fields.split(",").join(" ")
      : "name email subscribedAt";

    const subscribers = await NewsletterSubscription.find({
      unsubscribedAt: null,
    }).select(wantedFields);

    if (subscribers.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No subscribers found.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        subscribers,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const subscribeToNewsletter = async (req, res) => {
  const { name, email } = req.body;

  try {
    const { error, value } = newsletterSubscriptionSchema.validate({
      email,
      name,
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }
    if (!name || !email) {
      return res.status(400).json({
        status: "fail",
        message: "Name and email are required.",
      });
    }

    const existingSubscription = await NewsletterSubscription.findOne({
      email,
    });

    if (existingSubscription) {
      return res.status(409).json({
        status: "fail",
        message: "You are already subscribed to the newsletter.",
      });
    }

    const newSubscription = new NewsletterSubscription({
      name,
      email,
    });

    await newSubscription.save();

    res.status(201).json({
      status: "success",
      message: "Successfully subscribed to the newsletter.",
      data: {
        subscription: newSubscription,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
