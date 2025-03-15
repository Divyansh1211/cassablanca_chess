import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtSecret } from "./index";

export const authMiddleware = async (req : Request, res: Response, next: NextFunction) =>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        const decoded = jwt.verify(token, JwtSecret!);
        req.user = decoded;
        next();
    } catch (e: any) {
        res.status(401).json({ error: e.message });
    }
}