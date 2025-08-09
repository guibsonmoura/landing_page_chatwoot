// Dynamic Hero Section Component
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionProps } from "../DynamicSection";

interface HeroContent {
  description: string;
  cta_primary: string;
  cta_secondary: string;
  stats: Array<{
    value: string;
    label: string;
  }>;
}

export function DynamicHeroSection({ title, subtitle, content }: SectionProps) {
  const heroContent = content as HeroContent;

  return (
    <section className="relative min-h-screen flex items-center bg-[#0d0d17] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d17] via-[#151522] to-[#0d0d17]"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00e980] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-[#4d7cfe] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#e34ba9] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="font-bold mb-6 leading-tight">
              <span className="block text-4xl lg:text-6xl text-white mb-2">{title}</span>
              <span className="block text-5xl lg:text-7xl text-[#00e980] font-black mb-1">{subtitle}</span>
              <span className="block text-4xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#00e980] to-[#4d7cfe]">
                inteligentes
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              {heroContent.description}
            </p>
            

            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 lg:gap-8 mt-8">
              {heroContent.stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00e980] rounded-full flex-shrink-0"></div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-semibold text-lg">{stat.value}</span>
                    <span className="text-gray-400 text-sm">{stat.label}</span>
                  </div>
                </div>
              ))}
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
