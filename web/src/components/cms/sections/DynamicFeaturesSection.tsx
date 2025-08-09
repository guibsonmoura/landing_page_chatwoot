// Dynamic Features Section Component
'use client';

import { BrainCircuit, Database, MessageSquare, Users, Shield } from "lucide-react";
import { SectionProps } from "../DynamicSection";

interface Feature {
  title: string;
  description: string;
  benefits: string[];
}

interface FeaturesContent {
  features: Feature[];
}

const featureIcons = [
  BrainCircuit, // Gerador de Alma
  Database,     // RAG por Agente
  MessageSquare, // Deploy Multi-Canal
  Users,        // Perfis de Cliente
  Shield        // Multi-Tenant Seguro
];

export function DynamicFeaturesSection({ title, subtitle, content }: SectionProps) {
  const featuresContent = content as FeaturesContent;

  return (
    <section id="features" className="py-24 bg-[#0d0d17]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresContent.features.map((feature, index) => {
            const IconComponent = featureIcons[index] || BrainCircuit;
            
            return (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-8 rounded-xl border border-gray-800 hover:border-[#00e980]/30 transition-all duration-300 group"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00e980] to-[#4d7cfe] rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-[#00e980] rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
