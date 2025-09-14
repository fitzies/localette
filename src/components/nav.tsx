"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { hasBusiness } from "@/lib/functions";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "#", label: "Home", id: "home" },
  { href: "#features", label: "Features", id: "features" },
  { href: "#why", label: "Why", id: "why" },
  // { href: "#", label: "Join" },
];

interface NavProps {
  mode?: "home" | "creation" | "dashboard";
}

export default function Nav({ mode = "home" }: NavProps) {
  const [activeSection, setActiveSection] = useState("home");
  const [userHasBusiness, setUserHasBusiness] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "features", "why"];
      const scrollPosition = window.scrollY + 100; // Offset for fixed header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if user has business when component mounts
  useEffect(() => {
    const checkBusiness = async () => {
      try {
        const result = await hasBusiness();
        setUserHasBusiness(result.hasBusiness);
        setBusinessId(result.business?.id || null);
      } catch (error) {
        console.error("Failed to check business status:", error);
        setUserHasBusiness(false);
        setBusinessId(null);
      }
    };

    checkBusiness();
  }, []);

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  // Render simplified nav for creation and dashboard modes
  if (mode === "creation" || mode === "dashboard") {
    return (
      <header className="px-4 md:px-6 fixed w-screen z-50">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <a href="#" className="text-primary hover:text-primary/90">
            <img src="/logo.png" alt="Localette Logo" className="h-8 w-auto" />
          </a>
          {/* User icon */}
          <div className="flex items-center">
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>
    );
  }

  // Default home mode with full navigation
  return (
    <header className="px-4 md:px-6 fixed w-screen z-50">
      <div className="flex h-16 justify-between gap-4">
        {/* Left side */}
        <div className="flex gap-2">
          <div className="flex items-center md:hidden"></div>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-primary hover:text-primary/90">
              <img
                src="/logo.png"
                alt="Localette Logo"
                className="h-8 w-auto"
              />
            </a>
            {/* Navigation menu */}
            <NavigationMenu className="h-full *:h-full max-md:hidden">
              <NavigationMenuList className="h-full gap-2">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem key={index} className="h-full">
                    <NavigationMenuLink
                      active={activeSection === link.id}
                      href={link.href}
                      className="text-muted-foreground hover:text-primary border-b-primary hover:border-b-primary data-[active]:border-b-primary h-full justify-center rounded-none border-y-2 border-transparent py-1.5 font-medium hover:bg-transparent data-[active]:bg-transparent!"
                      onClick={() => handleNavClick(link.id)}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="text-sm">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="text-sm">
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button size="sm" className="text-sm">
              <Link
                href={
                  userHasBusiness && businessId
                    ? `/admin/${businessId}`
                    : "/creation"
                }
              >
                {userHasBusiness ? "Dashboard" : "Get Started"}
              </Link>
            </Button>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
