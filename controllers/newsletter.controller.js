import {
  NewsletterProvider,
  NewsletterSubscription,
} from "../models/newsletter.model.js";
import {
  newsletterSubscriptionSchema,
  newsletterProviderSchema,
} from "../middlewares/validators/newsletter.validator.js";
import { User } from "../models/users.model.js";
import { createAPIKEY } from "../utils/apikey.js";
import { doHash } from "../utils/hashing.js";
import { signupSchema } from "../middlewares/validators/auth.validator.js";

export const getNewsletterSubscribers = async (req, res) => {
  const viewerId = req.user.userId;
  try {
    const viewer = await User.findById(viewerId);

    if (
      !viewer ||
      !viewer.roles ||
      (!viewer.roles.includes("newsletterAdmin") &&
        !viewer.roles.includes("superAdmin") &&
        !viewer.roles.includes("newsletterProvider"))
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to access this resource.",
      });
    }

    const wantedFields = req.query.fields
      ? req.query.fields.split(",").join(" ")
      : "name email subscribedAt";

    let subscribers;

    if (viewer.roles.includes("newsletterProvider")) {
      subscribers = await NewsletterSubscription.find({
        newsletterIds: { $in: viewer.newsletterProviderId },
      }).select(wantedFields);
    } else {
      subscribers = await NewsletterSubscription.find({}).select(wantedFields);
    }

    if (subscribers.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No subscribers found.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        subscribers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Subscribe to a newsletter
export const subscribeToNewsletter = async (req, res) => {
  const { name, email, providerId } = req.body;
  try {
    const { error, value } = newsletterSubscriptionSchema.validate({
      name,
      email,
      providerId,
    });
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }
    const existingSubscription = await NewsletterSubscription.findOne({
      email,
      newsletterIds: { $in: [providerId] },
    });

    if (existingSubscription) {
      return res.status(409).json({
        status: "fail",
        message: "You are already subscribed to the newsletter.",
      });
    }

    const existingEmail = await NewsletterSubscription.findOne(
      {
        email,
      },
      { new: true }
    );

    if (existingEmail) {
      if (!Array.isArray(existingEmail.newsletterIds)) {
        existingEmail.newsletterIds = [];
      }

      existingEmail.newsletterIds.push(providerId);

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
  const { email, providerId } = req.body;
  try {
    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required.",
      });
    }

    const subscription = await NewsletterSubscription.findOne({
      email,
      newsletterIds: { $in: [providerId] },
    });

    if (!subscription) {
      return res.status(404).json({
        status: "fail",
        message: "No active subscription found for this email.",
      });
    }

    const index = subscription.newsletterIds.indexOf(providerId);

    if (index === -1) {
      return res.status(404).json({
        status: "fail",
        message: "You are not subscribed to this newsletter.",
      });
    }
    subscription.newsletterIds.splice(index, 1);
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
  const { providerName, providerEmail, providerPassword } = req.body;
  const createrId = req.user.userId;

  try {
    const creater = await User.findById(createrId);

    if (
      !creater ||
      !creater.roles ||
      (!creater.roles.includes("superAdmin") &&
        !creater.roles.includes("newsletterAdmin"))
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to add a newsletter provider.",
      });
    }

    const { error, value } = newsletterProviderSchema.validate({
      providerName,
      providerEmail,
      providerPassword,
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
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

    // Create an API KEY for the provider
    const apiKey = await createAPIKEY();
    const hashedApiKey = await doHash(apiKey);

    if (!hashedApiKey) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create API key.",
      });
    }

    const hashedProviderPassword = await doHash(providerPassword);

    if (!hashedProviderPassword) {
      return res.status(500).json({
        status: "error",
        message: "Failed to hash provider password.",
      });
    }

    const newProvider = new NewsletterProvider({
      providerName,
      providerEmail,
      providerPassword: hashedProviderPassword,
      providerApiKey: hashedApiKey,
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
      if (existingUser.roles.includes("newsletterProvider")) {
        return res.status(409).json({
          status: "fail",
          message:
            "This email is already associated with a newsletter provider.",
        });
      } else if (existingUser.roles.includes("superAdmin")) {
        return res.status(403).json({
          status: "fail",
          message:
            "This email is associated with a super admin. Please use a different email.",
        });
      }

      existingUser.roles.push("newsletterProvider");

      existingUser.newsletterProviderId = newProvider._id;
      if (existingUser.verified) {
        newProvider.providerEmailVerified = true;
      }

      await existingUser.save();
    } else {
      const { error, value } = signupSchema.validate({
        firstName: newProvider.providerName,
        email: newProvider.providerEmail,
        password: newProvider.providerPassword,
      });

      if (error) {
        return res.status(400).json({
          status: "fail",
          message: error.details[0].message,
        });
      }

      const newUser = new User({
        firstName: newProvider.providerName,
        email: newProvider.providerEmail,
        password: newProvider.providerPassword,
        roles: ["newsletterProvider"],
        newsletterProviderId: newProvider._id,
        verified: true,
      });

      await newUser.save();
    }

    return res.status(201).json({
      status: "success",
      message: "Newsletter provider added successfully.",
      data: {
        provider: newProvider,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
