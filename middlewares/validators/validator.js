import Joi from "joi";

export const nameSchema = Joi.string().required().messages({
  "string.empty": "Name is required.",
  "any.required": "Name is required.",
});

export const emailSchema = Joi.string().email().required().messages({
  "string.email": "Invalid email format.",
  "string.empty": "Email is required.",
  "any.required": "Email is required.",
});

export const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .required()
  .pattern(
    new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\\d!@#$%^&*(),.?":{}|<>]{8,}$'
    )
  )
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    "string.min": "Password must be at least 8 characters long.",
  });

export const idSchema = Joi.string().required().messages({
  "string.empty": "ID is required.",
  "any.required": "ID is required.",
});
