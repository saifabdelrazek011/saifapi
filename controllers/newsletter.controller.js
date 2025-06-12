import {
  NewsletterProvider,
  NewsletterSubscription,
} from "../models/newsletter.model.js";
import {
  newsletterSubscriptionSchema,
  newsletterProviderSchema,
} from "../middlewares/validators/newsletter.validator.js";
import { User } from "../models/users.model.js";
import { createAPIKEY, encryptApiKey } from "../utils/apikey.js";
import { doHash, doHashValidation } from "../utils/hashing.js";
import { signupSchema } from "../middlewares/validators/auth.validator.js";

// Get all newsletter subscribers (current subscriber for the provider or all subscribers for admin)
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

// Unsubscribe from a newsletter
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

// Send a newsletter
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
    });

    if (!newProvider.providerName || !newProvider.providerEmail) {
      return res.status(400).json({
        status: "fail",
        message: "Provider name and email are required.",
      });
    }

    await newProvider.save();

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

// Get all newsletter providers
export const getNewsletterProviders = async (req, res) => {
  const viewerId = req.user.userId;
  try {
    const viewer = await User.findById(viewerId);
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

    const providers = await NewsletterProvider.find({});

    if (providers.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No newsletter providers found.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        providers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete a newsletter provider
export const deleteNewsletterProvider = async (req, res) => {
  const viewerId = req.user.userId;
  const { providerEmail, providerPassword } = req.body;

  try {
    const viewer = await User.findById(viewerId);

    if (
      !viewer ||
      !viewer.roles ||
      !viewer.roles.includes("newsletterProvider")
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to delete a newsletter provider.",
      });
    }

    // If the viewer is a newsletter provider, validate their credentials

    if (!providerEmail || !providerPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Provider email and password are required.",
      });
    }

    const provider = await NewsletterProvider.findOne({
      providerEmail,
    }).select("+providerPassword");

    // Check if the provider exists
    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }

    const isPasswordValid = await doHashValidation(
      providerPassword,
      provider.providerPassword
    );

    if (!isPasswordValid) {
      return res.status(403).json({
        status: "fail",
        message: "Incorrect password for the provider.",
      });
    }

    // Remove the provider from the User model
    const user = await User.findOne({
      newsletterProviderId: provider._id,
    });

    if (user) {
      user.roles = user.roles.filter((role) => role !== "newsletterProvider");
      user.newsletterProviderId = null;
      await user.save();
    }

    // Delete the provider
    await NewsletterProvider.deleteOne({ _id: provider._id });

    return res.status(200).json({
      status: "success",
      message: "Newsletter provider deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const createProviderApiKey = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);
    console.log(user);

    if (!user || !user.roles || !user.roles.includes("newsletterProvider")) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to create an API key.",
      });
    }

    const providerId = user.newsletterProviderId;
    console.log(providerId);

    const provider = await NewsletterProvider.findById(providerId);
    console.log(provider);

    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }

    // Create a new API key
    const apiKey = await createAPIKEY();
    const encryptedApiKey = await encryptApiKey(apiKey);
    const hashedApiKey = await doHash(apiKey);

    if (!hashedApiKey || !encryptedApiKey) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create API key.",
      });
    }
    const newApiKey = new providerApiKey({
      providerId: provider._id,
      encryptedApiKey,
      hashedApiKey,
    });

    await newApiKey.save();

    return res.status(200).json({
      status: "success",
      message: "API key created successfully.",
      data: {
        apiKey,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
