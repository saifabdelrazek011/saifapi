import { createHmac } from "crypto";
import { compare, hash } from "bcryptjs";

import { HASH_SALT } from "../config/env.js";

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

export const hmacProcess = (value, key) => {
  return createHmac("sha256", key).update(value).digest("hex");
};
