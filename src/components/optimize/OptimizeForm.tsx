
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Steps } from "@/components/optimize/Steps";
import { FileUpload } from "@/components/optimize/FileUpload";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Upload, FileText } from "lucide-react";

export function OptimizeForm() {
  const [step, setStep] = useState(1);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsAnalyzing(true);
      // Simulate analysis
      setTimeout(() => {
        setIsAnalyzing(false);
        window.location.href = "/optimize/results";
      }, 3000);
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <Steps currentStep={step} />
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Paste Job Description"}
            {step === 2 && "Upload Your Resume"}
            {step === 3 && "Review and Optimize"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <Textarea 
                placeholder="Paste the job description here..."
                className="min-h-[200px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <Button 
                onClick={handleNextStep}
                disabled={!jobDescription.trim()}
                className="w-full"
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <FileUpload />
              <Button 
                onClick={handleNextStep}
                className="w-full"
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Job Description Analysis Complete</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span>Resume Ready for Optimization</span>
                </div>
              </div>

              <Button 
                onClick={handleNextStep}
                className="w-full"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Progress value={33} className="mr-2" />
                    Analyzing...
                  </>
                ) : (
                  "Optimize Resume"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
