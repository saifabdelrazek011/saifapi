import express from "express";
import {
  signup,
  signin,
  signout,
  verifyUser,
  changePassword,
  changeForgetedPassword,
  sendVerification,
  sendForgotPasswordCode,
  deleteAccount,
  updateUserInfo,
  getUser,
  getAllUsers,
  getMyUserInfo,
  createUserApiKey,
  getMyApiKey,
  updateMyApiKey,
  deleteMyApiKey,
} from "../controllers/auth.controller.js";

import { identifier } from "../middlewares/identifier.middleware.js";

const authRouter = express.Router();

// Authentication routes
authRouter.post("/signup", signup);

authRouter.post("/signin", signin);

authRouter.post("/signout", identifier, signout);

// Verification routes
authRouter.patch("/verification/send", identifier, sendVerification);

authRouter.patch("/verification/verify", identifier, verifyUser);

// Password routes
authRouter.patch("/password", identifier, changePassword);

authRouter.patch("/password/forget", sendForgotPasswordCode);

authRouter.patch("/password/reset", changeForgetedPassword);

// Users routes
authRouter.get("/users", identifier, getAllUsers);

authRouter.get("/users/me", identifier, getMyUserInfo);

authRouter.get("/users/one", identifier, getUser);

authRouter.patch("/users/one", identifier, updateUserInfo);

authRouter.delete("/users/one", identifier, deleteAccount);

// API Key routes
authRouter.get("/apikey", identifier, getMyApiKey);

authRouter.post("/apikey", identifier, createUserApiKey);

authRouter.patch("/apikey", identifier, updateMyApiKey);

authRouter.delete("/apikey", identifier, deleteMyApiKey);

authRouter.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth router is working fine.",
  });
});

export default authRouter;
