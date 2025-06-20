import crypto, { createHmac } from "crypto";
import { compare, hash } from "bcryptjs";

import { HASH_SALT, HMAC_SECRET } from "../config/index.js";

export const doHash = (value) => {
  const salt = parseInt(HASH_SALT);
  if (isNaN(salt) || salt <= 0) {
    throw new Error("Invalid HASH_SALT value. It must be a positive integer.");
  }
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("Value to hash must be a non-empty string.");
  }
  return hash(value, salt);
};

export const doHashValidation = (plainValue, hashedValue) => {
  return compare(plainValue, hashedValue);
};

export const hmacProcess = (value) => {
  return createHmac("sha256", HMAC_SECRET).update(value).digest("hex");
};

// Derive a key from the provider password
function getKeyFromPassword(password) {
  // Use a salt in production!
  return crypto.createHash("sha256").update(password).digest();
}

export function encryptEmailPassword(emailPassword, providerPassword) {
  const key = getKeyFromPassword(providerPassword);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(emailPassword, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  // Store iv + encrypted data as hex
  return iv.toString("hex") + encrypted.toString("hex");
}

export function decryptEmailPassword(encrypted, providerPassword) {
  const key = getKeyFromPassword(providerPassword);
  const iv = Buffer.from(encrypted.slice(0, 32), "hex");
  const encryptedText = Buffer.from(encrypted.slice(32), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
