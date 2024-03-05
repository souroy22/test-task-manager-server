import express from "express";
import authControllers from "../controllers/auth.controller";
import checkMissingFields from "../middlewares/checkMissingFields.middleware";
import { verifyToken } from "../middlewares/verifyToken.middleware";

const authRouter = express.Router();

authRouter.post("/signup", checkMissingFields.signup, authControllers.signup);
authRouter.post("/signin", checkMissingFields.signin, authControllers.signin);
authRouter.get("/signout", verifyToken, authControllers.signout);

export default authRouter;
