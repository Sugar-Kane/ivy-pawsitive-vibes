import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Award, Users, Calendar } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-20 bg-gradient-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">About Our Mission</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Meet Ivy, Our <span className="text-gradient-golden">Gentle Healer</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ivy is more than just a golden doodle – she's a certified therapy dog with a special gift 
            for bringing comfort, joy, and healing to people of all ages in their time of need.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Story Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                Ivy's Journey to Healing Hearts
              </h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Our journey began when we witnessed the incredible bond between humans and therapy animals. 
                  Ivy, with her gentle nature and intuitive understanding of human emotions, showed a natural 
                  talent for providing comfort to those in need.
                </p>
                <p>
                  After completing rigorous certification training, Ivy became a registered therapy dog, 
                  ready to spread love and healing in hospitals, nursing homes, schools, and community centers. 
                  Her soft golden curls and warm brown eyes have the power to light up any room she enters.
                </p>
                <p>
                  Every visit is a reminder of the profound impact that the unconditional love of a therapy 
                  dog can have on someone's day, week, or even life. Through Ivy's Therapy Paws, we're 
                  committed to making these healing moments accessible to everyone who needs them.
                </p>
              </div>
            </div>

            <Button variant="golden" size="lg" className="group">
              <Calendar className="w-5 h-5" />
              Schedule a Visit with Ivy
            </Button>
          </div>

          {/* Stats & Certifications */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft hover:shadow-warm transition-warm">
                <CardContent className="p-6 text-center">
                  <Award className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">Certified</div>
                  <div className="text-sm text-muted-foreground">Therapy Dog</div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft hover:shadow-warm transition-warm">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">3 Years</div>
                  <div className="text-sm text-muted-foreground">Experience</div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft hover:shadow-warm transition-warm">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 text-primary mx-auto mb-3" fill="currentColor" />
                  <div className="text-2xl font-bold text-foreground mb-1">500+</div>
                  <div className="text-sm text-muted-foreground">Lives Touched</div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft hover:shadow-warm transition-warm">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground mb-1">Weekly</div>
                  <div className="text-sm text-muted-foreground">Visits</div>
                </CardContent>
              </Card>
            </div>

            {/* Special qualities */}
            <Card className="bg-gradient-golden/10 border-primary/20 shadow-soft">
              <CardContent className="p-6">
                <h4 className="font-heading font-semibold text-foreground mb-4">What Makes Ivy Special</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Gentle, calm temperament perfect for all ages</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Certified through Pet Partners therapy dog program</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Hypoallergenic golden doodle coat</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Excellent with children, seniors, and special needs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;