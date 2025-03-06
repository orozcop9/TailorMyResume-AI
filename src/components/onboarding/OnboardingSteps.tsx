
import { Check, User, CreditCard, Package } from "lucide-react";

interface OnboardingStepsProps {
  currentStep: number;
}

export function OnboardingSteps({ currentStep }: OnboardingStepsProps) {
  const steps = [
    {
      title: "Personal Info",
      icon: User,
    },
    {
      title: "Select Plan",
      icon: Package,
    },
    {
      title: "Payment",
      icon: CreditCard,
    },
  ];

  return (
    <div className="flex justify-between">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = currentStep > stepNumber;
        const isCurrent = currentStep === stepNumber;
        
        return (
          <div
            key={step.title}
            className="flex flex-1 items-center justify-center"
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  isComplete
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                    ? "border-primary"
                    : "border-muted"
                }`}
              >
                {isComplete ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isCurrent ? "font-medium text-primary" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-[2px] flex-1 ${
                  isComplete ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
