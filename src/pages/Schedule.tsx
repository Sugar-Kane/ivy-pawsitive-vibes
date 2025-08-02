import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, Mail } from "lucide-react";
import ReviewSnippets from "@/components/ReviewSnippets";
import DonationPrompt from "@/components/DonationPrompt";

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
                We serve hospitals, nursing homes, schools, and private events.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Calendar Section */}
              <div className="bg-background rounded-3xl p-8 shadow-warm border border-border/50">
                <h3 className="text-2xl font-heading font-bold mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-primary" />
                  Available Times
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">Weekday Visits</h4>
                        <p className="text-sm text-muted-foreground">Monday - Friday, 10 AM - 4 PM</p>
                      </div>
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">Weekend Events</h4>
                        <p className="text-sm text-muted-foreground">Saturday - Sunday, By appointment</p>
                      </div>
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
                
                <Button variant="golden" size="lg" className="w-full">
                  <Calendar className="w-5 h-5 mr-2" />
                  Request Available Dates
                </Button>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div className="bg-background rounded-3xl p-8 shadow-warm border border-border/50">
                  <h3 className="text-2xl font-heading font-bold mb-6">Contact for Booking</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-gentle">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">(555) 123-4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-gentle">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">schedule@ivystherapypaws.org</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-gentle">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Service Area</p>
                        <p className="text-sm text-muted-foreground">30-mile radius from downtown</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-warm rounded-3xl p-8 text-background">
                  <h4 className="text-xl font-heading font-bold mb-4">Special Events</h4>
                  <p className="text-background/90 mb-4">
                    Planning a special event? Ivy loves attending birthday parties, graduations, 
                    memorial services, and community gatherings to spread joy and comfort.
                  </p>
                  <Button variant="outline" className="bg-transparent border-background text-background hover:bg-background hover:text-foreground">
                    Learn About Event Visits
                  </Button>
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