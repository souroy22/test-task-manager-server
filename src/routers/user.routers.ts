import express from "express";
import { verifyToken } from "../middlewares/verifyToken.middleware";
import userControllers from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.get("/all", verifyToken, userControllers.getAllUsers);
userRouter.get("/get-user", verifyToken, userControllers.getUserData);

export default userRouter;
