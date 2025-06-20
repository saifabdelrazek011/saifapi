import Joi from "joi";

export const createShortUrlSchema = Joi.object({
  fullUrl: Joi.string().uri().required().messages({}),
  shortUrl: Joi.string().optional(),
});
