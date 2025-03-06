
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
  apiVersion: "2025-02-24.acacia",
  locale: "en",
  appearance: {
    theme: "stripe",
  },
});

export const getStripe = () => {
  return stripePromise;
};
