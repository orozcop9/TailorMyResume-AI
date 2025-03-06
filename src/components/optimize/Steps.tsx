
import { Check, FileText, Upload, Wand2 } from "lucide-react";

interface StepsProps {
  currentStep: number;
}

export function Steps({ currentStep }: StepsProps) {
  const steps = [
    {
      title: "Job Description",
      icon: FileText,
    },
    {
      title: "Upload Resume",
      icon: Upload,
    },
    {
      title: "Optimize",
      icon: Wand2,
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
