import { Request, Response } from "express";
import ShortUniqueId from "short-unique-id";
import slugify from "slugify";
import Task, { ITask, STATUS_TYPE } from "../models/task.model";
import User from "../models/user.model";

type BODY_TYPE = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  userEmail: string;
  status: STATUS_TYPE;
};

type FILTERS_TYPE = {
  status?: string;
  id?: string;
};

const uid = new ShortUniqueId({ length: 4 });
const taskControllers = {
  createTask: async (req: Request, res: Response) => {
    try {
      const {
        name,
        description,
        startDate,
        endDate,
        userEmail,
        status = "TODO",
      }: BODY_TYPE = req.body;
      let slug: string = slugify(name, { lower: true });
      const existingTask = await Task.findOne({ slug });
      if (existingTask) {
        slug = slug + "-" + uid.rnd();
      }
      const assignedUser = await User.findOne({ email: userEmail });
      if (!assignedUser) {
        return res.status(404).json({
          error: "No such user found",
        });
      }
      const newTask = new Task({
        name,
        description,
        startDate,
        endDate,
        status,
        slug,
        assignedUser: assignedUser._id,
        createdBy: req.user.user.id,
      });
      await newTask.save();
      // await User.findByIdAndUpdate(
      //   assignedUser._id,
      //   {
      //     $push: { assignedTasks: newTask._id },
      //   },
      //   { new: true }
      // );
      const task = {
        name,
        description,
        startDate,
        endDate,
        status,
        slug,
        assignedUser: { name: assignedUser.name, email: assignedUser.email },
      };
      return res.status(200).json(task);
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  getAllTasks: async (req: Request, res: Response) => {
    try {
      let { limit = 10, page = 1, status } = req.query;
      const filters: FILTERS_TYPE = {};
      if (status) {
        filters["status"] = String(status);
      }
      limit = Math.abs(Number(limit));
      let pageCount = (Math.abs(Number(page)) || 1) - 1;
      const totalCount = await Task.countDocuments(filters);
      const tasks = await Task.find(filters)
        .limit(limit)
        .skip(limit * pageCount)
        .select({
          name: 1,
          description: 1,
          startDate: 1,
          slug: 1,
          status: 1,
          endDate: 1,
          createdBy: 1,
          assignedUser: 1,
          _id: 0,
        })
        .populate([
          { path: "createdBy", select: "name -_id" },
          { path: "assignedUser", select: "name email -_id" },
        ])
        .sort({ updatedAt: -1 });
      const tasksWithoutIds = tasks.map((task) => {
        const taskObject = task.toObject() as { _id?: any };
        if ("_id" in taskObject) {
          delete taskObject._id;
        }
        return taskObject;
      });
      return res.status(200).json({ tasks: tasksWithoutIds, totalCount });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  getMyTasks: async (req: Request, res: Response) => {
    try {
      let { limit = 10, page = 1, status } = req.query;
      limit = Math.abs(Number(limit));
      let pageCount = (Math.abs(Number(page)) || 1) - 1;
      const totalCount = await Task.countDocuments({
        assignedUser: req.user.user.id,
      });
      const tasks = await Task.find({ assignedUser: req.user.user.id })
        .select({
          name: 1,
          description: 1,
          startDate: 1,
          endDate: 1,
          status: 1,
          slug: 1,
          assignedUser: 1,
          createdBy: 1,
          assignedTasks: 1,
          _id: 0,
        })
        .populate([
          { path: "assignedUser", select: "name email -_id" },
          { path: "createdBy", select: "name -_id" },
        ])

        .sort({ updatedAt: -1 });
      return res.status(200).json({ tasks: tasks, totalCount });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  updateTask: async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const requestBody: any = req.body;
    if (req.body.userEmail) {
      const user = await User.findOne({ email: req.body.userEmail });
      if (!user) {
        return res
          .status(404)
          .json({ message: "No such assigned user found!" });
      }
      requestBody["assignedUser"] = user._id;
    }
    try {
      const task = await Task.findOne({ slug });
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const validFields = Object.keys(requestBody).filter(
        (key) => key in task && key !== "_id" && key !== "__v"
      );
      validFields.forEach((key) => {
        (task[key as keyof ITask] as any) = requestBody[key];
      });
      await task.save();
      const updatedTask: any = task.toObject();
      delete updatedTask._id;
      return res.status(200).json(updatedTask);
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  deleteTask: async (req: Request, res: Response) => {
    const slug = req.params.slug;
    try {
      const deletedTask = await Task.findOneAndDelete({ slug });
      await User.findByIdAndUpdate(deletedTask?.assignedUser, {
        $pop: { assignedTasks: deletedTask?._id },
      });
      return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
};

export default taskControllers;
