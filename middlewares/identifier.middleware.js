import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const identifier = (req, res, next) => {
  let token;
  if (req.headers.client === "not-browser") {
    token = req.headers.authorization.split(" ")[1];
  } else {
    token = req.cookies["Authorization"];
  }

  if (!token) {
    next({
      status: 403,
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  try {
    const userToken = token.split(" ")[1];
    const jwtVerified = jwt.verify(userToken, JWT_SECRET);
    if (jwtVerified) {
      req.user = jwtVerified;
      next();
    } else {
      next({
        status: 403,
        success: false,
        message: "Unauthorized",
      });
      return;
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default identifier;
