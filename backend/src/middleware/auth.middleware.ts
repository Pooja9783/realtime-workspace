import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check token exists
    if (!authHeader) {
      return res.status(401).json({ message: "No Token Provided" });
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
    // 4. attach User to request
    (req as any).user = decoded;

    next(); // move to next
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
