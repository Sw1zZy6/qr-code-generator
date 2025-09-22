// backend/src/routes/stripeRoutes.js
import express from "express";
import { createCheckoutSession } from "../controllers/stripe.js";

const router = express.Router();

router.post("/checkout", createCheckoutSession);

export default router;
