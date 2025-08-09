"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, ArrowRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-[#0d0d17] overflow-hidden">
      {/* Subtle color gradient effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[300px] -left-[300px] w-[600px] h-[600px] rounded-full bg-[#00e980] opacity-[0.03] blur-[150px]"></div>
        <div className="absolute -bottom-[200px] -right-[200px] w-[500px] h-[500px] rounded-full bg-[#4d7cfe] opacity-[0.03] blur-[150px]"></div>
        <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#e34ba9] opacity-[0.02] blur-[100px]"></div>
      </div>
      
      <div className="container relative z-10 mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="col-span-1 md:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="relative h-8 w-8 rounded-lg overflow-hidden shadow-lg">
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
            <p className="text-gray-400 mb-6 max-w-md">
              Potencialize seu atendimento com agentes de IA especializados e personalizados para o seu negócio.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-500 hover:text-[#00e980] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#00e980] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#00e980] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#00e980] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 md:ml-6">
            <h3 className="font-medium text-white text-lg mb-5">Produto</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Recursos
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Planos
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Casos de Uso
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-medium text-white text-lg mb-5">Empresa</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Carreiras
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Segurança
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Parceiros
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-4">
            <h3 className="font-medium text-white text-lg mb-5">Recursos</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Documentação
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Vídeos Demo
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Encontre um Consultor
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#00e980] transition-colors">
                  Calculadora de Economia
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-[#151522] flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Nexus Agents. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-6 mt-4 md:mt-0">
            <Link href="#" className="text-gray-500 hover:text-[#00e980] transition-colors text-sm">
              Termos de Serviço
            </Link>
            <Link href="#" className="text-gray-500 hover:text-[#00e980] transition-colors text-sm">
              Privacidade
            </Link>
            <Link href="#" className="text-gray-500 hover:text-[#00e980] transition-colors text-sm">
              Segurança
            </Link>
          </div>
        </div>
        
        <div className="mt-10 flex justify-center md:justify-start">
          <Link 
            href="/signup" 
            className="group flex items-center gap-2 text-sm font-medium text-[#00e980] hover:text-white transition-colors"
          >
            <span>PRÓXIMA ETAPA: CADASTRE-SE</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
