import { Request } from "express";

const destroyToken = async (req: Request) => {
  req.token = null;
};

export default destroyToken;
