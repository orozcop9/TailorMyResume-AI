
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">TailorMyResume</span>
            <span className="text-sm text-primary">AI</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/optimize">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
