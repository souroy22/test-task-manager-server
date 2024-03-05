import mongoose, { Types } from "mongoose";

export type STATUS_TYPE = "TODO" | "IN_PROGRESS" | "DONE";

export interface ITask extends Document {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: STATUS_TYPE;
  slug: string;
  assignedUser: Types.ObjectId;
  createdBy: Types.ObjectId;
}

const taskSchema = new mongoose.Schema<ITask>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },
    endDate: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;
