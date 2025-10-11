"use client";

import Link from "next/link";
import { Check, ArrowRight, Zap, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  const plans = [
    {
      name: "Básico",
      price: "R$99",
      period: "/mês",
      description: "Ideal para pequenas empresas iniciando com IA",
      icon: Zap,
      iconColor: "text-blue-500",
      iconBg: "from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
      features: [
        "2 agentes de IA",
        "Integração com WhatsApp",
        "Base de conhecimento RAG (5 documentos)",
        "Histórico de conversas (30 dias)",
        "Suporte por email"
      ],
      cta: "Começar Grátis",
      popular: false,
      color: "border-gray-700",
      ctaColor: "bg-[#151522] hover:bg-[#1e1e2d] border-2 border-[#00e980] hover:border-[#00c870]"
    },
    {
      name: "Pro",
      price: "R$299",
      period: "/mês",
      description: "Para empresas em crescimento que precisam de mais recursos",
      icon: Shield,
      iconColor: "text-green-500",
      iconBg: "from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
      features: [
        "5 agentes de IA",
        "Integração com WhatsApp e Instagram",
        "Base de conhecimento RAG (20 documentos)",
        "Histórico de conversas (90 dias)",
        "Perfis de clientes",
        "Análise de desempenho",
        "Suporte prioritário"
      ],
      cta: "Escolher Pro",
      popular: true,
      color: "border-[#00e980]",
      ctaColor: "bg-[#00e980] hover:bg-[#00c870] text-black"
    },
    {
      name: "Enterprise",
      price: "R$999",
      period: "/mês",
      description: "Solução completa para grandes empresas",
      icon: Crown,
      iconColor: "text-amber-500",
      iconBg: "from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800",
      features: [
        "Agentes ilimitados",
        "Todos os canais disponíveis",
        "Base de conhecimento RAG ilimitada",
        "Histórico de conversas ilimitado",
        "Perfis de clientes avançados",
        "Análise de desempenho detalhada",
        "Suporte dedicado 24/7",
        "API personalizada",
        "Treinamento da equipe"
      ],
      cta: "Falar com Vendas",
      popular: false,
      color: "border-gray-700",
      ctaColor: "bg-[#151522] hover:bg-[#1e1e2d] border-2 border-[#00e980] hover:border-[#00c870]"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-[#0d0d17] border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Planos <span className="text-[#00e980]">Flexíveis</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Escolha o plano ideal para o seu negócio e escale conforme suas necessidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-xl overflow-hidden border ${plan.color} bg-[#1e1e2d] flex flex-col h-full`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-[#00e980] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Mais Popular
                </div>
              )}
              
              <div className="p-8">
                {/* Header with Icon, Name and Price in one line */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${plan.iconBg} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <plan.icon className={`h-6 w-6 ${plan.iconColor}`} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 ml-1">{plan.period}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-400 mb-6 h-12">{plan.description}</p>
                
                <Link href="/cadastrar" className="block mb-6">
                  <Button 
                    className={`w-full font-medium py-6 rounded-md ${plan.ctaColor}`}
                  >
                    {plan.cta}
                    {plan.popular && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </Link>
              </div>
              
              <div className="p-8 pt-0 border-t border-gray-700">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#00e980] mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">
            Precisa de um plano personalizado? Entre em contato com nossa equipe de vendas.
          </p>
          <Button className="bg-[#00e980] hover:bg-[#00c870] text-black font-medium py-6 px-8">
            Falar com um Especialista
          </Button>
        </div>
      </div>
    </section>
  );
}
