import express from "express";
import { createOrUpdateUser } from "../controllers/user.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

// ✅ protected
router.post("/", verifyAuth, createOrUpdateUser);

export default router;
