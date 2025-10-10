"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { label: "Recursos", href: "#recursos" },
    { label: "Como Funciona", href: "#como-funciona" },
    { label: "Planos", href: "#planos" },
  ];

  // Detect scroll para mudar estilo da navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-6 left-0 w-full flex justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-md border 
          transition-all duration-300
          ${isScrolled ? "bg-black/70 border-gray-700 shadow-lg" : "bg-black/40 border-gray-800"}
          w-[90%] md:w-[70%] lg:w-[60%]`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.img
            src="/images/logos/logo_64x64.png"
            alt="365IA Logo"
            className="h-8 w-8 object-contain"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200 }}
          />
          <span className="text-white font-semibold">365IA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href={link.href}
                className="text-gray-300 hover:text-[#00e980] relative group"
              >
                {link.label}
                <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#00e980] rounded-full transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* CTA Desktop */}
        <div className="hidden md:flex">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="px-5 py-2 bg-[#00e980] text-black font-medium rounded-full hover:bg-[#00c870] transition"
              asChild
            >
              <Link href="/login">Entrar</Link>
            </Button>
          </motion.div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </motion.div>

      {/* Mobile Menu - Fullscreen Overlay */}
      <AnimatePresence>
  {isMenuOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center space-y-8 z-40"
      onClick={() => setIsMenuOpen(false)} // Fecha o menu ao clicar no overlay
    >
      {/* Evita que o clique nos itens do menu feche imediatamente */}
      <div className="flex flex-col items-center justify-center space-y-8"
           onClick={(e) => e.stopPropagation()}>
        {navLinks.map((link, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={link.href}
              className="text-2xl text-white hover:text-[#00e980] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          </motion.div>
        ))}

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            className="bg-[#00e980] text-black font-medium rounded-full hover:bg-[#00c870] transition px-8 py-3 text-lg"
            asChild
          >
            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
              Entrar
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
    </header>
  );
}
