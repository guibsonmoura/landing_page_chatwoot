'use client';

import { motion } from "framer-motion";
import { SectionProps } from "../DynamicSection";
import { MessageSquare, Users, Bot, BarChart3, Cable } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

interface HowItWorksContent {
  steps: Step[];
}

const stepIcons = [MessageSquare, Bot, Cable];

const mockScreens = [
  "/images/product/caixa_de_entrada.png",
  "/images/product/analytics.png", 
  "/images/product/channels.png"
];

export function DynamicHowItWorksSection({ title, subtitle, content }: SectionProps) {
  const howItWorksContent = content as HowItWorksContent;

  return (
    <section id="como-funciona" className="py-24 bg-gradient-to-b from-[#0d0d17] to-[#151522] relative overflow-hidden">
      {/* Sutil background com gradiente radial */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#00e980,_transparent_70%)]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Cabeçalho */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Timeline minimalista */}
          <div className="space-y-12 relative border-l border-gray-700 pl-8">
            {howItWorksContent.steps.map((step, index) => {
              const Icon = stepIcons[index] || MessageSquare;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Ponto pulsante */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -left-[34px] w-4 h-4 rounded-full bg-[#00e980] border-2 border-gray-900"
                  />
                  
                  {/* Card minimalista */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00e980] to-[#4d7cfe] flex items-center justify-center text-black">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#00e980] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mockup animado das telas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative w-full max-w-lg mx-auto"
          >
            <div className="rounded-2xl border border-gray-800 overflow-hidden shadow-xl bg-black/40">
              <motion.div
                animate={{ x: ["0%", "-100%"] }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                className="flex w-[300%]"
              >
                {mockScreens.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`App screen ${idx + 1}`}
                    className="max-h-80 object-contain flex-shrink-0 mx-auto"
                  />
                ))}
              </motion.div>
            </div>
            <p className="text-center text-gray-500 text-sm mt-4">
              Visualize como seu time trabalha no fluxo de atendimento
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
