import express from "express";
import authRouter from "./auth.routers";
import taskRouter from "./task.routers";
import userRouter from "./user.routers";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/task", taskRouter);
router.use("/user", userRouter);

export default router;
