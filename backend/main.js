// backend/src/main.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import qrRoutes from "./routes/qr.js";
import stripeRoutes from "./routes/stripe.js";
import { stripeWebhookHandler } from "./controllers/stripe.js";
import userRoutes from "./routes/user.js";

dotenv.config();
const app = express();
app.use(cors());

// stripe webhook route needs raw body
app.post("v1/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  return stripeWebhookHandler(req.body, sig, res);
});

// after webhook raw handler, parse JSON for normal routes
app.use(express.json());

app.use("v1/api", userRoutes);
app.use("v1/api/qr", qrRoutes);
app.use("v1/api/stripe", stripeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
