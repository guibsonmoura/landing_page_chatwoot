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
              Eleve o nível do seu
              <span className="block mt-2">atendimento com</span>
              <span className="text-[#00e980]">
                Nexus Agents
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-lg">
              Milhares de empresas escolhem o Nexus Agents em vez de soluções tradicionais para criar agentes de IA personalizados e integrados aos seus canais de comunicação.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-[#00e980] hover:bg-[#00c870] text-black font-medium rounded-md px-8 py-6 text-lg" asChild>
                <Link href="/signup">Começar grátis</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-[#00e980]" />
                  <span className="text-gray-200 font-medium">Solução #1</span>
                </div>
                <p className="text-gray-400 text-sm">para criação de agentes de IA personalizados</p>
              </div>
              
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-[#00e980]" />
                  <span className="text-gray-200 font-medium">Insights em tempo real</span>
                </div>
                <p className="text-gray-400 text-sm">para monitoramento de desempenho dos agentes</p>
              </div>
              
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-[#00e980]" />
                  <span className="text-gray-200 font-medium">Integração simples</span>
                </div>
                <p className="text-gray-400 text-sm">com WhatsApp, Instagram e outros canais</p>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <div className="bg-[#151522] rounded-xl shadow-xl p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="text-gray-400 text-sm">Desempenho do Agente</div>
                  <div className="text-white text-2xl font-bold">94% de precisão</div>
                  <div className="text-[#00e980] text-sm flex items-center">↑ 12% <span className="text-gray-500 ml-1">vs. mês anterior</span></div>
                </div>
                <div className="bg-[#1e1e2d] p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-[#00e980]" />
                  
                  <div className="mt-4 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Digite sua mensagem..." 
                      className="flex-1 rounded-full border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled
                    />
                    <button className="rounded-full bg-indigo-600 p-2 text-white" disabled>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
