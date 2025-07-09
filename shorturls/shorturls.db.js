import mongoose from "mongoose";
import { SHORTURLS_DB_URI, DB_NAME } from "../config/index.js";
const options = {
  dbName: DB_NAME,
};

if (!DB_NAME) {
  console.error("Database name is not set in the environment variables.");
}
if (!SHORTURLS_DB_URI) {
  console.error("SHORTURLS_DB_URI is not set in the environment variables.");
}

const shortUrlDB = mongoose.createConnection(SHORTURLS_DB_URI, options);

shortUrlDB.on("error", (err) =>
  console.error("Short URL DB connection error:", err)
);

shortUrlDB.on("connected", () =>
  console.log("Short URL DB connected successfully")
);
export default shortUrlDB;
export { shortUrlDB };
