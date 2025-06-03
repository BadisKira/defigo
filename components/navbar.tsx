"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser
} from "@clerk/nextjs";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Profil";

  return (
    <header
      className={`fixed md:px-12 px-6 top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 py-2"
        : "bg-transparent py-4"
        }`}
    >
      {!isScrolled && (
        <>
          <div className="absolute top-2 left-1/4 w-8 h-8 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-lg animate-pulse"></div>
          <div className="absolute top-3 right-1/3 w-6 h-6 bg-gradient-to-r from-pink-200/20 to-orange-200/20 rounded-full blur-lg animate-pulse delay-700"></div>
        </>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center">
            <div className="relative">
              <span className="manrope-400 font-bold text-2xl bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                DéfiGo
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] blur-sm"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <Link
                href="/associations"
                className="relative font-medium text-gray-700 hover:text-blue-600 transition-colors duration-300 group"
              >
                Associations
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>

              {user && (
                <Link
                  href="/mon-aventure"
                  className="relative font-medium text-gray-700 hover:text-blue-600 transition-colors duration-300 group"
                >
                  Mon Aventure
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
            </div>

            {/* Auth Buttons Desktop */}
            <SignedOut>
              <div className="flex gap-3">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="justify-start h-10 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 mb-2"
                >
                  <SignInButton>
                    Se connecter

                  </SignInButton>
                </Button>
                <Button
                  asChild
                  className="justify-start h-10 bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <SignUpButton>
                    {"S'enregistrer"}
                  </SignUpButton>
                </Button>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="relative">
                <div className="p-1 rounded-full bg-gradient-to-r from-blue-100/50 to-purple-100/50 hover:from-blue-200/50 hover:to-purple-200/50 transition-all duration-300">
                  <UserButton />
                </div>
              </div>
            </SignedIn>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2" ref={menuRef}>
            <SignedIn>
              <UserButton />
            </SignedIn>

            {/* Menu Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>

            {/* Dropdown Menu Mobile */}
            {isMobileMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-2xl py-2 animate-in fade-in-0 zoom-in-95 duration-200">
                {/* Navigation Links */}
                <div className="px-2">
                  <Link
                    href="/associations"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
                  >
                    <span>Associations</span>
                  </Link>

                  {user && (
                    <Link
                      href="/mon-aventure"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                      <span>Mon Aventure</span>
                    </Link>
                  )}
                </div>

                {/* Séparateur */}
                <div className="my-2 border-t border-gray-200"></div>

                {/* Section Auth */}
                <div className="px-2">
                  <SignedOut>
                    <div className="space-y-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs justify-start h-10 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 mb-2"
                      >
                        <SignInButton>
                          Se connecter

                        </SignInButton>
                      </Button>
                      <Button
                        asChild
                        className="w-full text-xs justify-start h-10 bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <SignUpButton>
                          {"S'enregistrer"}
                        </SignUpButton>
                      </Button>
                    </div>
                  </SignedOut>

                  <SignedIn>
                    <div className="flex items-center px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-lg">
                      <User className="w-4 h-4 mr-2" />
                      <span className="truncate">{displayName}</span>
                    </div>
                  </SignedIn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}