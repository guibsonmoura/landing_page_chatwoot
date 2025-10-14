"use client";

import { Bot, Database, MessageSquare, Upload, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: <Bot className="h-8 w-8 text-[#00e980]" />,
      title: "Crie seu Agente",
      description: "Configure a personalidade, o tom e o comportamento do seu agente de IA para representar sua marca.",
      details: [
        "Defina o nome e a personalidade",
        "Escolha o tom de comunicação",
        "Configure respostas padrão"
      ]
    },
    {
      number: "02",
      icon: <Upload className="h-8 w-8 text-[#00e980]" />,
      title: "Adicione Conhecimento",
      description: "Faça upload de documentos, manuais e FAQs para que seu agente responda com precisão sobre seu negócio.",
      details: [
        "Upload de PDFs, DOCs e outros formatos",
        "Indexação automática do conteúdo",
        "Organização em categorias"
      ]
    },
    {
      number: "03",
      icon: <MessageSquare className="h-8 w-8 text-[#00e980]" />,
      title: "Conecte Canais",
      description: "Integre seu agente ao WhatsApp, Instagram e outros canais de comunicação com apenas alguns cliques.",
      details: [
        "QR Code para WhatsApp",
        "API para Instagram e Facebook",
        "Webhook para sistemas personalizados"
      ]
    },
    {
      number: "04",
      icon: <Database className="h-8 w-8 text-[#00e980]" />,
      title: "Analise e Otimize",
      description: "Acompanhe o desempenho, visualize insights e melhore continuamente seus agentes.",
      details: [
        "Dashboard de métricas em tempo real",
        "Análise de satisfação dos usuários",
        "Sugestões de otimização automáticas"
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#0d0d17] border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Como <span className="text-[#00e980]">Funciona</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Implante agentes de IA especializados em minutos, sem conhecimento técnico avançado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="bg-[#151522] rounded-xl border border-gray-800 overflow-hidden">
              <div className="flex items-start p-8">
                <div className="mr-6">
                  <div className="text-4xl font-bold text-[#00e980] opacity-50">{step.number}</div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1e1e2d] flex items-center justify-center">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
                  </div>
                  
                  <p className="text-gray-400 mb-6">{step.description}</p>
                  
                  <div className="space-y-3">
                    {step.details.map((detail, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-[#00e980]" />
                        <span className="text-gray-300">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#151522] rounded-xl border border-gray-800 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-12">
              <div className="inline-block px-4 py-2 bg-[#1e1e2d] rounded-full text-[#00e980] text-sm font-medium mb-6">
                Painel Intuitivo
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-white">Gerencie tudo em um só lugar</h3>
              
              <p className="text-gray-400 mb-8">
                Nossa interface amigável permite que você gerencie todos os seus agentes e canais em um único lugar, sem complicações.
              </p>
              
              <div className="space-y-4">
                {[
                  "Visão geral de todos os agentes e canais",
                  "Análise de desempenho em tempo real",
                  "Gerenciamento simplificado de conhecimento",
                  "Configuração intuitiva de personalidade"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1e1e2d] flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#00e980]" />
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Button className="bg-[#00e980] hover:bg-[#00c870] text-black font-medium rounded-md px-6 py-5" asChild>
                  <Link href="/cadastrar">
                    Experimentar agora <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-[#0d0d17] p-8 flex items-center justify-center">
              <div className="relative w-full max-w-2xl h-96 overflow-hidden rounded-xl shadow-2xl border border-gray-700">
                {/* Carousel Container */}
                <div className="carousel-container relative w-full h-full">
                  {/* Agents Dashboard */}
                  <div className="carousel-slide absolute inset-0 opacity-100 transition-all duration-1000 ease-in-out animate-[slideShow_12s_infinite]">
                    <img 
                      src="/images/product/agents.png" 
                      alt="Nexus Agents Dashboard" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="text-lg font-semibold text-[#00e980]">Agentes IA</div>
                      <div className="text-sm text-gray-300">Crie e gerencie agentes inteligentes</div>
                    </div>
                    <div className="absolute top-6 right-6">
                      <div className="bg-[#00e980]/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-[#00e980] font-medium">
                        1/3
                      </div>
                    </div>
                  </div>

                  {/* Analytics Dashboard */}
                  <div className="carousel-slide absolute inset-0 opacity-0 transition-all duration-1000 ease-in-out animate-[slideShow_12s_infinite_4s]">
                    <img 
                      src="/images/product/analytics.png" 
                      alt="Nexus Analytics Dashboard" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="text-lg font-semibold text-[#00e980]">Analytics</div>
                      <div className="text-sm text-gray-300">Insights e métricas em tempo real</div>
                    </div>
                    <div className="absolute top-6 right-6">
                      <div className="bg-[#00e980]/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-[#00e980] font-medium">
                        2/3
                      </div>
                    </div>
                  </div>

                  {/* Channels Dashboard */}
                  <div className="carousel-slide absolute inset-0 opacity-0 transition-all duration-1000 ease-in-out animate-[slideShow_12s_infinite_8s]">
                    <img 
                      src="/images/product/channels.png" 
                      alt="Nexus Channels Dashboard" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="text-lg font-semibold text-[#00e980]">Canais</div>
                      <div className="text-sm text-gray-300">Deploy em WhatsApp, Instagram e mais</div>
                    </div>
                    <div className="absolute top-6 right-6">
                      <div className="bg-[#00e980]/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-[#00e980] font-medium">
                        3/3
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00e980] animate-[progressDot_12s_infinite]"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-600 animate-[progressDot_12s_infinite_4s]"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-600 animate-[progressDot_12s_infinite_8s]"></div>
                  </div>
                </div>

                {/* Custom CSS for animations */}
                <style jsx>{`
                  @keyframes slideShow {
                    0%, 25% { opacity: 1; transform: scale(1); }
                    33.33%, 91.66% { opacity: 0; transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                  }
                  
                  @keyframes progressDot {
                    0%, 25% { background-color: #00e980; transform: scale(1.2); }
                    33.33%, 91.66% { background-color: #4b5563; transform: scale(1); }
                    100% { background-color: #00e980; transform: scale(1.2); }
                  }
                  
                  .animate-\[slideShow_12s_infinite\] {
                    animation: slideShow 12s infinite;
                  }
                  
                  .animate-\[slideShow_12s_infinite_4s\] {
                    animation: slideShow 12s infinite 4s;
                  }
                  
                  .animate-\[slideShow_12s_infinite_8s\] {
                    animation: slideShow 12s infinite 8s;
                  }
                  
                  .animate-\[progressDot_12s_infinite\] {
                    animation: progressDot 12s infinite;
                  }
                  
                  .animate-\[progressDot_12s_infinite_4s\] {
                    animation: progressDot 12s infinite 4s;
                  }
                  
                  .animate-\[progressDot_12s_infinite_8s\] {
                    animation: progressDot 12s infinite 8s;
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
