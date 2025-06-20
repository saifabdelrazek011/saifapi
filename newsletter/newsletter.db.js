import mongoose from "mongoose";
import { NEWSLETTERS_DB_URI, DB_NAME } from "../config/index.js";
const options = {
  dbName: DB_NAME,
};

const newsletterDB = mongoose.createConnection(NEWSLETTERS_DB_URI, options);

newsletterDB.on("error", (err) =>
  console.error("Newsletter DB connection error:", err)
);

newsletterDB.on("connected", () =>
  console.log("Newsletter DB connected successfully")
);

if (!DB_NAME) {
  console.error("Database name is not set in the environment variables.");
}

if (!NEWSLETTERS_DB_URI) {
  console.error("NEWSLETTERS_DB_URI is not set in the environment variables.");
}

export default newsletterDB;
export { newsletterDB };
