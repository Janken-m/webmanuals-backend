import { Errback, NextFunction, Request, Response } from "express";

const error = (
  error: Errback,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(error);
  res.status(500).send("Internal server error");
};

export default error;
