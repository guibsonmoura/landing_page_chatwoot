"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, BrainCircuit, ChevronDown } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[#0d0d17] sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/images/logos/logo_64x64.png" 
                alt="Nexus Agents Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white">
              Nexus Agents
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="#features" 
              className="px-3 py-2 text-gray-300 hover:text-white font-medium transition-colors"
            >
              Recursos
            </Link>
            
            <Link 
              href="#how-it-works" 
              className="px-3 py-2 text-gray-300 hover:text-white font-medium transition-colors"
            >
              Como Funciona
            </Link>
            
            <Link 
              href="#pricing" 
              className="px-3 py-2 text-gray-300 hover:text-white font-medium transition-colors"
            >
              Preços
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-transparent" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button variant="outline" className="border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white bg-transparent hover:bg-gray-800" asChild>
              <Link href="/demo">Agendar demo</Link>
            </Button>
            <Button className="bg-[#00e980] hover:bg-[#00c870] text-black font-medium rounded-md" asChild>
              <Link href="/signup">Começar grátis</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 focus:outline-none" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="#features" 
                className="text-gray-300 hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Recursos
              </Link>
              <Link 
                href="#how-it-works" 
                className="text-gray-300 hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Como Funciona
              </Link>
              <Link 
                href="#pricing" 
                className="text-gray-300 hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Preços
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="ghost" className="justify-start text-gray-300" asChild>
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button variant="outline" className="justify-start border-gray-700 text-gray-300 bg-transparent" asChild>
                  <Link href="/demo">Agendar demo</Link>
                </Button>
                <Button className="justify-start bg-[#00e980] text-black" asChild>
                  <Link href="/signup">Começar grátis</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
