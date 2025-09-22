// backend/src/controllers/stripe.js
import dotenv from "dotenv";
import Stripe from "stripe";
import { supabaseServer } from "../lib/supabase.js";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const createCheckoutSession = async (req, res) => {
  try {
    const { userId, email } = req.body; // frontend must send these
    if (!userId || !email)
      return res.status(400).json({ error: "userId + email required" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Pro QR Generator" },
            unit_amount: 500, // $5.00
            recurring: { interval: "month" }, // subscription monthly
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: email,
      client_reference_id: userId,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    res.status(500).json({ error: err.message });
  }
};

// webhook handler will be a separate exported function to import in server.js
export const stripeWebhookHandler = async (rawBody, sig, res) => {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id; // this is the supabase user id we passed earlier
      if (userId) {
        // set user's plan to PRO
        await supabaseServer
          .from("profiles")
          .upsert({ id: userId, plan: "PRO", email: session.customer_email });
        console.log("User upgraded to PRO:", userId);
      }
    }

    // respond 200 to Stripe
    return res.status(200).send("ok");
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
};
