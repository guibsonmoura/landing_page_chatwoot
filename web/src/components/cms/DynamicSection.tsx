// Dynamic Section Component for CMS
'use client';

import React from 'react';
import { CMSComponent } from '@/lib/actions/cms.actions';
import { DynamicHeroSection } from './sections/DynamicHeroSection';
import { DynamicFeaturesSection } from './sections/DynamicFeaturesSection';
import { DynamicHowItWorksSection } from './sections/DynamicHowItWorksSection';
import { DynamicTestimonialsSection } from './sections/DynamicTestimonialsSection';
import { DynamicPricingSection } from './sections/DynamicPricingSection';

interface DynamicSectionProps {
  component: CMSComponent;
}

export function DynamicSection({ component }: DynamicSectionProps) {
  const { component_type, title, subtitle, content } = component;

  // Render different components based on type
  switch (component_type) {
    case 'hero':
      return (
        <DynamicHeroSection
          title={title}
          subtitle={subtitle}
          content={content}
        />
      );

    case 'features':
      return (
        <DynamicFeaturesSection
          title={title}
          subtitle={subtitle}
          content={content}
        />
      );

    case 'how_it_works':
      return (
        <DynamicHowItWorksSection
          title={title}
          subtitle={subtitle}
          content={content}
        />
      );

    case 'testimonials':
      return (
        <DynamicTestimonialsSection
          title={title}
          subtitle={subtitle}
          content={content}
        />
      );

    case 'pricing':
      return (
        <DynamicPricingSection
          title={title}
          subtitle={subtitle}
          content={content}
        />
      );

    default:
      // Fallback for unknown component types
      return (
        <section className="py-24 bg-[#0d0d17]">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {title || 'Seção Personalizada'}
            </h2>
            {subtitle && (
              <p className="text-gray-400 mb-8">{subtitle}</p>
            )}
            <div className="text-gray-300">
              <pre className="bg-gray-800 p-4 rounded-lg text-left overflow-auto">
                {JSON.stringify(content, null, 2)}
              </pre>
            </div>
          </div>
        </section>
      );
  }
}

// Props interface for section components
export interface SectionProps {
  title?: string;
  subtitle?: string;
  content: any;
}
