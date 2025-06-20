import mongoose from "mongoose";
import { SUBSCRIPTIONS_DB_URI, DB_NAME } from "../config/index.js";
const options = {
  dbName: DB_NAME,
};

const subscriptionDB = mongoose.createConnection(SUBSCRIPTIONS_DB_URI, options);

subscriptionDB.on("error", (err) =>
  console.error("Subscription DB connection error:", err)
);

subscriptionDB.on("connected", () =>
  console.log("Subscription DB connected successfully")
);
if (!DB_NAME) {
  console.error("Database name is not set in the environment variables.");
}
if (!SUBSCRIPTIONS_DB_URI) {
  console.error(
    "SUBSCRIPTIONS_DB_URI is not set in the environment variables."
  );
}
export default subscriptionDB;
export { subscriptionDB };
