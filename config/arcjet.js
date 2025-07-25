import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ARCJET_KEY, ARCJET_ENV } from "./env.js";

const arcjetEnv = ARCJET_ENV || "production";

const aj = arcjet({
  key: ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),

    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:SOCIAL",
        "POSTMAN",
        "JAVASCRIPT_AXIOS",
        "CURL",
        "HTTP_CLIENT",
        "API_CLIENT",
        "KUMA_MONITOR",
      ],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: arcjetEnv === "development" ? 10 : 60, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

export default aj;
export { aj };
