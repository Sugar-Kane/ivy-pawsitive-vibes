import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, Mail } from "lucide-react";
import ReviewSnippets from "@/components/ReviewSnippets";
import DonationPrompt from "@/components/DonationPrompt";
import AppointmentBooking from "@/components/AppointmentBooking";

const SchedulePage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <section className="py-20 bg-gradient-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-accent/20 rounded-full px-4 py-2 backdrop-blur-sm mb-6">
                <span className="text-2xl">📅</span>
                <span className="text-sm font-medium text-accent-foreground">Schedule a Visit</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                <span className="text-gradient-golden">Book Time with Ivy</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Schedule a therapy visit with Ivy to bring comfort, joy, and healing to your facility, event, or loved ones. 
                We serve workplaces, hospitals, nursing homes, schools, and private events.
              </p>
            </div>

            <div className="grid lg:grid-cols-1 gap-12">
              {/* Main Booking Form */}
              <AppointmentBooking />

              {/* Info Section */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-background rounded-3xl p-6 shadow-warm border border-border/50 text-center">
                  <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h4 className="font-heading font-bold mb-2">Available Hours</h4>
                  <p className="text-sm text-muted-foreground">By appointment only</p>
                </div>
                
                <div className="bg-background rounded-3xl p-6 shadow-warm border border-border/50 text-center">
                  <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h4 className="font-heading font-bold mb-2">Call Us</h4>
                  <p className="text-sm text-muted-foreground">(209) 819-9985</p>
                </div>
                
                <div className="bg-background rounded-3xl p-6 shadow-warm border border-border/50 text-center">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h4 className="font-heading font-bold mb-2">Service Area</h4>
                  <p className="text-sm text-muted-foreground">15-mile radius from downtown Midland, TX</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Reviews Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ReviewSnippets maxReviews={2} />
          </div>
        </section>
        
        {/* Support Donation Prompt */}
        <section className="py-16 bg-gradient-soft">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <DonationPrompt context="schedule" compact />
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default SchedulePage;