import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Heart, Gift, Mail, Phone, MapPin } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-6 animate-gentle-float">🐾</div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Ready to Experience the <span className="text-gradient-golden">Ivy Magic</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Whether you're looking to schedule a therapy visit, support our mission through donations, 
            or spread awareness with our merchandise, we'd love to hear from you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="golden" size="lg" className="group text-base px-8 py-4">
              <Calendar className="w-5 h-5" />
              Schedule a Visit
            </Button>
            <Button variant="therapy" size="lg" className="text-base px-8 py-4">
              <Gift className="w-5 h-5" />
              Make a Donation
            </Button>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-soft hover:shadow-warm transition-warm">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-golden rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Schedule Visits</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Book therapy sessions for hospitals, schools, or care facilities
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-soft hover:shadow-warm transition-warm">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-golden rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-foreground" fill="currentColor" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Support Our Mission</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Help us reach more people through donations and sponsorships
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Donate
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-soft hover:shadow-warm transition-warm">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-golden rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">Shop & Support</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Beautiful merchandise featuring Ivy helps fund our programs
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Shop Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="bg-background/90 backdrop-blur-sm border-border shadow-warm">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                Get in Touch
              </h3>
              <p className="text-muted-foreground">
                We're here to help and answer any questions you might have.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Email Us</div>
                  <a href="mailto:hello@ivystherapypaws.org" className="text-primary hover:underline">
                    hello@ivystherapypaws.org
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Call Us</div>
                  <a href="tel:+12098199985" className="text-primary hover:underline">
                    (209) 819-9985
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Visit Us</div>
                  <div className="text-muted-foreground text-sm">
                    Serving Midland, TX Area
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CallToAction;