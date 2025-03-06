
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Head from "next/head";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <>
      <Head>
        <title>Registration Complete - TailorMyResume AI</title>
        <meta name="description" content="Your account has been successfully created." />
      </Head>
      
      <div className="min-h-screen">
        <Header />
        <main className="container max-w-xl py-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Welcome to TailorMyResume!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Your account has been successfully created. You're now ready to start optimizing your resume.
              </p>
              <div className="space-y-2">
                <h3 className="font-medium">What's next?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Upload your resume for optimization</li>
                  <li>Get AI-powered suggestions</li>
                  <li>Track your application progress</li>
                  <li>Access premium templates</li>
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild size="lg">
                  <Link href="/optimize">Start Optimizing</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
