"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { FileSearch, FilePlus, FileCheck } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

export function MainNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      title: "読み取り",
      href: "/",
      icon: <FileSearch className="h-4 w-4 mr-2" />,
      description: "C2PA情報の読み取り",
    },
    {
      title: "署名",
      href: "/sign",
      icon: <FilePlus className="h-4 w-4 mr-2" />,
      description: "C2PA情報の追加と署名",
    },
    {
      title: "検証",
      href: "/verify",
      icon: <FileCheck className="h-4 w-4 mr-2" />,
      description: "C2PA情報の検証",
    },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  );
}