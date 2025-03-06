
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, Clock, Shield } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "AI-Powered Optimization",
      description: "Our AI analyzes job descriptions to identify key skills and requirements",
      icon: Sparkles
    },
    {
      title: "ATS-Friendly Format",
      description: "Ensure your resume passes Applicant Tracking Systems every time",
      icon: Target
    },
    {
      title: "Instant Results",
      description: "Get your optimized resume in seconds, not hours",
      icon: Clock
    },
    {
      title: "Privacy First",
      description: "Your data is encrypted and never shared with third parties",
      icon: Shield
    }
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose TailorMyResume AI?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg">
              <CardHeader>
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
