import express from "express";
import taskControllers from "../controllers/task.controller";
import { verifyToken } from "../middlewares/verifyToken.middleware";
import checkMissingFields from "../middlewares/checkMissingFields.middleware";

const taskRouter = express.Router();

taskRouter.post(
  "/create",
  verifyToken,
  checkMissingFields.createTask,
  taskControllers.createTask
);

taskRouter.get("/all", verifyToken, taskControllers.getAllTasks);
taskRouter.get("/my-tasks", verifyToken, taskControllers.getMyTasks);
taskRouter.patch("/update/:slug", verifyToken, taskControllers.updateTask);
taskRouter.delete("/delete/:slug", verifyToken, taskControllers.deleteTask);

export default taskRouter;
