
import { loadStripe } from "@stripe/stripe-js";

// Make sure to add your publishable key to .env.local
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
export const getStripe = () => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return stripePromise;
};
