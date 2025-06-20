import mongoose from "mongoose";
import { USERS_DB_URI, DB_NAME } from "../config/index.js";

const options = {
  dbName: DB_NAME,
};

const userDB = mongoose.createConnection(USERS_DB_URI, options);

userDB.on("error", (err) => console.error("User DB connection error:", err));

userDB.on("connected", () => {
  console.log("User DB connected successfully");
});

export { userDB };
export default userDB;
