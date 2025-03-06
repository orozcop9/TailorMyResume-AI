
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function ResultsView() {
  const [activeTab, setActiveTab] = useState("optimized");
  
  const improvements = [
    { type: "Skills Match", before: 65, after: 95 },
    { type: "ATS Compatibility", before: 72, after: 98 },
    { type: "Keyword Optimization", before: 58, after: 92 }
  ];

  const keyChanges = [
    "Added missing key skills: React.js, TypeScript, AWS",
    "Improved action verbs in experience descriptions",
    "Optimized formatting for ATS readability",
    "Added quantifiable achievements"
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resume Optimization Results</h1>
          <p className="text-muted-foreground mt-2">
            Your resume has been optimized for maximum impact
          </p>
        </div>
        <div className="flex gap-4">
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {improvements.map((item) => (
          <Card key={item.type}>
            <CardContent className="pt-6">
              <div className="text-sm font-medium">{item.type}</div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Before</span>
                  <span>{item.before}%</span>
                </div>
                <Progress value={item.before} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">After</span>
                  <span className="text-primary">{item.after}%</span>
                </div>
                <Progress value={item.after} className="h-2 bg-primary/20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keyChanges.map((change, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <span>{change}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resume Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original">Original Resume</TabsTrigger>
              <TabsTrigger value="optimized">Optimized Resume</TabsTrigger>
            </TabsList>
            <TabsContent value="original" className="mt-6">
              <div className="prose max-w-none">
                <h2>Senior Frontend Developer</h2>
                <p>Experienced frontend developer with 5 years of experience in web development...</p>
                <h3>Experience</h3>
                <p>Frontend Developer at Tech Corp<br />2018 - Present</p>
                <ul>
                  <li>Developed web applications using React</li>
                  <li>Worked with cross-functional teams</li>
                  <li>Implemented new features</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="optimized" className="mt-6">
              <div className="prose max-w-none">
                <h2>Senior Frontend Developer</h2>
                <p>Results-driven frontend developer with 5+ years of expertise in modern web development...</p>
                <h3>Professional Experience</h3>
                <p>Senior Frontend Developer at Tech Corp<br />2018 - Present</p>
                <ul>
                  <li>Architected and developed scalable React.js applications, increasing user engagement by 45%</li>
                  <li>Led cross-functional teams in delivering 15+ successful projects</li>
                  <li>Implemented performance optimizations resulting in 30% faster load times</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ATS Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium mb-2">Overall ATS Score</div>
                <Progress value={98} className="h-3" />
              </div>
              <div className="text-2xl font-bold text-primary">98%</div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-4">Required Skills Found</div>
                <div className="flex flex-wrap gap-2">
                  {["React.js", "TypeScript", "Node.js", "AWS", "REST APIs"].map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-4">Missing Skills</div>
                <div className="flex flex-wrap gap-2">
                  {["GraphQL"].map((skill) => (
                    <Badge key={skill} variant="outline" className="flex items-center gap-1 text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
