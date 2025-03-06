
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

export function PricingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const plans = [
    {
      id: "trial",
      name: "Free Trial",
      price: 0,
      period: "7-day trial",
      description: "Try all Pro features free for 7 days",
      features: [
        "Full access to all features",
        "Unlimited resume optimizations",
        "Advanced ATS analysis",
        "Premium templates",
        "Cancel anytime",
        "No credit card required"
      ],
      cta: "Start Free Trial",
      variant: "outline" as const
    },
    {
      id: "pro",
      name: "Pro",
      price: 29,
      period: "per month",
      description: "Best for active job seekers",
      features: [
        "Unlimited resume optimizations",
        "Advanced ATS analysis",
        "Premium templates",
        "Priority email support",
        "Cover letter assistance",
        "LinkedIn profile optimization"
      ],
      cta: "Choose Pro Plan",
      variant: "default" as const,
      popular: true
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: 119,
      period: "one-time payment",
      description: "Best value for long-term access",
      features: [
        "Everything in Pro plan",
        "Lifetime access",
        "All future updates",
        "Priority support forever",
        "Exclusive templates",
        "Personal success manager"
      ],
      cta: "Get Lifetime Access",
      variant: "outline" as const
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    window.location.href = `/onboarding?plan=${planId}`;
  };

  return (
    <div className="container max-w-7xl py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? "border-primary shadow-lg" : ""} ${
              selectedPlan === plan.id ? "ring-2 ring-primary" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <Badge className="bg-primary text-primary-foreground">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-baseline justify-between">
                <span>{plan.name}</span>
                <div className="text-right">
                  <span className="text-3xl font-bold">
                    ${plan.price}
                  </span>
                  <div className="text-sm text-muted-foreground">
                    {plan.period}
                  </div>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-primary mt-1" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={plan.variant}
                className="w-full"
                size="lg"
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
          <div>
            <h3 className="font-medium mb-2">Can I change plans later?</h3>
            <p className="text-sm text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What happens after the trial?</h3>
            <p className="text-sm text-muted-foreground">After your 7-day trial, you can choose to subscribe to our Pro plan or get lifetime access. No automatic charges.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Is there a refund policy?</h3>
            <p className="text-sm text-muted-foreground">Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
