import Navigation from "@/components/ui/navigation";
import Hero from "@/components/Hero";
import StickyBookingCTA from "@/components/StickyBookingCTA";

const Index = () => {
  return (
    <div className="h-screen overflow-hidden">
      <Navigation />
      <Hero />
      <StickyBookingCTA />
    </div>
  );
};

export default Index;
