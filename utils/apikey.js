import crypto from "crypto";
import { API_KEY_ENCRYPTION_SECRET } from "../config/env.js";

const algorithm = "aes-256-cbc";
const key = Buffer.from(API_KEY_ENCRYPTION_SECRET, "hex"); // 64 hex chars = 32 bytes

if (key.length !== 32) {
  throw new Error(
    "API_KEY_ENCRYPTION_SECRET must be a 64-character hex string."
  );
}

export const createAPIKEY = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const encryptApiKey = (apiKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(apiKey, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const encryptedApiKey = iv.toString("hex") + encrypted.toString("hex");
  return encryptedApiKey;
};

export const decryptApiKey = (apiKey) => {
  const iv = Buffer.from(apiKey.slice(0, 32), "hex");
  const encryptedText = Buffer.from(apiKey.slice(32), "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
