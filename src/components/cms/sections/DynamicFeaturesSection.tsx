'use client';

import { BrainCircuit, Database, MessageSquare, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";
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
  BrainCircuit,
  Database,
  MessageSquare,
  Users,
  Shield
];

export function DynamicFeaturesSection({ title, subtitle, content }: SectionProps) {
  const featuresContent = content as FeaturesContent;

  return (
    <section id="recursos" className="py-24 bg-[#0d0d17] relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.9 }}
            className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Carrossel */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -1000, right: 0 }} // limite aproximado
          className="flex space-x-6 cursor-grab active:cursor-grabbing"
        >
          {featuresContent.features.map((feature, index) => {
            const IconComponent = featureIcons[index] || BrainCircuit;

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="
                  relative 
                  min-w-[85%] sm:min-w-[45%] lg:min-w-[30%] 
                  bg-gradient-to-br from-gray-900/60 to-gray-800/30 
                  p-8 rounded-2xl 
                  border border-gray-700 
                  shadow-lg 
                  overflow-hidden
                "
              >
                {/* Ícone decorativo no fundo */}
                <IconComponent className="absolute -right-8 -top-8 w-32 h-32 text-[#00e980]/10" />

                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 mb-6 text-sm sm:text-base">
                    {feature.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {feature.benefits.map((benefit, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="
                          px-3 py-1 text-xs sm:text-sm font-medium 
                          rounded-full 
                          bg-[#00e980]/10 
                          border border-[#00e980]/30 
                          text-[#00e980] 
                          whitespace-nowrap
                        "
                      >
                        {benefit}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
