import Joi from "joi";
import {
  emailSchema,
  idSchema,
  nameSchema,
  passwordSchema,
} from "./validator.js";

export const newsletterSubscriptionSchema = Joi.object({
  name: nameSchema,
  email: emailSchema,
  providerId: idSchema,
});

export const newsletterProviderSchema = Joi.object({
  providerName: nameSchema,
  providerEmail: emailSchema,
  providerPassword: passwordSchema,
});

export const setUserAsProviderSchema = Joi.object({
  email: emailSchema,
  providerId: idSchema,
});
