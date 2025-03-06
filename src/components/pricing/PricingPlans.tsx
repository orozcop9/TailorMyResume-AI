
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles } from "lucide-react";

export function PricingPlans() {
  const [isAnnual, setIsAnnual] = useState(false);
  
  const plans = [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      description: "Perfect for trying out our services",
      features: [
        "1 resume optimization per month",
        "Basic ATS analysis",
        "Standard templates",
        "Email support"
      ],
      cta: "Get Started",
      variant: "outline" as const
    },
    {
      name: "Pro",
      price: { monthly: 29, annual: 19 },
      description: "Best for active job seekers",
      features: [
        "Unlimited resume optimizations",
        "Advanced ATS analysis",
        "Premium templates",
        "Priority email support",
        "Cover letter assistance",
        "LinkedIn profile optimization"
      ],
      cta: "Start Pro Plan",
      variant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: { monthly: 99, annual: 79 },
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Custom templates",
        "Team management",
        "API access",
        "Dedicated success manager",
        "Custom integration options",
        "Training sessions"
      ],
      cta: "Contact Sales",
      variant: "outline" as const
    }
  ];

  return (
    <div className="container max-w-7xl py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your needs
        </p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <span className={!isAnnual ? "font-medium" : "text-muted-foreground"}>Monthly</span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <span className={isAnnual ? "font-medium" : "text-muted-foreground"}>
          Annual
          <Badge variant="secondary" className="ml-2">Save 20%</Badge>
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
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
                <div>
                  <span className="text-3xl font-bold">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-muted-foreground">/mo</span>
                  )}
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
            <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">We accept all major credit cards, PayPal, and offer invoice payment for Enterprise plans.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Is there a money-back guarantee?</h3>
            <p className="text-sm text-muted-foreground">Yes, we offer a 14-day money-back guarantee if you're not satisfied with our service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
