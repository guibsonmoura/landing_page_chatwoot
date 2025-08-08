"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[#0d0d17] sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold text-white">
              Nexus Agents
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <div className="relative group px-3 py-2">
              <button className="flex items-center text-gray-300 hover:text-white font-medium group-hover:text-white">
                Soluções <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-[#151522] ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                <div className="py-1">
                  <Link href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                    Agentes de IA
                  </Link>
                  <Link href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                    Base de Conhecimento
                  </Link>
                  <Link href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                    Integrações
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="relative group px-3 py-2">
              <button className="flex items-center text-gray-300 hover:text-white font-medium group-hover:text-white">
                Recursos <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-[#151522] ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                <div className="py-1">
                  <Link href="#features" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                    Principais Recursos
                  </Link>
                  <Link href="#how-it-works" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                    Como Funciona
                  </Link>
                </div>
              </div>
            </div>
            
            <Link 
              href="#nexus-vs-others" 
              className="px-3 py-2 text-gray-300 hover:text-white font-medium"
            >
              Nexus vs. Concorrentes
            </Link>
            
            <Link 
              href="#pricing" 
              className="px-3 py-2 text-gray-300 hover:text-white font-medium"
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
                className="text-gray-300 hover:text-white font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Recursos
              </Link>
              <Link 
                href="#how-it-works" 
                className="text-gray-300 hover:text-white font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Como Funciona
              </Link>
              <Link 
                href="#nexus-vs-others" 
                className="text-gray-300 hover:text-white font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Nexus vs. Concorrentes
              </Link>
              <Link 
                href="#pricing" 
                className="text-gray-300 hover:text-white font-medium"
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
