import { User } from "./users.model.js";
import {
  deleteAccountSchema,
  updateUserInfoSchema,
} from "./users.validation.js";
import { emailSchema } from "../middlewares/index.js";
import { SURE_MESSAGE } from "../config/index.js";

import { doHashValidation } from "../utils/index.js";

// User Management Controllers
export const getMyUserInfo = async (req, res) => {
  const user = req.user;
  try {
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Information
export const updateMyUserInfo = async (req, res) => {
  const updater = req.user;
  const { firstName, lastName, email, username } = req.body;

  try {
    if (!updater) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    if (!firstName && !email && !username && !lastName) {
      return res.status(400).json({
        success: false,
        message: "You Should provide any field to update",
      });
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

    // Fill in missing fields with existing values
    if (firstName === "") {
      firstName = updater.firstName ? updater.firstName : "";
    }
    if (email === "") {
      email = updater.email ? updater.email : "";
    }
    if (username === "") {
      username = updater.username ? updater.username : "";
    }

    const updatedUser = await User.findByIdAndUpdate(
      updater._id,
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
  const user = req.user;
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

    const compareIds = user._id.toString() === existingUser._id.toString();

    if (!compareIds) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized to delete this account",
      });
    }

    await User.findByIdAndDelete(user._id);
    return res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Controllers
export const getUser = async (req, res) => {
  const viewer = req.user;
  const { email } = req.body;
  try {
    const { error, value } = emailSchema.validate(email);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

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
  const viewUser = req.user;
  try {
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
