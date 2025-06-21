import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/index.js";
import { User } from "../users/index.js";

export const identifier = async (req, res, next) => {
  if (req.user) {
    next();
    return;
  }

  let token;
  if (req.headers.client === "not-browser") {
    token = req.headers.authorization.split(" ")[1];
  } else {
    token = req.cookies["Authorization"];
  }

  if (!token) {
    return res.status(403).json({
      status: 403,
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const userToken = token.split(" ")[1];
    const jwtVerified = jwt.verify(userToken, JWT_SECRET);

    if (jwtVerified) {
      const user = await User.findById(jwtVerified.userId).select("+password");
      if (!user) {
        return res.status(404).json({
          status: 404,
          success: false,
          message: "User not found",
        });
      }
      if (user.isBanned) {
        return res.status(403).json({
          success: false,
          message: "Your account has been banned",
        });
      }
      req.user = user;
      next();
    } else {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default identifier;
