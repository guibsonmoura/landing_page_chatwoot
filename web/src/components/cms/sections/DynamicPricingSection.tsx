// Dynamic Pricing Section Component
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getPlanIcon } from "@/lib/plan-icons";
import { SectionProps } from "../DynamicSection";

interface Plan {
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

export function DynamicPricingSection({ title, subtitle, content }: SectionProps) {
  const pricingContent = content as PricingContent;

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-[#151522] to-[#0d0d17]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingContent.plans.map((plan, index) => {
            const { icon: IconComponent, iconColor, bgGradient } = getPlanIcon(plan.name);
            const isPopular = plan.popular;
            
            return (
              <div 
                key={index}
                className={`relative rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  isPopular 
                    ? 'border-[#00e980] shadow-lg shadow-[#00e980]/20' 
                    : 'border-gray-800 hover:border-[#00e980]/30'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#00e980] text-black px-4 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                {/* Card Content */}
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-8 rounded-2xl h-full flex flex-col">
                  {/* Header with Icon, Name and Price */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                        <IconComponent className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {plan.name}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-white">
                          {plan.price}
                        </span>
                        <span className="text-gray-400 ml-1">
                          {plan.period}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {plan.description}
                  </p>
                  
                  {/* Features */}
                  <div className="flex-1 mb-8">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-[#00e980] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* CTA Button */}
                  <Button 
                    size="lg" 
                    className={`w-full font-medium ${
                      isPopular
                        ? 'bg-[#00e980] hover:bg-[#00c870] text-black'
                        : plan.name === 'Enterprise'
                        ? 'bg-transparent border-2 border-[#00e980] text-[#00e980] hover:bg-[#00e980] hover:text-black'
                        : 'bg-transparent border-2 border-[#00e980] text-[#00e980] hover:bg-[#00e980] hover:text-black'
                    }`}
                    asChild
                  >
                    <Link href={plan.name === 'Enterprise' ? '/contato' : '/signup'}>
                      {plan.cta}
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
