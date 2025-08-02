import Navigation from "@/components/ui/navigation";
import Hero from "@/components/Hero";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import StickyBookingCTA from "@/components/StickyBookingCTA";
import ReviewSnippets from "@/components/ReviewSnippets";
import NewsletterSignup from "@/components/NewsletterSignup";
import { useState, useEffect } from "react";

const Index = () => {
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);

  useEffect(() => {
    // Show newsletter popup after 30 seconds
    const timer = setTimeout(() => {
      setShowNewsletterPopup(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      
      {/* Review Snippets Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ReviewSnippets maxReviews={3} />
        </div>
      </section>

      <CallToAction />
      <Footer />
      
      <StickyBookingCTA />
      
      {showNewsletterPopup && (
        <NewsletterSignup 
          variant="popup" 
          onClose={() => setShowNewsletterPopup(false)} 
        />
      )}
    </div>
  );
};

export default Index;
