// Dynamic Landing Page Component
import { getCMSPageBySlug } from '@/lib/actions/cms.actions';
import { DynamicSection } from './DynamicSection';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export async function DynamicLandingPage() {
  // Fetch CMS content for home page
  const { page, components } = await getCMSPageBySlug('home');

  // Fallback to static content if CMS is not available
  if (!page || components.length === 0) {
    // Import static components as fallback
    const { HeroSection } = await import('@/components/landing/HeroSection');
    const { FeaturesSection } = await import('@/components/landing/FeaturesSection');
    const { HowItWorksSection } = await import('@/components/landing/HowItWorksSection');
    const { TestimonialsSection } = await import('@/components/landing/TestimonialsSection');
    const { PricingSection } = await import('@/components/landing/PricingSection');

    return (
      <div className="min-h-screen bg-[#0d0d17]">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <PricingSection />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d17]">
      <Navbar />
      <main>
        {components.map((component) => (
          <DynamicSection 
            key={component.id} 
            component={component} 
          />
        ))}
      </main>
      <Footer />
    </div>
  );
}
