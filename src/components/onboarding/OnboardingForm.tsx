
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Mail } from "lucide-react";
import { OnboardingSteps } from "./OnboardingSteps";
import { getStripe } from "@/lib/stripe";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  selectedPlan: "free" | "pro" | "enterprise";
}

function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
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
        return_url: `${window.location.origin}/onboarding/success`,
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
      <PaymentElement />
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      <Button 
        type="submit"
        disabled={!stripe || processing}
        className="w-full mt-6"
      >
        {processing ? "Processing..." : "Complete Sign Up"}
      </Button>
    </form>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    selectedPlan: "pro",
  });

  const createPaymentIntent = useCallback(async () => {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: formData.selectedPlan,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    } catch (error) {
      console.error("Payment intent error:", error);
    }
  }, [formData.selectedPlan]);

  useEffect(() => {
    let mounted = true;

    if (step === 3 && formData.selectedPlan !== "free") {
      createPaymentIntent().then(() => {
        if (!mounted) return;
      });
    }

    return () => {
      mounted = false;
    };
  }, [step, createPaymentIntent]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*]/.test(password)) strength += 20;
    return strength;
  };

  const validatePassword = (password: string): string => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Include at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Include at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Include at least one number";
    if (!/[!@#$%^&*]/.test(password)) return "Include at least one special character";
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      const error = validatePassword(value);
      setPasswordError(error);
      setPasswordStrength(calculatePasswordStrength(value));
    } else if (name === "confirmPassword") {
      setConfirmPasswordError(value !== formData.password ? "Passwords do not match" : "");
    }
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePaymentSuccess = () => {
    router.push("/onboarding/success");
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          !passwordError &&
          !confirmPasswordError
        );
      case 2:
        return formData.selectedPlan;
      default:
        return false;
    }
  };

  const stripePromise = getStripe();

  return (
    <div className="container max-w-3xl py-10">
      <OnboardingSteps currentStep={step} />
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            {step === 1 ? "Personal Information" : 
             step === 2 ? "Choose Your Plan" : "Payment Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
                <Progress value={passwordStrength} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {confirmPasswordError && (
                  <p className="text-sm text-red-500 mt-1">{confirmPasswordError}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <RadioGroup
              value={formData.selectedPlan}
              onValueChange={(value: "free" | "pro" | "enterprise") => 
                setFormData(prev => ({ ...prev, selectedPlan: value }))
              }
              className="space-y-4"
            >
              <div className="space-y-4">
                {[
                  { id: "free", name: "Free Plan", price: "$0/mo" },
                  { id: "pro", name: "Pro Plan", price: "$29/mo" },
                  { id: "enterprise", name: "Enterprise Plan", price: "$99/mo" }
                ].map((plan) => (
                  <Label
                    key={plan.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      formData.selectedPlan === plan.id ? "border-primary" : "border-input"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={plan.id} id={plan.id} />
                      <span>{plan.name}</span>
                    </div>
                    <span className="font-semibold">{plan.price}</span>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          )}

          {step === 3 && (
            <>
              {formData.selectedPlan === "free" ? (
                <Button 
                  onClick={handlePaymentSuccess}
                  className="w-full"
                >
                  Complete Sign Up
                </Button>
              ) : clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm onSuccess={handlePaymentSuccess} />
                </Elements>
              )}
            </>
          )}

          {step < 3 && (
            <Button
              onClick={handleNextStep}
              disabled={!isStepValid()}
              className="w-full mt-6"
            >
              Continue
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
