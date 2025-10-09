// Dynamic Hero Section Component
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionProps } from "../DynamicSection";
import { motion } from "framer-motion";

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
    <section className="relative min-h-screen flex items-center bg-[#0d0d17]">
      <div className="container mx-auto px-6 lg:px-12 py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {title}
              </h1>
              <h2 className="text-2xl lg:text-4xl font-semibold text-[#00e980] mt-2">
                {subtitle}
              </h2>
            </div>

            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              {heroContent.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button className="px-6 py-3 text-lg rounded-full bg-[#00e980] text-black hover:bg-[#00c76d] transition">
                  {heroContent.cta_primary}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  className="px-6 py-3 text-lg rounded-full border-gray-600 text-gray-300 hover:bg-gray-800 transition"
                >
                  {heroContent.cta_secondary}
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-800">
              {heroContent.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index, duration: 0.5 }}
                  className="text-left"
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
              <img
                src="/images/product/analytics.png"
                alt="Analytics Dashboard"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            {/* Glow effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#00e980]/20 to-transparent blur-3xl -z-10"
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
