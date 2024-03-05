import { Request, Response } from "express";
import User from "../models/user.model.ts";
import getUserData from "../utils/getUser.util.ts";
import verifyPassword from "../utils/verifyPassword.util.ts";
import genarateToken from "../utils/generateToken.util.ts";
import destroyToken from "../utils/destroyToken.util.ts";
import { STATUS_TYPE } from "../models/task.model.ts";

type TASK_TYPE = {
  name: string;
  description: string;
  slug: string;
  status: STATUS_TYPE;
  startDate: string;
  endDate: string;
  assignedUser: {
    name: string;
  };
  createdBy: {
    name: string;
  };
};

interface USER_TYPE {
  name: string;
  email: string;
  avatar: string | null;
  assignedTasks?: [TASK_TYPE];
}

const authControllers = {
  signup: async (req: Request, res: Response) => {
    try {
      const { name, email, password, avatar = null } = req.body;
      const isExist = await getUserData(email);
      if (isExist !== null) {
        return res
          .status(400)
          .json({ error: "This mail id is already exist." });
      }
      let newUser = new User({ name, email, password, avatar });
      newUser = await newUser.save();
      const user: USER_TYPE = {
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar || null,
      };
      const token = await genarateToken({ id: newUser._id, email: user.email });
      return res.status(200).json({
        user,
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  signin: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const isExist = await getUserData(email);
      if (isExist === null) {
        return res.status(404).json({ error: "This mailid doesn't exists" });
      }
      if (!verifyPassword(password, isExist.password)) {
        return res
          .status(401)
          .json({ error: "EmailId or password doesn't match" });
      }
      const user: USER_TYPE = {
        name: isExist.name,
        email: isExist.email,
        avatar: isExist.avatar || null,
      };
      const token = await genarateToken({ id: isExist._id, email: user.email });
      return res.status(200).json({
        user,
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  signout: async (req: Request, res: Response) => {
    try {
      await destroyToken(req);
      return res.status(200).json({ msg: "Successfully logged out!" });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong" });
      }
    }
  },
};

export default authControllers;
