"use client";

import { Star, Quote } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Ana Silva",
      role: "Gerente de Atendimento, TechSolutions",
      content: "O Nexus Agents transformou completamente nosso atendimento ao cliente. Conseguimos reduzir o tempo de resposta em 80% e aumentar a satisfação dos clientes em 45%. A facilidade de configurar os agentes com nossa base de conhecimento foi impressionante.",
      stars: 5
    },
    {
      name: "Carlos Mendes",
      role: "CEO, Retail Express",
      content: "Implementamos o Nexus Agents há 3 meses e já vimos um aumento de 30% nas conversões de vendas pelo WhatsApp. A capacidade dos agentes de acessar informações específicas sobre nossos produtos é um diferencial incrível.",
      stars: 5
    },
    {
      name: "Patrícia Oliveira",
      role: "Diretora de Marketing, FinanceGroup",
      content: "A personalização dos agentes para diferentes departamentos nos permitiu oferecer um atendimento especializado em cada área. O suporte da equipe durante a implementação foi excepcional.",
      stars: 4
    }
  ];

  return (
    <section className="py-24 bg-[#151522]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            O que nossos <span className="text-[#00e980]">clientes</span> dizem
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Empresas de diversos segmentos já estão transformando seu atendimento com o Nexus Agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-[#1e1e2d] p-8 rounded-xl border border-gray-700 flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:border-[#00e980] hover:shadow-lg hover:shadow-[#00e980]/10"
            >
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="h-12 w-12 text-[#00e980]" />
              </div>
              
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${
                      i < testimonial.stars 
                        ? "text-[#00e980] fill-[#00e980]" 
                        : "text-gray-600"
                    }`} 
                  />
                ))}
              </div>
              
              <p className="text-gray-300 mb-8 flex-grow">
                "{testimonial.content}"
              </p>
              
              <div className="pt-4 border-t border-gray-700">
                <h4 className="font-semibold text-white">{testimonial.name}</h4>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-[#0d0d17] rounded-full border border-gray-700">
            <span className="text-[#00e980] font-medium">Avaliação média:</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className="h-4 w-4 text-[#00e980] fill-[#00e980]" 
                />
              ))}
            </div>
            <span className="text-white font-medium">4.9/5</span>
          </div>
        </div>
      </div>
    </section>
  );
}
