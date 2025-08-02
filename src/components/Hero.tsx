import { Button } from "@/components/ui/button";
import { Heart, Calendar, Gift, ArrowRight } from "lucide-react";
import ivyHero from "@/assets/ivy-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-gentle-float"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-gentle-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-gentle-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-accent/20 rounded-full px-5 py-3 backdrop-blur-sm">
                <span className="text-2xl">🐾</span>
                <span className="text-sm font-medium text-accent-foreground">Certified Therapy Dog</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold leading-tight">
                <span className="text-gradient-golden">Bringing Joy,</span>
                <br />
                <span className="text-foreground">One Paw at a Time</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Meet Ivy, our certified golden doodle therapy dog, spreading comfort, joy, and healing 
                to those who need it most through professional therapy visits.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start max-w-2xl mx-auto lg:mx-0">
              <Button 
                variant="golden" 
                size="lg" 
                className="group text-base px-8 py-4 flex-1 sm:flex-none min-w-[200px]"
              >
                <Calendar className="w-5 h-5" />
                Schedule a Visit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="therapy" 
                size="lg" 
                className="text-base px-8 py-4 flex-1 sm:flex-none min-w-[180px]"
              >
                <Heart className="w-5 h-5" />
                Learn About Ivy
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="text-base px-8 py-4 flex-1 sm:flex-none min-w-[160px]"
              >
                <Gift className="w-5 h-5" />
                Donate Today
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-border/30 max-w-lg mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Visits Made</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">50+</div>
                <div className="text-sm text-muted-foreground">Facilities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">1000+</div>
                <div className="text-sm text-muted-foreground">Smiles Created</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative lg:pl-8">
            <div className="relative rounded-3xl overflow-hidden shadow-warm bg-gradient-warm p-8">
              <img
                src={ivyHero}
                alt="Ivy, our beautiful golden doodle therapy dog"
                className="w-full h-auto rounded-2xl shadow-soft"
              />
              
              {/* Floating elements */}
              <div className="absolute top-6 right-6 bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-soft animate-paw-bounce">
                <Heart className="w-6 h-6 text-primary" fill="currentColor" />
              </div>
              
              <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-sm rounded-xl p-4 shadow-soft">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">Certified & Ready</span>
                </div>
              </div>
            </div>

            {/* Decorative paw prints */}
            <div className="absolute -top-6 -left-6 text-primary/20 text-4xl animate-gentle-float">🐾</div>
            <div className="absolute -bottom-10 -right-10 text-primary/20 text-6xl animate-gentle-float" style={{ animationDelay: '1.5s' }}>🐾</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;