// Import dependencies
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import methodOverride from "method-override";

// Import routers
import { authRouter, userRouter } from "./users/index.js";
import { postsRouter } from "./posts/index.js";
import { shortUrlsRouter } from "./shorturls/index.js";
import { subscriptionRouter } from "./subscription/index.js";
import { newsletterRouter } from "./newsletter/index.js";

// Import middlewares
import { arcjetMiddleware } from "./middlewares/index.js";
import { NODE_ENV, PORT, ARCJET_ENV } from "./config/index.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin:
      NODE_ENV === "production"
        ? (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);

            // Regex to match your domain and all subdomains
            const allowed = /\.?saifdev\.xyz$/;
            if (allowed.test(new URL(origin).hostname)) {
              return callback(null, true);
            }
            callback(new Error("Not allowed by CORS"));
          }
        : (origin, callback) => {
            // Allow all localhost origins in development
            if (!origin) return callback(null, true);
            try {
              const { hostname } = new URL(origin);
              if (hostname === "localhost" || hostname === "127.0.0.1") {
                return callback(null, true);
              }
            } catch (e) {
              // Invalid origin, reject
            }
            callback(new Error("Not allowed by CORS"));
          },
    credentials: true,
  })
);
// Allow Access short URLs from any origin
app.use("/v1/shorturls", cors({ origin: true, credentials: false }));

// Security headers
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", true);
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

app.use("/v1/auth", arcjetMiddleware, authRouter);
app.use("/v1/users", arcjetMiddleware, userRouter);
app.use("/v1/posts", arcjetMiddleware, postsRouter);
app.use("/v1/shorturls", arcjetMiddleware, shortUrlsRouter);
app.use("/v1/subscriptions", arcjetMiddleware, subscriptionRouter);
app.use("/v1/newsletter", arcjetMiddleware, newsletterRouter);

app.get("/", (req, res) => {
  res.render("main-view", { title: "Welcome to the API" });
});

app.use((req, res) => {
  res.status(404).render("404-view", { title: "404 Not Found" });
});

app.listen(PORT || 3000, () => {
  console.log("Server is running on port " + (PORT || 3000));
  console.log("Environment: " + NODE_ENV);
  console.log("Arcjet Environment: " + ARCJET_ENV);
});
