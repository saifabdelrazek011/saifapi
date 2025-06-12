import crypto from "crypto";
import {
  API_KEY_ENCRYPTION_SECRET,
  API_KEY_ENCRYPTION_ALGORITHM,
  API_KEY_ENCRYPTION_IV_LENGTH,
} from "../config/env.js";

// Encryption and Decryption for API Keys
const algorithm = API_KEY_ENCRYPTION_ALGORITHM;
const key = API_KEY_ENCRYPTION_SECRET;
const iv = crypto.randomBytes(parseInt(API_KEY_ENCRYPTION_IV_LENGTH));

export const createAPIKEY = async () => {
  const apiKey = crypto.randomBytes(32).toString("hex");
  return apiKey;
};

export const encryptApiKey = (apiKey) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decryptApiKey = (encryptedApiKey) => {
  const [ivHex, encryptedText] = encryptedApiKey.split(":");
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
