// backend/src/routes/qr.js
import express from "express";
import { generateQR } from "../controllers/qr.js";

const router = express.Router();

router.post("/generate", generateQR);

export default router;
