import { User } from "./users.model.js";
import { deleteAccountSchema } from "./auth/auth.validation.js";
import { emailSchema } from "../middlewares/index.js";
import { SURE_MESSAGE } from "../config/index.js";

import { doHashValidation } from "../utils/index.js";

// User Management Controllers
export const getMyUserInfo = async (req, res) => {
  const { userId } = req.user;
  try {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    const existingUser = await User.findById(userId).select("+password");
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      user: existingUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Information
export const updateMyUserInfo = async (req, res) => {
  const { userId } = req.user;
  const { firstName, lastName, email, username } = req.body;
  try {
    const updater = await User.findById(userId);

    if (!updater) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser._id.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized to update this account",
      });
    }

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const { error, value } = updateUserInfoSchema.validate({
      username,
      firstName,
      lastName,
      email,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const compareIds = userId === existingUser._id.toString();
    if (!compareIds) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized to update this account",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, firstName, lastName: lastName ? lastName : "", email },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Information
export const deleteAccount = async (req, res) => {
  const { email, password, sureMessage } = req.body;
  const { userId } = req.user;
  try {
    const { error, value } = deleteAccountSchema.validate({
      email,
      password,
      sureMessage,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await User.findOne({ email }).select("+password");

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
    const passwordMatch = await doHashValidation(
      password,
      existingUser.password
    );

    if (!passwordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    if (sureMessage !== SURE_MESSAGE) {
      return res.status(400).json({
        success: false,
        message: `Please type '${SURE_MESSAGE}' to confirm`,
      });
    }

    const compareIds = userId === existingUser._id.toString();

    if (!compareIds) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized to delete this account",
      });
    }

    await User.deleteOne({ _id: userId });
    return res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Controllers
export const getUser = async (req, res) => {
  const viewerId = req.user.userId;
  const { email } = req.body;
  try {
    const { error, value } = emailSchema.validate(email);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const viewer = await User.findById(viewerId);

    if (!viewer) {
      return res
        .status(404)
        .json({ success: false, message: "Viewer does not exist" });
    }

    if (viewer.roles.includes("superAdmin")) {
      const existingUser = await User.findOne({ email }).select(" +password");
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User does not exist" });
      }
      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        existingUser,
      });
    } else if (viewer.roles.includes("authAdmin") || viewer.email === email) {
      const existingUser = await User.findOne({ email }).select("+ +password");
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User does not exist" });
      }
      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        existingUser,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "You are not authorized to view this user",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  const viewerId = req.user.userId;
  try {
    const viewUser = await User.findById(viewerId);
    if (viewUser.roles.includes("authAdmin")) {
      const existingUsers = await User.find();
      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        existingUsers,
      });
    } else if (viewUser.roles.includes("superAdmin")) {
      const existingUsers = await User.find().select(" +password");
      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        existingUsers,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "You are not authorized to view this user",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
