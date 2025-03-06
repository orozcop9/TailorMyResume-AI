
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative isolate pt-14">
      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Optimize Your Resume with AI
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Instantly tailor your resume to match any job description. Get more interviews with our AI-powered resume optimization tool.
            </p>
            <div className="mt-10 flex items-center justify-center">
              <Button size="lg" asChild>
                <Link href="/pricing">
                  Optimize Your Resume
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
