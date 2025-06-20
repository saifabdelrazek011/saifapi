import Joi from "joi";
import {
  emailSchema,
  idSchema,
  nameSchema,
  passwordSchema,
} from "../middlewares/index.js";

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
  providerPassword: passwordSchema,
  providerId: idSchema,
});

export const setEmailServiceDetailsSchema = Joi.object({
  senderName: nameSchema,
  emailServiceAddress: emailSchema,
  emailServicePassword: Joi.string().required(),
  emailServiceName: Joi.string().required(),
  providerPassword: passwordSchema,
  viewerId: idSchema,
});

export const sendNewsletterSchema = Joi.object({
  senderName: Joi.string().optional(),
  subject: Joi.string().required(),
  content: Joi.string().required().min(50),
  providerPassword: passwordSchema,
  senderId: idSchema,
});
