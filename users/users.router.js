import express, { Router } from "express";
import {
  deleteAccount,
  updateMyUserInfo,
  getUser,
  getAllUsers,
  getMyUserInfo,
} from "./users.controller.js";
import {
  createUserApiKey,
  getMyApiKey,
  updateMyApiKey,
  deleteMyApiKey,
  checkUserApiKeyExists,
} from "./apikeys/apikey.controller.js";
import { apiKeyUserMiddleware, identifier } from "../middlewares/index.js";

const userRouter = Router();

// Users routes
userRouter.get("", identifier, getAllUsers);

userRouter.get("/me", apiKeyUserMiddleware, identifier, getMyUserInfo);

userRouter.patch("/me", identifier, updateMyUserInfo);

userRouter.get("/one", identifier, getUser);

userRouter.delete("/one", identifier, deleteAccount);

// API Key routes
userRouter.get("/apikey", identifier, getMyApiKey);

userRouter.post("/apikey", identifier, createUserApiKey);

userRouter.patch("/apikey", identifier, updateMyApiKey);

userRouter.delete("/apikey", identifier, deleteMyApiKey);

userRouter.get("/apikey/check", apiKeyUserMiddleware, checkUserApiKeyExists);

export default userRouter;
export { userRouter };
