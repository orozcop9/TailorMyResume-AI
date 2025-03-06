
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Optimize", href: "/optimize" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <nav className="container flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl">
          TailorMyResume
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">Sign In</Button>
            <Button asChild>
              <Link href="/onboarding">Get Started</Link>
            </Button>
          </div>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden border-b">
          <div className="container py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="grid gap-4 pt-4 border-t">
              <Button variant="outline" className="w-full">Sign In</Button>
              <Button asChild className="w-full">
                <Link href="/onboarding">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
