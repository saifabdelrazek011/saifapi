import {
  NewsletterProvider,
  NewsletterSubscription,
} from "../models/newsletter.model.js";
import {
  newsletterSubscriptionSchema,
  newsletterProviderSchema,
} from "../middlewares/validators/newsletter.validator.js";
import { User } from "../models/users.model.js";

export const getNewsletterSubscribers = async (req, res) => {
  const viewerId = req.user.userId;
  try {
    const viewer = await User.findById(viewerId);
    console.log("Viewer:", viewer);
    if (
      !viewer ||
      !viewer.roles ||
      (!viewer.roles.includes("newsletterAdmin") &&
        !viewer.roles.includes("superAdmin"))
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
  const { name, email, providerId } = req.body;
  try {
    const existingSubscription = await NewsletterSubscription.findOne({
      email,
      unsubscribedAt: null,
    });

    if (existingSubscription) {
      return res.status(409).json({
        status: "fail",
        message: "You are already subscribed to the newsletter.",
      });
    }

    const existingEmail = await NewsletterSubscription.findOne({
      email,
    });

    if (existingEmail) {
      existingEmail.unsubscribedAt = null; // Reset unsubscribedAt if the email exists

      await existingEmail.save();
      res.status(200).json({
        status: "success",
        message: "Successfully re-subscribed to the newsletter.",
        data: {
          subscription: existingEmail,
        },
      });
    } else {
      const { error, value } = newsletterSubscriptionSchema.validate({
        email,
        name,
        providerId,
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
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const unsubscribeFromNewsletter = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required.",
      });
    }

    const subscription = await NewsletterSubscription.findOne({
      email,
      unsubscribedAt: null,
    });

    if (!subscription) {
      return res.status(404).json({
        status: "fail",
        message: "No active subscription found for this email.",
      });
    }

    subscription.unsubscribedAt = new Date();
    await subscription.save();

    res.status(200).json({
      status: "success",
      message: "Successfully unsubscribed from the newsletter.",
      data: {
        subscription,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const sendNewsletter = async (req, res) => {
  const { subject, content } = req.body;
  const viewerId = req.user.userId;

  try {
    const viewer = await User.findById(viewerId);
    if (
      !viewer ||
      !viewer.roles ||
      !viewer.roles.includes("newsletterProvider")
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to send newsletters.",
      });
    }

    if (!subject || !content) {
      return res.status(400).json({
        status: "fail",
        message: "Subject and content are required.",
      });
    }

    const subscribers = await NewsletterSubscription.find({
      providerId: viewerId,
      unsubscribedAt: null,
    });

    if (subscribers.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No active subscribers found.",
      });
    }

    // Sending the newsletter logic

    res.status(200).json({
      status: "success",
      message: "Newsletter sent successfully.",
      data: {
        subject,
        content,
        recipientsCount: subscribers.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Adding A provider to the newsletter
export const AddNewsletterProvider = async (req, res) => {
  const { providerName, providerEmail } = req.body;
  const viewerId = req.user.userId;

  try {
    const { error, value } = newsletterProviderSchema.validate({
      providerName,
      providerEmail,
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }

    const viewer = await User.findById(viewerId);

    if (!viewer || !viewer.roles || !viewer.roles.includes("superAdmin")) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to add a newsletter provider.",
      });
    }

    const existingProvider = await NewsletterProvider.findOne({
      providerEmail,
    });

    if (existingProvider) {
      return res.status(409).json({
        status: "fail",
        message: "A provider with this email already exists.",
      });
    }

    const newProvider = new NewsletterProvider({
      providerName,
      providerEmail,
    });

    if (!newProvider.providerName || !newProvider.providerEmail) {
      return res.status(400).json({
        status: "fail",
        message: "Provider name and email are required.",
      });
    }

    const existingUser = await User.findOne({
      email: newProvider.providerEmail,
    });

    if (existingUser) {
      existingUser.roles.push("newsletterProvider");
      existingUser.newsletterProviderId = newProvider._id;
      if (existingUser.verified) {
        newProvider.providerEmailVerified = true;
      }
      await existingUser.save();
    } else {
      const newUser = new User({
        name: newProvider.providerName,
        email: newProvider.providerEmail,
        roles: ["newsletterProvider"],
        newsletterProviderId: newProvider._id,
      });

      await newUser.save();
    }

    await newProvider.save();

    res.status(201).json({
      status: "success",
      message: "Newsletter provider added successfully.",
      data: {
        provider: newProvider,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
