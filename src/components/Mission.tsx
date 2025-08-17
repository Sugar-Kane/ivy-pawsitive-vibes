import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Home, GraduationCap, Building, Smile, ArrowRight } from "lucide-react";

const Mission = () => {
  const services = [
    {
      icon: Building,
      title: "Hospital Visits",
      description: "Bringing comfort to patients, families, and medical staff during challenging times.",
      color: "text-blue-500"
    },
    {
      icon: Home,
      title: "Senior Living",
      description: "Spreading joy and companionship to residents in nursing homes and assisted living facilities.",
      color: "text-green-500"
    },
    {
      icon: GraduationCap,
      title: "Schools & Libraries",
      description: "Supporting students through reading programs, stress relief during exams, and special events.",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Community Events",
      description: "Participating in local gatherings, fundraisers, and awareness events to spread happiness.",
      color: "text-orange-500"
    }
  ];

  return (
    <section id="mission" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <Heart className="w-5 h-5 text-primary" fill="currentColor" />
            <span className="text-primary font-medium">Our Mission</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
            <span className="text-gradient-golden">Healing Hearts</span> Through Therapy
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We believe in the profound healing power of the human-animal bond. Our mission is to provide 
            professional therapy dog services that bring comfort, reduce stress, and spread unconditional love 
            to those who need it most.
          </p>
        </div>


        {/* Services Grid */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-center text-foreground mb-12">
            Where Ivy Spreads Joy
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card 
                key={service.title} 
                className="group bg-card border-border shadow-soft hover:shadow-warm transition-warm hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-warm mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className={`w-8 h-8 ${service.color}`} />
                  </div>
                  <h4 className="font-heading font-semibold text-foreground mb-3 text-lg">
                    {service.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">
              The Impact of Therapy Dogs
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p>
                Research has consistently shown that interactions with therapy dogs can significantly 
                reduce stress hormones, lower blood pressure, and release endorphins that promote 
                feelings of well-being and happiness.
              </p>
              <p>
                For children in hospitals, elderly residents in care facilities, and students 
                facing academic pressures, a visit from Ivy can provide:
              </p>
              <ul className="ml-6 space-y-2">
                <li>• Emotional comfort and stress relief</li>
                <li>• Improved mood and reduced anxiety</li>
                <li>• Motivation for physical therapy and rehabilitation</li>
                <li>• Social interaction and communication stimulation</li>
                <li>• Moments of pure joy and laughter</li>
              </ul>
            </div>
            <Button variant="golden" size="lg" className="group">
              <Heart className="w-5 h-5" />
              Request a Visit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="relative">
            <Card className="bg-gradient-warm border-border/50 shadow-warm p-8">
              <CardContent className="p-0">
                <div className="text-center space-y-6">
                  <div className="text-4xl animate-paw-bounce">❤️</div>
                  <h4 className="font-heading font-bold text-xl text-foreground">
                    Making a Difference, One Visit at a Time
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">98%</div>
                      <div className="text-sm text-muted-foreground">Report Improved Mood</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">85%</div>
                      <div className="text-sm text-muted-foreground">Reduced Anxiety</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">92%</div>
                      <div className="text-sm text-muted-foreground">Request Return Visits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">100%</div>
                      <div className="text-sm text-muted-foreground">Smiles Guaranteed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;