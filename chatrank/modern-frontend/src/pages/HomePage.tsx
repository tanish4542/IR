import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import QuickSearch from '@/components/QuickSearch';

export default function HomePage() {
  return (
    <div className="py-10 md:py-16">
      <Hero onOpenChat={() => {}} />
      <Features />
      <HowItWorks />
      <QuickSearch />
    </div>
  );
}


