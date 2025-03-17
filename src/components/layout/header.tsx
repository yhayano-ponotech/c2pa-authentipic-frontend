import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { ModeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Shield className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            C2PA Webアプリ
          </span>
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          <nav className="flex items-center space-x-2">
            <Button asChild variant="ghost" size="sm">
              <a
                href="https://c2pa.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                C2PAについて
              </a>
            </Button>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}