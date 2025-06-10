import Joi from "joi";
import { emailSchema, nameSchema } from "./validator.js";

export const newsletterSubscriptionSchema = Joi.object({
  name: nameSchema,
  email: emailSchema,
});
