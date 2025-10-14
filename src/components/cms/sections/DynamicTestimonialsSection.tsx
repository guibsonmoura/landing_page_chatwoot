// Dynamic Testimonials Section Component
'use client';

import { Star } from "lucide-react";
import { SectionProps } from "../DynamicSection";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

interface TestimonialsContent {
  testimonials: Testimonial[];
  stats: {
    rating: string;
    total_reviews: string;
  };
}

export function DynamicTestimonialsSection({ title, subtitle, content }: SectionProps) {
  const testimonialsContent = content as TestimonialsContent;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating 
            ? 'text-[#00e980] fill-current' 
            : 'text-gray-600'
        }`}
      />
    ));
  };

  return (
    <section className="py-24 bg-[#0d0d17]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            {subtitle}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <div className="flex">
                {renderStars(5)}
              </div>
              <span className="text-2xl font-bold text-white">
                {testimonialsContent.stats.rating}
              </span>
              <span className="text-gray-400">
                ({testimonialsContent.stats.total_reviews} avaliações)
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonialsContent.testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-8 rounded-xl border border-gray-800 hover:border-[#00e980]/30 transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              {/* Content */}
              <blockquote className="text-gray-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00e980] to-[#4d7cfe] rounded-full flex items-center justify-center mr-4">
                  <span className="text-black font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
