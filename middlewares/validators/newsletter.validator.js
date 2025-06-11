import Joi from "joi";
import { emailSchema, nameSchema } from "./validator.js";

export const newsletterSubscriptionSchema = Joi.object({
  name: nameSchema,
  email: emailSchema,
  providerId: Joi.string().required().trim().messages({
    "string.empty": "Provider ID is required.",
    "any.required": "Provider ID is required.",
  }),
});

export const newsletterProviderSchema = Joi.object({
  providerName: nameSchema,
  providerEmail: emailSchema,
});
