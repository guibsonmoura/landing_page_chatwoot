"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  const plans = [
    {
      name: "Básico",
      price: "R$99",
      period: "/mês",
      description: "Ideal para pequenas empresas iniciando com IA",
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
      ctaColor: "bg-[#151522] hover:bg-[#1e1e2d]"
    },
    {
      name: "Pro",
      price: "R$299",
      period: "/mês",
      description: "Para empresas em crescimento que precisam de mais recursos",
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
      ctaColor: "bg-[#151522] hover:bg-[#1e1e2d]"
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
              className={`relative rounded-xl overflow-hidden border ${plan.color} bg-[#151522]`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-[#00e980] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Mais Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                
                <Link href="/signup" className="block">
                  <Button 
                    className={`w-full font-medium py-6 rounded-md ${plan.ctaColor}`}
                  >
                    {plan.cta}
                    {plan.popular && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </Link>
              </div>
              
              <div className="p-8 bg-[#1e1e2d] border-t border-gray-700">
                <ul className="space-y-4">
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
