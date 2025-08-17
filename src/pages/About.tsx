import Navigation from "@/components/ui/navigation";
import About from "@/components/About";
import Mission from "@/components/Mission";
import Footer from "@/components/Footer";
import StickyBookingCTA from "@/components/StickyBookingCTA";
import DonationPrompt from "@/components/DonationPrompt";
import NewsletterSignup from "@/components/NewsletterSignup";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <About />
        <Mission />
        
        {/* Donation Prompt */}
        <section className="py-16 bg-gradient-soft">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <DonationPrompt context="about" />
          </div>
        </section>
        
        {/* Newsletter Signup */}
        <section className="py-16 bg-background">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <NewsletterSignup />
          </div>
        </section>
      </div>
      <Footer />
      <StickyBookingCTA />
    </div>
  );
};

export default AboutPage;