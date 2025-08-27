import Navigation from "@/components/ui/navigation";
import Hero from "@/components/Hero";
import StickyBookingCTA from "@/components/StickyBookingCTA";
import { SEOHead } from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Ivy Therapy - Professional Therapy Dog Services"
        description="Ivy brings healing and comfort to hospitals, nursing homes, schools, and workplaces in Midland, TX. Schedule a therapy dog visit today."
        keywords="therapy dog, emotional support, healing, Midland TX, hospital visits, nursing home therapy"
        canonical="/"
      />
      <Navigation />
      <Hero />
      <StickyBookingCTA />
    </div>
  );
};

export default Index;
