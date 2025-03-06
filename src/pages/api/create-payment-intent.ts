
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const PLAN_PRICES = {
  free: 0,
  pro: 2900,
  enterprise: 9900,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { plan } = req.body;
    
    if (!plan || !PLAN_PRICES[plan as keyof typeof PLAN_PRICES]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];

    if (amount === 0) {
      return res.status(200).json({ clientSecret: null });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        plan,
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Error creating payment intent" });
  }
}
