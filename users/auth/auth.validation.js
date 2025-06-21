import Joi from "joi";
import { SURE_MESSAGE } from "../../config/index.js";
import {
  emailSchema,
  passwordSchema,
} from "../../middlewares/validators/index.js";

export const signupSchema = Joi.object({
  username: Joi.string().required().trim().min(3).max(20).messages({
    "string.empty": "Username is required.",
    "string.min": "Username must be at least 3 characters long.",
    "string.max": "Username must be at most 20 characters long.",
    "any.required": "Username is required.",
  }),
  firstName: Joi.string().required().trim().messages({
    "string.empty": "First name is required.",
    "any.required": "First name is required.",
  }),
  lastName: Joi.string().optional().trim().messages({
    "string.empty": "Last name cannot be empty.",
  }),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "string.empty": "Confirm password is required.",
    "any.required": "Confirm password is required.",
    "string.valid": "Passwords do not match.",
  }),
});

export const signinSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
});

export const acceptCodeSchema = Joi.object({
  email: emailSchema,
  providedCode: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema,
  confirmNewPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "string.empty": "Confirm password is required.",
      "any.required": "Confirm password is required.",
      "string.valid": "Passwords do not match.",
    }),
});

export const changeForgetedPasswordSchema = Joi.object({
  email: emailSchema,
  providedCode: Joi.string().required(),
  newPassword: passwordSchema,
});
