"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, FilePlus2, FolderPlus, Home, LayoutDashboard, Menu, PlusCircle, X } from "lucide-react";

const baseNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Generate Quiz", href: "/generate", icon: BrainCircuit },
  { name: "Create Quiz", href: "/create", icon: PlusCircle },
  { name: "Quiz Setup", href: "/create-quiz", icon: FolderPlus },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = useMemo(() => {
    if (pathname?.startsWith("/quiz/")) {
      return [...baseNavItems, { name: "Attend Quiz", href: pathname, icon: FilePlus2 }];
    }

    return baseNavItems;
  }, [pathname]);

  return (
    <nav className="site-navbar">
      <div className="site-navbar-inner">
        <Link href="/" className="site-navbar-brand" onClick={() => setIsOpen(false)}>
          <span className="site-navbar-brand-icon">
            <BrainCircuit size={20} />
          </span>
          <span className="site-navbar-brand-text">QuizAI</span>
        </Link>

        <div className="site-navbar-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`site-navbar-link ${isActive ? "is-active" : ""}`.trim()}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="site-navbar-menu"
          aria-label="Toggle Navigation"
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="site-navbar-mobile">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`site-navbar-mobile-link ${isActive ? "is-active" : ""}`.trim()}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
