import mongoose from "mongoose";
import {
  USERS_DB_URI,
  POSTS_DB_URI,
  SHORTURLS_DB_URI,
  SUBSCRIPTIONS_DB_URI,
  DB_NAME,
} from "../config/env.js";

const options = {
  dbName: DB_NAME,
};

const userDB = mongoose.createConnection(USERS_DB_URI, options);

userDB.on("error", (err) => console.error("User DB connection error:", err));

const postsDB = mongoose.createConnection(POSTS_DB_URI, options);

postsDB.on("error", (err) => console.error("Posts DB connection error:", err));

const shortUrlDB = mongoose.createConnection(SHORTURLS_DB_URI, options);

shortUrlDB.on("error", (err) =>
  console.error("Short URL DB connection error:", err)
);

const subscriptionDB = mongoose.createConnection(SUBSCRIPTIONS_DB_URI, options);

subscriptionDB.on("error", (err) =>
  console.error("Subscription DB connection error:", err)
);

if (
  !USERS_DB_URI ||
  !POSTS_DB_URI ||
  !SHORTURLS_DB_URI ||
  !SUBSCRIPTIONS_DB_URI
) {
  console.error("Database URIs are not set in the environment variables.");
}
if (!DB_NAME) {
  console.error("Database name is not set in the environment variables.");
}

if (!userDB || !postsDB || !shortUrlDB || !subscriptionDB) {
  console.error("Failed to create database connections.");
} else {
  console.log("Database connections established successfully.");
}

export { userDB, postsDB, shortUrlDB, subscriptionDB };
