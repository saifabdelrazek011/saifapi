import { userApiKey } from "../users.model.js";
import { createAPIKEY, encryptApiKey, decryptApiKey } from "./apikey.utils.js";

import { hmacProcess, doHash } from "../../utils/index.js";

// Handling Users API Keys
export const createUserApiKey = async (req, res) => {
  const { userId } = req.user;
  if (!userId) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized user",
    });
  }
  try {
    const apiKey = await createAPIKEY();
    const lookupHash = await hmacProcess(apiKey);
    const encryptedApiKey = await encryptApiKey(apiKey);
    const hashedApiKey = await doHash(apiKey);

    if (!apiKey) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create API key",
      });
    }

    if (!hashedApiKey || !encryptedApiKey || !lookupHash) {
      return res.status(500).json({
        status: "error",
        message: "Failed to hash or encrypt API key",
      });
    }
    const existingApiKey = await userApiKey.findOne({ userId });

    if (existingApiKey) {
      return res.status(400).json({
        status: "error",
        message: "You could only have one API key",
      });
    }

    const newApiKey = new userApiKey({
      userId,
      lookupHash,
      encryptedApiKey,
      hashedApiKey,
    });

    await newApiKey.save();

    res.status(201).json({
      status: "success",
      message: "API key created successfully",
      apiKey: apiKey,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getMyApiKey = async (req, res) => {
  const { userId } = req.user;
  try {
    const existingApiKey = await userApiKey.findOne({ userId });
    if (!existingApiKey) {
      return res.status(404).json({
        status: "error",
        message: "API key not found",
      });
    }

    const decryptedApiKey = await decryptApiKey(existingApiKey.encryptedApiKey);

    if (!decryptedApiKey) {
      return res.status(500).json({
        status: "error",
        message: "Failed to decrypt API key",
      });
    }

    res.status(200).json({
      status: "success",
      message: "API key retrieved successfully",
      apiKey: decryptedApiKey,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const deleteMyApiKey = async (req, res) => {
  const { userId } = req.user;
  try {
    const existingApiKey = await userApiKey.findOne({ userId });
    if (!existingApiKey) {
      return res.status(404).json({
        status: "error",
        message: "API key not found",
      });
    }
    await userApiKey.deleteOne({ userId });
    res.status(200).json({
      status: "success",
      message: "API key deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateMyApiKey = async (req, res) => {
  const { userId } = req.user;
  try {
    const existingApiKey = await userApiKey.findOne({ userId });
    if (!existingApiKey) {
      return res.status(404).json({
        status: "error",
        message: "API key not found",
      });
    }
    const newApiKey = await createAPIKEY();
    const encryptedApiKey = await encryptApiKey(newApiKey);
    const hashedApiKey = await doHash(newApiKey);
    if (!newApiKey) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create new API key",
      });
    }
    if (!hashedApiKey || !encryptedApiKey) {
      return res.status(500).json({
        status: "error",
        message: "Failed to hash or encrypt new API key",
      });
    }
    existingApiKey.encryptedApiKey = encryptedApiKey;
    existingApiKey.hashedApiKey = hashedApiKey;
    await existingApiKey.save();
    res.status(200).json({
      status: "success",
      message: "API key updated successfully",
      apiKey: newApiKey,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
