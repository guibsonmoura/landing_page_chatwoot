import { getCMSPageBySlug } from '@/lib/actions/cms.actions';
import { DynamicSection } from './DynamicSection';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export async function DynamicLandingPage() {
  
  const { page, components } = await getCMSPageBySlug('home');

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
