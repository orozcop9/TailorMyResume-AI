
import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingSteps } from "./OnboardingSteps";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { useRouter } from "next/router";

interface PaymentFormProps {
  onSuccess: () => void;
}

function PaymentForm({ onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success`,
        payment_method_data: {
          billing_details: {
            address: {
              country: "US",
            },
          },
        },
      },
    });

    if (submitError) {
      setError(submitError.message || "Payment failed");
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <PaymentElement />
        {error && <div className="text-sm text-red-500">{error}</div>}
        <Button type="submit" className="w-full" disabled={!stripe || processing}>
          {processing ? "Processing..." : "Complete Payment"}
        </Button>
      </div>
    </form>
  );
}

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const router = useRouter();
  const { plan = "pro" } = router.query;

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlanSelection = async () => {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setStep(3);
      } else if (plan === "trial") {
        router.push("/onboarding/success");
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };

  const handlePaymentSuccess = () => {
    router.push("/onboarding/success");
  };

  return (
    <div className="container max-w-xl py-16 space-y-8">
      <OnboardingSteps currentStep={step} />
      
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Personal Information"}
            {step === 2 && "Select Your Plan"}
            {step === 3 && "Payment Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Continue</Button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Selected Plan: {plan}
                </p>
              </div>
              <Button onClick={handlePlanSelection} className="w-full">
                Continue with {plan === "trial" ? "Free Trial" : "Payment"}
              </Button>
            </div>
          )}

          {step === 3 && clientSecret && (
            <Elements stripe={getStripe()} options={{ clientSecret }}>
              <PaymentForm onSuccess={handlePaymentSuccess} />
            </Elements>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
