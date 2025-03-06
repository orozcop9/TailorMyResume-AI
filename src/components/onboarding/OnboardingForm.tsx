
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

// Rest of the imports and interfaces remain the same...

export function OnboardingForm() {
  // Previous state declarations remain the same...

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
    if (step === 3 && formData.selectedPlan !== "free") {
      createPaymentIntent();
    }
  }, [step, formData.selectedPlan, createPaymentIntent]);

  // Rest of the component remains the same...
}
