import Joi from "joi";
import { SURE_MESSAGE } from "../../config/env.js";
import { emailSchema, passwordSchema } from "./validator.js";

export const signupSchema = Joi.object({
  firstName: Joi.string().required().trim().messages({
    "string.empty": "First name is required.",
    "any.required": "First name is required.",
  }),
  lastName: Joi.string(),
  email: emailSchema,
  password: passwordSchema,
});
7;

export const signinSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});

export const deleteAccountSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  sureMessage: Joi.string().required().valid(SURE_MESSAGE).trim().messages({
    "string.empty": "Sure message is required.",
    "any.required": "Sure message is required.",
  }),
});

export const acceptCodeSchema = Joi.object({
  email: emailSchema,
  providedCode: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: passwordSchema,
});

export const changeForgetedPasswordSchema = Joi.object({
  email: emailSchema,
  providedCode: Joi.string().required(),
  newPassword: passwordSchema,
});

export const updateUserInfoSchema = Joi.object({
  firstName: Joi.string().required().trim().messages({
    "string.empty": "First name is required.",
    "any.required": "First name is required.",
  }),
  lastName: Joi.string(),
  email: emailSchema,
});
