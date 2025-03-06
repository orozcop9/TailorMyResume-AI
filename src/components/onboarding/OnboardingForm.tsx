
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OnboardingSteps } from "@/components/onboarding/OnboardingSteps";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Mail } from "lucide-react";
import { getStripe } from "@/lib/stripe";
import { useRouter } from "next/router";
import { formatCardNumber, formatExpiryDate, validateCardNumber, validateExpiryDate, validateCVV } from "@/lib/payment";

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*]/.test(password)) strength += 20;
    return strength;
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength <= 20) return "Very Weak";
    if (strength <= 40) return "Weak";
    if (strength <= 60) return "Medium";
    if (strength <= 80) return "Strong";
    return "Very Strong";
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 20) return "text-red-500";
    if (strength <= 40) return "text-orange-500";
    if (strength <= 60) return "text-yellow-500";
    if (strength <= 80) return "text-lime-500";
    return "text-green-500";
  };

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

  const validateConfirmPassword = (confirmPassword: string) => {
    if (confirmPassword !== formData.password) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (name === "expiryDate") {
      formattedValue = formatExpiryDate(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    
    if (name === "password") {
      setPasswordError(validatePassword(value));
      setPasswordStrength(calculatePasswordStrength(value));
      if (formData.confirmPassword) {
        setConfirmPasswordError(validateConfirmPassword(formData.confirmPassword));
      }
    }

    if (name === "confirmPassword") {
      setConfirmPasswordError(validateConfirmPassword(value));
    }
  };

  const validatePaymentFields = () => {
    if (!validateCardNumber(formData.cardNumber)) {
      setPaymentError("Invalid card number");
      return false;
    }
    if (!validateExpiryDate(formData.expiryDate)) {
      setPaymentError("Invalid expiry date");
      return false;
    }
    if (!validateCVV(formData.cvv)) {
      setPaymentError("Invalid CVV");
      return false;
    }
    return true;
  };

  const createPaymentIntent = async () => {
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
      return data.clientSecret;
    } catch (error) {
      console.error("Payment intent error:", error);
      throw error;
    }
  };

  const handleNextStep = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!validatePaymentFields()) {
        return;
      }

      setIsProcessing(true);
      setPaymentError("");

      try {
        if (formData.selectedPlan !== "free") {
          const clientSecret = await createPaymentIntent();
          const stripe = await getStripe();
          
          if (!stripe || !clientSecret) {
            throw new Error("Stripe initialization failed");
          }

          const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: {
                number: formData.cardNumber.replace(/\s/g, ""),
                exp_month: parseInt(formData.expiryDate.split("/")[0]),
                exp_year: parseInt("20" + formData.expiryDate.split("/")[1]),
                cvc: formData.cvv,
              },
            },
          });

          if (error) {
            throw new Error(error.message);
          }
        }

        router.push("/onboarding/success");
      } catch (error) {
        console.error("Payment error:", error);
        setPaymentError(error instanceof Error ? error.message : "Payment failed");
      } finally {
        setIsProcessing(false);
      }
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
          formData.confirmPassword &&
          !passwordError &&
          !confirmPasswordError
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
            <div className="space-y-6">
              <Button variant="outline" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

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
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Password Strength:</span>
                        <span className={getPasswordStrengthColor(passwordStrength)}>
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className="h-1" />
                    </div>
                  )}
                  {passwordError && (
                    <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                  )}
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
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-sm text-red-500 mt-1">{confirmPasswordError}</p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li className={formData.password.length >= 8 ? "text-green-500" : ""}>
                      At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? "text-green-500" : ""}>
                      One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? "text-green-500" : ""}>
                      One lowercase letter
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? "text-green-500" : ""}>
                      One number
                    </li>
                    <li className={/[!@#$%^&*]/.test(formData.password) ? "text-green-500" : ""}>
                      One special character (!@#$%^&*)
                    </li>
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
                  maxLength={19}
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
                    maxLength={5}
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
                    maxLength={4}
                  />
                </div>
              </div>
              {paymentError && (
                <p className="text-sm text-red-500">{paymentError}</p>
              )}
            </div>
          )}

          <Button 
            onClick={handleNextStep}
            disabled={!isStepValid() || isProcessing}
            className="w-full mt-6"
          >
            {isProcessing ? (
              <>
                <Progress value={33} className="mr-2" />
                Processing...
              </>
            ) : step === 3 ? (
              "Complete Sign Up"
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {step === 1 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
