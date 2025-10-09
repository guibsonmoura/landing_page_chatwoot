"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Recursos", href: "#features" },
    { label: "Como Funciona", href: "#how-it-works" },
    { label: "Preços", href: "#pricing" },
  ];

  return (
    <header className="bg-[#0d0d17]/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* Logo Animada */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", type: "spring" }}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10">
              <img
                src="/images/logos/logo_64x64.png"
                alt="365IA Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg font-semibold text-white"
            >
              365IA
            </motion.span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav 
          className="hidden md:flex items-center space-x-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: -10 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {navLinks.map((link, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Link
                href={link.href}
                className="text-gray-300 hover:text-[#00e980] transition-colors"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        {/* CTA Desktop */}
        <motion.div
          className="hidden md:flex"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="px-5 py-2 bg-[#00e980] text-black font-medium rounded-full hover:bg-[#00c870] transition"
              asChild
            >
              <Link href="/login">Entrar</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#0d0d17] border-t border-gray-800"
          >
            <nav className="flex flex-col px-6 py-4 space-y-4">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-300 hover:text-[#00e980] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pt-2"
              >
                <Button
                  className="w-full bg-[#00e980] text-black font-medium rounded-full hover:bg-[#00c870] transition"
                  asChild
                >
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    Entrar
                  </Link>
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
