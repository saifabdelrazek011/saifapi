import Joi from "joi";
import { SURE_MESSAGE } from "../config/index.js";
import {
  emailSchema,
  passwordSchema,
} from "../middlewares/validators/index.js";

export const deleteAccountSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
  sureMessage: Joi.string().required().valid(SURE_MESSAGE).trim().messages({
    "string.empty": "Sure message is required.",
    "any.required": "Sure message is required.",
  }),
});

export const updateUserInfoSchema = Joi.object({
  username: Joi.string().optional().trim().min(3).max(20).allow(""),
  firstName: Joi.string().optional().trim().allow(""),
  lastName: Joi.string().optional().trim().allow(""),
  email: Joi.string().email().optional().trim().allow(""),
});
