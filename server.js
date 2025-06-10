// Import dependencies
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import methodOverride from "method-override";

// Import routers
import authRouter from "./routers/auth.router.js";
import postsRouter from "./routers/posts.router.js";
import shorturlsRouter from "./routers/shorturls.router.js";
import subscriptionRouter from "./routers/subscription.routes.js";
//import newsletterRouter from "./routers/newsletter.router.js";

// Import middlewares
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import { PORT } from "./config/env.js";

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

app.use("/v1/auth", arcjetMiddleware, authRouter);
app.use("/v1/posts", arcjetMiddleware, postsRouter);
app.use("/v1/shorturls", arcjetMiddleware, shorturlsRouter);
app.use("/v1/subscriptions", arcjetMiddleware, subscriptionRouter);
// app.use("/v1/newsletter", arcjetMiddleware, newsletterRouter);

app.get("/", (req, res) => {
  res.render("main-view", { title: "Welcome to the API" });
});

app.use((req, res) => {
  res.status(404).render("404-view", { title: "404 Not Found" });
});
app.listen(PORT || 3000, () => {
  console.log("Server is running on port " + PORT || 3000);
});
