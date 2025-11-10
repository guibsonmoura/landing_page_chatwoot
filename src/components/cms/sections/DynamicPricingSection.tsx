"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getPlanIcon } from "@/lib/plan-icons";
import { SectionProps } from "../DynamicSection";
import { useState, useRef, useEffect } from "react";
import { getPlanos } from "@/lib/actions/planos.actions";

interface Plan {
  [x: string]: any;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

interface PricingContent {
  plans: Plan[];
}

interface TypePlanosReal {
  uuid: string;
  price: Number;
  period: string;
  name: string;
  features:{},
  descriptions: string;
  cta: string;
  created_at: string;

}

interface ListPlanosReal{
  planosRealLista: TypePlanosReal[];
}

export function DynamicPricingSection({ title, subtitle, content }: SectionProps) {
  
  const pricingContent = content as PricingContent;

  const [activeIndex, setActiveIndex] = useState(0);
  const [planosReal, setPlanosReal] = useState([]);
  const [planoEscolhido, setPlanoEscolhido] = useState()
  const carouselRef = useRef<HTMLDivElement>(null);

  // Atualiza o índice ativo conforme o scroll
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = carouselRef.current.firstElementChild?.clientWidth ?? 1;
    const gap = 24; // gap entre cards (px), ajuste conforme Tailwind
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(index);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.addEventListener("scroll", handleScroll);
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(()=>{
    const  pegarPlanos = async() =>{

      let planos = await  getPlanos();
      
      setPlanosReal(planos)
      return planos
    }    
    pegarPlanos()

  }, [planosReal])

  const EscolherPlano = (plano: string, origem: string, name: string)=>{
    console.log('meu plano escolhido: ', plano)
    let escolhido = planosReal.find(p => p?.name == name);
    const url = `https://p.365ia.com.br/app/auth/signup?utm_source=${origem}&plan=${plano}&ud=${escolhido?.uuid ?? ""}`;
    window.location.href = url;
    
    
  }

  return (
    <section id="planos" className="relative py-24 bg-[#0d0d17] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] bg-[#00e980]/10 rounded-full blur-3xl top-20 left-1/2 -translate-x-1/2" />
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Plans - Carousel for mobile */}
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex lg:grid lg:grid-cols-3 gap-6 lg:gap-8 overflow-x-auto overflow-y-visible lg:overflow-visible snap-x snap-mandatory scrollbar-hide px-6 lg:px-0 py-8"
          >
            {pricingContent.plans.map((plan, index) => {
              const { icon: IconComponent, iconColor } = getPlanIcon(plan.name);
              
              const isPopular = plan.popular;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`relative group flex-shrink-0 w-[85vw] max-w-[340px] lg:w-auto lg:max-w-none rounded-3xl p-6 shadow-lg
                  ${isPopular ? "bg-[#111] border border-[#00e980]/40 lg:scale-105" : "bg-[#0f0f1a] border border-gray-800"}
                  snap-center
                `}
                >                  
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-[#00e980]/20 via-transparent to-[#4d7cfe]/20 blur-xl" />

                  {isPopular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 text-sm rounded-full bg-[#00e980] text-black font-medium">
                        Recomendado
                      </span>
                    </div>
                  )}

                  {/* Icon + Header */}
                  <div className="relative flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shadow-inner">
                      <IconComponent className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                      <p className="text-gray-500 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="relative mb-6">
                    <span className="text-3xl lg:text-4xl font-bold text-white">{plan.price}</span>
                    <span className="ml-1 text-gray-400">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="relative space-y-2 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3 text-sm text-gray-300">
                        <Check className="w-5 h-5 text-[#00e980] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    size="lg"
                    onClick={()=>{
                      
                      EscolherPlano(plan.nami ,'pricing-page', plan.name)
                    }}
                    className={`relative w-full font-medium rounded-xl transition
                    ${isPopular
                        ? "bg-[#00e980] hover:bg-[#00c870] text-black"
                        : "bg-transparent border border-[#00e980] text-[#00e980] hover:bg-[#00e980] hover:text-black"
                      }`}
                    asChild
                  >
                    <p>{plan.cta}</p>
                    {/* <Link href={`http://localhost:3000/app/auth/signup?utm_source=pricing-page&plan=${plan.nami}`}>
                      {plan.cta}
                    </Link> */}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-4 gap-2 lg:hidden">
          {pricingContent.plans.map((_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i === activeIndex ? "bg-[#00e980]" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
