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
} from "./auth.controller.js";

import { identifier } from "../../middlewares/index.js";

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

authRouter.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth router is working fine.",
  });
});

export default authRouter;
export { authRouter };
