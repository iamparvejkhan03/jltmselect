import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import {
    addMembers,
    getMyMembers,
    getMemberStatus,
} from "../controllers/member.controller.js";

const memberRouter = Router();

// All routes require authentication
memberRouter.use(auth);

// Add member(s)
memberRouter.post("/add", addMembers);

// Get user's members
memberRouter.get("/my-members", getMyMembers);

// Get member status (can add, remaining slots, etc.)
memberRouter.get("/status", getMemberStatus);

export default memberRouter;