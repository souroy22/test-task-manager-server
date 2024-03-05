import { Request, Response } from "express";
import User from "../models/user.model";
import getUserData, { USER_TYPE } from "../utils/getUser.util";

const userControllers = {
  getAllUsers: async (req: Request, res: Response) => {
    try {
      let { limit = 10, page = 1, searchVal } = req.query;
      let filter: any = {};
      if (searchVal && String(searchVal).trim()) {
        filter = {
          $or: [
            { name: { $regex: searchVal, $options: "i" } }, // Case-insensitive match for name
            { email: { $regex: searchVal, $options: "i" } }, // Case-insensitive match for email
          ],
        };
      }
      limit = Math.abs(Number(limit));
      let pageCount = (Math.abs(Number(page)) || 1) - 1;
      const totalCount = await User.countDocuments();
      const users = await User.find(filter)
        // .limit(limit)
        // .skip(limit * pageCount)
        .select({ name: 1, email: 1, _id: 0 });
      return res.status(200).json({ users, totalCount });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  getUserData: async (req: Request, res: Response) => {
    try {
      const isExist = await getUserData(req.user.user.email);
      if (!isExist) {
        return res.status(404).json({ error: "No such user found!" });
      }
      const user: USER_TYPE = {
        name: isExist.name,
        email: isExist.email,
        avatar: isExist.avatar || null,
      };
      return res.status(200).json({ user });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong" });
      }
    }
  },
};

export default userControllers;
