import Joi from "joi";

export const createPostSchema = Joi.object({
  title: Joi.string().required().trim().messages({
    "string.empty": "Title is required.",
    "any.required": "Title is required.",
  }),
  description: Joi.string().min(50).required().trim().messages({
    "string.empty": "Description is required.",
    "any.required": "Description is required.",
    "string.min": "Description must be at least 50 characters long.",
  }),
  userId: Joi.string().required().trim().messages({
    "string.empty": "User ID is required.",
    "any.required": "User ID is required.",
  }),
});
