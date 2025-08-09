"use client";

import { ArrowRight, CheckCircle, BarChart3, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="py-24 px-6 bg-[#0d0d17]">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
              Crie agentes de IA
              <span className="block mt-2">inteligentes com</span>
              <span className="text-[#00e980] font-bold">
                Nexus Agents
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-lg">
              Plataforma completa para criar agentes de IA especializados, cada um com sua própria base de conhecimento. Deploy em WhatsApp, Instagram e outros canais em minutos.
            </p>
            

            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-[#00e980]" />
                  <span className="text-gray-200 font-medium">Setup em 5 min</span>
                </div>
                <p className="text-gray-400 text-sm">Crie e deploy seu primeiro agente</p>
              </div>
              
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-[#00e980]" />
                  <span className="text-gray-200 font-medium">RAG Inteligente</span>
                </div>
                <p className="text-gray-400 text-sm">Base de conhecimento por agente</p>
              </div>
              
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-[#00e980]" />
                  <span className="text-gray-200 font-medium">24/7 Ativo</span>
                </div>
                <p className="text-gray-400 text-sm">Atendimento automático contínuo</p>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <div className="relative overflow-hidden rounded-xl shadow-2xl border-2 border-[#00e980] shadow-[#00e980]/20">
              <img 
                src="/images/product/analytics.png" 
                alt="Nexus Agents Analytics Dashboard" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
