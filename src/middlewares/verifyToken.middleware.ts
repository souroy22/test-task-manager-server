import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    // console.log("authHeader", authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: "Please provide token" });
    }
    const token = authHeader.split(" ")[1];
    req.token = token;
    await jwt.verify(
      token,
      process.env.SECRET_KEY || "",
      async (error, user: any) => {
        if (error) {
          return res.status(401).json({ error: "Invalid token" });
        }
        req.user = user;
        const isUserExist = await User.findById(req.user.user.id);
        if (!isUserExist) {
          console.log("Error", error);
          return res.status(401).json({ error: "Invalid token" });
        }
        next();
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
      return res.status(500).json({ error: "Something went wrong!" });
    }
  }
};
