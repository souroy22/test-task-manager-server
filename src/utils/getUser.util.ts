import User from "../models/user.model";

export type USER_TYPE = {};

const getUserData = async (email: string) => {
  const user = await User.findOne({ email });
  // .populate({
  //   path: "assignedTasks",
  //   select:
  //     "name description startDate endDate status assignedUser createdBy slug -_id",
  //   populate: [
  //     { path: "createdBy", select: "name -_id" },
  //     { path: "assignedUser", select: "name -_id" },
  //   ],
  // });

  const newUserData: any = JSON.parse(JSON.stringify(user));

  return newUserData ? newUserData : null;
};

export default getUserData;
