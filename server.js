// Import dependencies
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoose from "mongoose";
import methodOverride from "method-override";

// Import routers
import authRouter from "./routers/auth.router.js";
import postsRouter from "./routers/posts.router.js";
import shorturlsRouter from "./routers/shorturls.router.js";
import subscriptionRouter from "./routers/subscription.routes.js";

// Import middlewares
import arcjectMiddleware from "./middlewares/arcjet.middleware.js";
import { MONGODB_URI, PORT } from "./config/env.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.use("/v1/auth", arcjectMiddleware, authRouter);
app.use("/v1/posts", arcjectMiddleware, postsRouter);
app.use("/v1/shorturls", arcjectMiddleware, shorturlsRouter);
app.use("/v1/subscriptions", arcjectMiddleware, subscriptionRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the SaifAPI!");
});

app.listen(PORT || 3000, () => {
  console.log("Server is running on port " + PORT || 3000);
});
