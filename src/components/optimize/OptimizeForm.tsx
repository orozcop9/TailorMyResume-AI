
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Steps } from "@/components/optimize/Steps";
import { FileUpload } from "@/components/optimize/FileUpload";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Upload, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";

export function OptimizeForm() {
  const [step, setStep] = useState(1);
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileSelected = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleOptimize();
    }
  };

  const handleOptimize = async () => {
    if (!jobDescription || !file) {
      toast({
        title: "Missing Information",
        description: "Please provide both job description and resume file.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      formData.append("resume", file);

      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to optimize resume");
      }

      router.push("/optimize/results");
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "There was an error optimizing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
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
              <FileUpload onFileSelected={handleFileSelected} />
              <Button 
                onClick={handleNextStep}
                disabled={!file}
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
                onClick={handleOptimize}
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
