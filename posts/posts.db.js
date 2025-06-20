import mongoose from "mongoose";
import { POSTS_DB_URI, DB_NAME } from "../config/index.js";
const options = {
  dbName: DB_NAME,
};

const postsDB = mongoose.createConnection(POSTS_DB_URI, options);

postsDB.on("error", (err) => console.error("Posts DB connection error:", err));

postsDB.on("connected", () => {
  console.log("Posts DB connected successfully");
});

if (!DB_NAME) {
  console.error("Database name is not set in the environment variables.");
}
if (!POSTS_DB_URI) {
  console.error("POSTS_DB_URI is not set in the environment variables.");
}
export default postsDB;
export { postsDB };
