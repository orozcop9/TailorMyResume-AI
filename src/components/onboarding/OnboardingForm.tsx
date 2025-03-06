
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OnboardingSteps } from "@/components/onboarding/OnboardingSteps";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    selectedPlan: "pro",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });

  const plans = [
    {
      id: "free",
      name: "Free Plan",
      price: "$0/mo",
      description: "Perfect for trying out our services"
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: "$29/mo",
      description: "Best for active job seekers",
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: "$99/mo",
      description: "For teams and organizations"
    }
  ];

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === "password") {
      setPasswordError(validatePassword(value));
    }
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Handle form submission
      console.log("Form submitted:", formData);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.password &&
          !passwordError
        );
      case 2:
        return formData.selectedPlan;
      case 3:
        return formData.cardNumber && formData.expiryDate && formData.cvv;
      default:
        return false;
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <OnboardingSteps currentStep={step} />
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Personal Information"}
            {step === 2 && "Choose Your Plan"}
            {step === 3 && "Payment Details"}
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
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
                <div className="text-sm text-muted-foreground mt-2">
                  Password must contain:
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character (!@#$%^&*)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <RadioGroup
              value={formData.selectedPlan}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, selectedPlan: value }))}
              className="space-y-4"
            >
              {plans.map((plan) => (
                <Label
                  key={plan.id}
                  htmlFor={plan.id}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                    formData.selectedPlan === plan.id ? "border-primary bg-primary/5" : ""
                  } ${plan.popular ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={plan.id} id={plan.id} />
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">{plan.description}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold">{plan.price}</div>
                </Label>
              ))}
            </RadioGroup>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                  />
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleNextStep}
            disabled={!isStepValid()}
            className="w-full mt-6"
          >
            {step === 3 ? "Complete Sign Up" : "Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
