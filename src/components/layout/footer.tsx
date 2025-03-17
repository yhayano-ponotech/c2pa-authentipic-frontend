import Link from "next/link";
import { Github } from "lucide-react";
import { APP_INFO } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} {APP_INFO.name} v{APP_INFO.version} - 
          <Link
            href="https://c2pa.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 ml-1"
          >
            C2PA
          </Link>{" "}
          対応画像処理アプリケーション
        </p>
        <div className="flex items-center space-x-1">
          <Link
            href="https://github.com/contentauth/c2pa-node"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Github className="h-4 w-4 mr-1" />
            <span>C2PA Node.js</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}