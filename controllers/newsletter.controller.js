import {
  NewsletterProvider,
  NewsletterSubscription,
  providerApiKey,
} from "../models/newsletter.model.js";
import {
  newsletterSubscriptionSchema,
  newsletterProviderSchema,
  setEmailServiceDetailsSchema,
  setUserAsProviderSchema,
  sendNewsletterSchema,
} from "../middlewares/validators/newsletter.validator.js";
import { User } from "../models/users.model.js";
import { createAPIKEY } from "../utils/apikey.js";
import {
  doHash,
  doHashValidation,
  encryptEmailPassword,
  decryptEmailPassword,
  hmacProcess,
} from "../utils/hashing.js";
import { signupSchema } from "../middlewares/validators/auth.validator.js";
import { newsletterSend } from "../config/sendMail.js";

// Subscription controller for newsletters
export const subscribeToNewsletter = async (req, res) => {
  u;
  const { name, email } = req.body;
  const { providerId } = req.user;

  if (!providerId) {
    return res.status(400).json({
      status: "fail",
      message: "Provider ID is required.",
    });
  }

  try {
    const { error, value } = newsletterSubscriptionSchema.validate({
      name,
      email,
      providerId: providerId?.toString(),
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }

    const existingProvider = await NewsletterProvider.findById(providerId);
    if (!existingProvider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
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

    // If user is already subscribed to a different newsletter
    if (existingEmail) {
      if (!Array.isArray(existingEmail.newsletterIds)) {
        const newsletterIds = existingEmail.newsletterIds;
        existingEmail.newsletterIds = Array.isArray(newsletterIds)
          ? newsletterIds
          : [newsletterIds];
      }

      if (!existingEmail.newsletterIds.includes(providerId)) {
        if (!existingEmail.newsletterIds) {
          existingEmail.newsletterIds = [];
        }

        if (!existingEmail.names) {
          existingEmail.names = new Map();
          // If migrating from old 'name' field:
          if (existingEmail.name) {
            const userCurrentName = existingEmail.name;
            existingEmail.name = null;
            existingEmail.newsletterIds.forEach((id) => {
              existingEmail.names.set(id, userCurrentName);
            });
          }
        }

        existingEmail.names.set(providerId, name);

        existingEmail.newsletterIds.push(providerId);

        await existingEmail.save();
        res.status(200).json({
          status: "success",
          message: "Successfully re-subscribed to the newsletter.",
          data: {
            subscription: existingEmail,
          },
        });
      }

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

      return res.status(200).json({
        status: "success",
        message: "You are already subscribed to this newsletter.",
        data: {
          subscription: existingEmail,
        },
      });
    }

    // If users is not already subscribed, create a new subscription
    const newSubscription = new NewsletterSubscription({
      names: new Map([[providerId, name]]),
      email,
      newsletterIds: [providerId],
    });

    if (!newSubscription.names || newSubscription.names.size === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Name and email are required.",
      });
    }

    if (
      !newSubscription.newsletterIds ||
      newSubscription.newsletterIds.length === 0
    ) {
      return res.status(400).json({
        status: "fail",
        message: "At least one newsletter ID is required.",
      });
    }

    if (!Array.isArray(newSubscription.newsletterIds)) {
      newSubscription.newsletterIds = [newSubscription.newsletterIds];
    }

    await newSubscription.save();

    return res.status(201).json({
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

export const unsubscribeFromNewsletter = async (req, res) => {
  const { email } = req.body;
  const { providerId } = req.user;
  try {
    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required.",
      });
    }
    if (!providerId) {
      return res.status(400).json({
        status: "fail",
        message: "Provider ID is required.",
      });
    }

    const subscription = await NewsletterSubscription.findOne(
      {
        email,
        newsletterIds: { $in: [providerId] },
      },
      { new: true }
    );

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
    subscription.names.delete(providerId);

    await subscription.save();

    return res.status(200).json({
      status: "success",
      message: "Successfully unsubscribed from the newsletter.",
      data: {
        subscription,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateNewsletterSubscriptionName = async (req, res) => {
  const { email, name } = req.body;
  const { providerId } = req.user;
  try {
    if (!email || !name) {
      return res.status(400).json({
        status: "fail",
        message: "Email and name are required.",
      });
    }
    if (!providerId) {
      return res.status(400).json({
        status: "fail",
        message: "Provider ID is required.",
      });
    }

    const subscription = await NewsletterSubscription.findOne(
      {
        email,
        newsletterIds: { $in: [providerId] },
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        status: "fail",
        message: "No active subscription found for this email.",
      });
    }

    subscription.names.delete(providerId);
    subscription.names.set(providerId, name);

    if (!subscription.names || subscription.names.size === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Name and email are required.",
      });
    }
    if (
      !subscription.newsletterIds ||
      subscription.newsletterIds.length === 0
    ) {
      return res.status(400).json({
        status: "fail",
        message: "At least one newsletter ID is required.",
      });
    }

    if (!Array.isArray(subscription.newsletterIds)) {
      subscription.newsletterIds = [subscription.newsletterIds];
    }

    await subscription.save();

    return res.status(200).json({
      status: "success",
      message: "Successfully updated the newsletter subscription.",
      data: {
        subscription,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Provider controllers
export const getCurrentNewsletterProvider = async (req, res) => {
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
        message: "You do not have permission to access this resource.",
      });
    }
    const provider = await NewsletterProvider.findById(
      viewer.newsletterProviderId
    ).select("+providerPassword");
    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }
    return res.status(200).json({
      status: "success",
      data: {
        provider,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

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

    const existingUser = await User.findOne({
      email: newProvider.providerEmail,
    });

    // If the user already exists, add the newsletterProvider role
    if (existingUser) {
      // Check if the user already has the newsletterProvider role
      if (
        existingUser.roles.includes("superAdmin") ||
        existingUser.roles.includes("newsletterAdmin")
      ) {
        return res.status(403).json({
          status: "fail",
          message:
            "This email is associated with a super admin or newsletter admin. Please use a different email.",
        });
      }

      if (existingUser.roles.includes("newsletterProvider")) {
        return res.status(409).json({
          status: "fail",
          message:
            "This email is already associated with a newsletter provider.",
        });
      }

      if (existingUser.roles.includes("newsletterProviderWorker")) {
        return res.status(403).json({
          status: "fail",
          message:
            "This email is associated with a newsletter provider worker. Please use a different email.",
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

    // Save the new provider
    await newProvider.save();

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

    // Check if the viewer is the owner of the provider account
    if (viewer.newsletterProviderId != provider._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You can only delete your own newsletter provider account.",
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

    // Remove the provider and workers from the User model
    const userProviders = await User.find({
      newsletterProviderId: provider._id,
      roles: { $in: ["newsletterProvider", "newsletterProviderWorker"] },
    });

    userProviders.forEach(async (user) => {
      user.roles = user.roles.filter(
        (role) =>
          role !== "newsletterProvider" && role !== "newsletterProviderWorker"
      );
      user.newsletterProviderId = null;
      await user.save();
    });

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

// Admin and provider controllers
export const getNewsletterSubscribers = async (req, res) => {
  const viewerId = req.user.userId;
  try {
    const viewer = await User.findById(viewerId);

    if (
      !viewer ||
      !viewer.roles ||
      (!viewer.roles.includes("newsletterAdmin") &&
        !viewer.roles.includes("superAdmin") &&
        !viewer.roles.includes("newsletterProvider") &&
        !viewer.roles.includes("newsletterProviderWorker"))
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

    if (
      viewer.roles.includes("newsletterProvider") ||
      viewer.roles.includes("newsletterProviderWorker")
    ) {
      if (!viewer.newsletterProviderId) {
        return res.status(400).json({
          status: "fail",
          message: "You do not have a newsletter provider ID.",
        });
      }
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

export const getNewsletterProviderWorkers = async (req, res) => {
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
        message: "You do not have permission to access this resource.",
      });
    }

    if (!viewer.newsletterProviderId) {
      return res.status(400).json({
        status: "fail",
        message: "You do not have a newsletter provider ID.",
      });
    }

    const provider = await NewsletterProvider.findById(
      viewer.newsletterProviderId
    );

    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }

    const workers = await User.find({
      newsletterProviderId: provider._id,
      roles: { $in: ["newsletterProviderWorker"] },
    });

    return res.status(200).json({
      status: "success",
      data: {
        workers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Provider API key controllers
export const createProviderApiKey = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);

    if (!user || !user.roles || !user.roles.includes("newsletterProvider")) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to create an API key.",
      });
    }

    const providerId = user.newsletterProviderId;

    const provider = await NewsletterProvider.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }

    const existingApiKey = await providerApiKey.findOne({
      providerId: provider._id,
    });

    if (existingApiKey) {
      return res.status(409).json({
        status: "fail",
        message: "An API key already exists for this provider.",
      });
    }

    // Create a new API key
    const apiKey = await createAPIKEY();
    const lookupHash = await hmacProcess(apiKey);
    const hashedApiKey = await doHash(apiKey);

    if (!hashedApiKey) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create API key.",
      });
    }

    const newApiKey = new providerApiKey({
      providerId: provider._id,
      lookupHash,
      hashedApiKey,
    });

    await newApiKey.save();

    return res.status(200).json({
      status: "success",
      message: "API key created successfully. Save it securely.",
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

export const changeProviderApiKey = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);
    if (!user || !user.roles || !user.roles.includes("newsletterProvider")) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to change the provider API key.",
      });
    }

    const providerId = user.newsletterProviderId;
    const provider = await NewsletterProvider.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }

    // Create a new API key
    const apiKey = await createAPIKEY();
    const hashedApiKey = await doHash(apiKey);

    if (!hashedApiKey) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create API key.",
      });
    }

    // Update the existing API key for the provider
    const updatedApiKey = await providerApiKey.findOneAndUpdate(
      { providerId: provider._id },
      { hashedApiKey },
      { new: true }
    );

    if (!updatedApiKey) {
      return res.status(404).json({
        status: "fail",
        message: "No API key found for this provider.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Provider API key changed successfully. Save it securely.",
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

export const deleteProviderApiKey = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);
    if (!user || !user.roles || !user.roles.includes("newsletterProvider")) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to delete a provider API key.",
      });
    }

    const providerId = user.newsletterProviderId;
    const provider = await NewsletterProvider.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }

    // Delete the API key for the provider
    const deletedApiKey = await providerApiKey.findOneAndDelete({
      providerId: provider._id,
    });
    if (!deletedApiKey) {
      return res.status(404).json({
        status: "fail",
        message: "No API key found for this provider.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Provider API key deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Setting Users as providers Controllers
export const setUserAsProvider = async (req, res) => {
  const providerId = req.user.newsletterProviderId;
  const { email, password } = req.body;

  try {
    const { error, value } = setUserAsProviderSchema.validate({
      email,
      providerId: providerId?.toString(),
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }

    const provider = await NewsletterProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }

    const isPasswordValid = await doHashValidation(
      password,
      provider.providerPassword
    );
    if (!isPasswordValid) {
      return res.status(403).json({
        status: "fail",
        message: "Incorrect password for the provider.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found.");
    }

    // Check if the user already has the newsletterProvider role
    if (user.roles.includes("newsletterProvider")) {
      return res
        .status(400)
        .json({ status: "fail", message: "User is already a provider." });
    }

    user.roles.push("newsletterProvider");
    user.newsletterProviderId = providerId;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "User set as provider successfully.",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

export const removeUserAsProvider = async (req, res) => {
  const providerId = req.user.newsletterProviderId;
  const { email, password } = req.body;

  try {
    const { error, value } = setUserAsProviderSchema.validate({
      email,
      providerId: providerId?.toString(),
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }

    const provider = await NewsletterProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }

    const isPasswordValid = await doHashValidation(
      password,
      provider.providerPassword
    );
    if (!isPasswordValid) {
      return res.status(403).json({
        status: "fail",
        message: "Incorrect password for the provider.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found.");
    }

    // Check if the user is a newsletterProvider
    if (!user.roles.includes("newsletterProvider")) {
      return res
        .status(400)
        .json({ status: "fail", message: "User is not a provider." });
    }

    const isUserTheMainProvider = provider.email === user.email;
    if (isUserTheMainProvider) {
      return res.status(403).json({
        status: "fail",
        message: "You cannot remove the main provider.",
      });
    }

    user.roles = user.roles.filter((role) => role !== "newsletterProvider");
    user.newsletterProviderId = null;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "User removed as provider successfully.",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// Setting User as Provider Worker Controllers
export const setUserAsProviderWorker = async (req, res) => {
  const providerId = req.user.newsletterProviderId;
  const { email, password } = req.body;

  try {
    const { error, value } = setUserAsProviderSchema.validate({
      email,
      providerId: providerId?.toString(),
    });
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }

    const provider = await NewsletterProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }

    const isPasswordValid = await doHashValidation(
      password,
      provider.providerPassword
    );
    if (!isPasswordValid) {
      return res.status(403).json({
        status: "fail",
        message: "Incorrect password for the provider.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found.");
    }

    // Check if the user is a newsletterProvider
    if (user.roles.includes("newsletterProvider")) {
      return res.status(400).json({
        status: "fail",
        message: "User is a provider.",
      });
    }

    // Check if the user already has the newsletterProviderWorker role
    if (user.roles.includes("newsletterProviderWorker")) {
      return res.status(400).json({
        status: "fail",
        message: "User is already a provider worker.",
      });
    }

    user.roles.push("newsletterProviderWorker");
    user.newsletterProviderId = providerId;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "User set as provider worker successfully.",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

export const removeUserAsProviderWorker = async (req, res) => {
  const providerId = req.user.newsletterProviderId;
  const { email, password } = req.body;

  try {
    const { error, value } = setUserAsProviderSchema.validate({
      email,
      providerId: providerId?.toString(),
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }

    const provider = await NewsletterProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }

    const isPasswordValid = await doHashValidation(
      password,
      provider.providerPassword
    );
    if (!isPasswordValid) {
      return res.status(403).json({
        status: "fail",
        message: "Incorrect password for the provider.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found.");
    }

    // Check if the user is a newsletterProviderWorker
    if (!user.roles.includes("newsletterProviderWorker")) {
      return res.status(400).json({
        status: "fail",
        message: "User is not a provider worker.",
      });
    }

    user.roles = user.roles.filter(
      (role) => role !== "newsletterProviderWorker"
    );
    user.newsletterProviderId = null;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "User removed as provider worker successfully.",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// Sending newsletters Controllers
export const setEmailServiceDetails = async (req, res) => {
  const {
    senderName,
    emailServiceAddress,
    emailServicePassword,
    emailServiceName,
    providerPassword,
  } = req.body;

  const viewerId = req.user.userId;

  try {
    const { error, value } = setEmailServiceDetailsSchema.validate({
      senderName,
      emailServiceAddress,
      emailServicePassword,
      emailServiceName,
      viewerId: viewerId?.toString(),
      providerPassword,
    });

    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }

    const viewer = await User.findById(viewerId);
    if (
      !viewer ||
      !viewer.roles ||
      !viewer.roles.includes("newsletterProvider")
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to set email service details.",
      });
    }

    const providerId = viewer.newsletterProviderId;
    if (!providerId) {
      return res.status(400).json({
        status: "fail",
        message: "You do not have a newsletter provider ID.",
      });
    }

    const provider = await NewsletterProvider.findById(providerId).select(
      "+providerPassword"
    );
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
    if (
      !senderName ||
      !emailServiceAddress ||
      !emailServicePassword ||
      !emailServiceName
    ) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required.",
      });
    }

    const encryptedEmailServicePassword = await encryptEmailPassword(
      emailServicePassword,
      providerPassword
    );
    if (!encryptedEmailServicePassword) {
      return res.status(500).json({
        status: "error",
        message: "Failed to encrypt email service password.",
      });
    }

    provider.senderName = senderName;
    provider.emailServiceAddress = emailServiceAddress;
    provider.emailServiceName = emailServiceName;
    provider.emailServicePassword = encryptedEmailServicePassword;

    await provider.save();

    return res.status(200).json({
      status: "success",
      message: "Email service details set successfully.",
      data: {
        provider,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const sendNewsletter = async (req, res) => {
  const { senderName, subject, content, providerPassword } = req.body;
  const senderId = req.user.userId;
  try {
    const { error, value } = sendNewsletterSchema.validate({
      senderName,
      subject,
      content,
      providerPassword,
      senderId: senderId?.toString(),
    });
    if (error) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }
    const sender = await User.findById(senderId);

    if (
      !sender ||
      !sender.roles ||
      (!sender.roles.includes("newsletterProvider") &&
        !sender.roles.includes("newsletterProviderWorker"))
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

    const providerId = sender.newsletterProviderId;
    if (!providerId) {
      return res.status(400).json({
        status: "fail",
        message: "You do not have a newsletter provider ID.",
      });
    }

    const provider = await NewsletterProvider.findById(providerId).select(
      "+emailServicePassword"
    );
    if (!provider) {
      return res.status(404).json({
        status: "fail",
        message: "Newsletter provider not found.",
      });
    }

    if (
      !provider.emailServiceAddress ||
      !provider.emailServicePassword ||
      !provider.emailServiceName
    ) {
      return res.status(400).json({
        status: "fail",
        message:
          "Provider email service details are not set. Please set them up before sending newsletters.",
      });
    }

    const subscribers = await NewsletterSubscription.find({
      newsletterIds: { $in: [providerId] },
    });

    if (subscribers.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No subscribers found for this newsletter provider.",
      });
    }

    const decryptedEmailServicePassword = await decryptEmailPassword(
      provider.emailServicePassword,
      providerPassword
    );

    const newsletterPromises = await subscribers.map((subscriber) =>
      newsletterSend(
        senderName ? senderName : provider.senderName,
        provider.emailServiceAddress,
        subscriber.email,
        decryptedEmailServicePassword,
        provider.emailServiceName,
        subject,
        content
      )
    );

    if (newsletterPromises.length === 0) {
      return res.status(404).json({
        status: "fail",
        message:
          "There are problems with the newsletter service configuration.",
      });
    }

    await Promise.all(newsletterPromises);

    return res.status(200).json({
      status: "success",
      message: "Newsletter sent successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
