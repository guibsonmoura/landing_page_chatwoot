"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0d0d17] overflow-hidden">
      {/* Fundo animado sutil */}
      <motion.div
        animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-[#00e980]/10 via-transparent to-[#00e980]/10 bg-[length:200%_200%]"
      />

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center text-center">
        {/* Logo com aura animada */}
        <div className="relative mb-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-[#00e980]/10 blur-2xl"
          />
          <img
            src="/images/logos/logo_64x64.png"
            alt="Nexus Agents Logo"
            className="relative h-14 w-14 rounded-xl shadow-lg"
          />
        </div>

        <h2 className="text-white text-2xl font-bold mb-3">
          365IA - Plataforma de Atendimento
        </h2>
        <p className="text-gray-400 max-w-md mb-10">
          Potencialize seu atendimento com agentes de IA especializados e personalizados
          para o seu negócio.
        </p>

        {/* Links centrais minimalistas */}
        <div className="flex gap-8 mb-14">
          {[
            { label: "Recursos", href: "#recursos" },
            { label: "Como Funciona", href: "#como-funciona" },
            // { label: "Planos", href: "#planos" },
            { label: "Sobre", href: "#sobre" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3, opacity: 1 }}
              initial={{ opacity: 0.7 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Link
                href={item.href}
                className="text-gray-400 hover:text-[#00e980] transition-colors text-sm font-medium"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Linha inferior */}
        <div className="w-full border-t border-[#151522] pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {currentYear} 365IA. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <Link href="#" className="hover:text-[#00e980] transition-colors">
              Termos
            </Link>
            <Link href="#" className="hover:text-[#00e980] transition-colors">
              Privacidade
            </Link>
            {/* <Link href="#" className="hover:text-[#00e980] transition-colors">
              Segurança
            </Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
