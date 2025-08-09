// Dynamic How It Works Section Component
'use client';

import { useState, useEffect } from 'react';
import { SectionProps } from "../DynamicSection";

interface Step {
  title: string;
  description: string;
  details: string[];
}

interface HowItWorksContent {
  steps: Step[];
}

const productImages = [
  "/images/product/agents.png",
  "/images/product/knowledge.png", 
  "/images/product/analytics.png"
];

export function DynamicHowItWorksSection({ title, subtitle, content }: SectionProps) {
  const howItWorksContent = content as HowItWorksContent;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-[#0d0d17] to-[#151522]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Steps */}
          <div className="space-y-8">
            {howItWorksContent.steps.map((step, index) => (
              <div 
                key={index}
                className="flex gap-6 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00e980] to-[#4d7cfe] rounded-full flex items-center justify-center text-black font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-[#00e980] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-gray-300">
                        <div className="w-2 h-2 bg-[#00e980] rounded-full mr-3 flex-shrink-0"></div>
                        <span className="text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          {/* Product Images Carousel */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-xl shadow-2xl border border-gray-800">
              <div className="relative h-96">
                {productImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Nexus Agents Product ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
            
            {/* Image Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'bg-[#00e980] scale-125' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
