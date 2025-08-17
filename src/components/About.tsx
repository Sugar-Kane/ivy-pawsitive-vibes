import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Award, Users, Calendar, Star, MapPin } from "lucide-react";

const About = () => {
  // Placeholder images for gallery
  const galleryImages = [
    { src: "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy with a patient in the garden" },
    { src: "https://images.unsplash.com/photo-1439886183900-e79ec0057170?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy during a therapy session" },
    { src: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy visiting a care facility" },
    { src: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy playing with children" },
  ];

  return (
    <div className="bg-gradient-warm">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-6 py-3 mb-6">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">About Our Mission</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-8">
                Meet Ivy, Our <span className="text-gradient-golden">Gentle Healer</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-4xl leading-relaxed">
                Ivy is more than just a golden doodle – she's a certified therapy dog with a special gift 
                for bringing comfort, joy, and healing to people of all ages in their time of need.
              </p>
            </div>
            <div className="relative">
              <div className="relative mx-auto max-w-md">
                <img
                  src="/lovable-uploads/d9959ce2-f4f0-4aa0-a500-5514aacbc97c.png"
                  alt="Ivy, the golden doodle therapy dog, sitting on grass with a happy expression"
                  className="w-full h-auto rounded-2xl shadow-warm"
                />
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-full animate-gentle-float"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-accent/20 rounded-full animate-paw-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ivy's Story Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Story Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  Ivy's Journey to Healing Hearts
                </h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Ivy's story began in the rolling fields of Ohio, where her gentle spirit was clear from the start. 
                    From the moment she joined her family, she showed a gift for connecting with people, running to 
                    comfort, leaning in for reassurance, and brightening every room she entered.
                  </p>
                  <p>
                    With dedicated training and certification through Pet Partners, Ivy turned that natural gift into 
                    a calling. She worked her way through obedience, advanced skills, and therapy dog training, proving 
                    that her heart was just as strong as her discipline.
                  </p>
                  <p>
                    Now in Midland, TX, Ivy brings her warmth to hospitals, nursing homes, schools, and workplaces. 
                    Her soft curls invite hands to pet, her calm presence eases stress, and her playful spark reminds 
                    people to smile. Whether she's sitting beside a patient in hospice or greeting a classroom full of 
                    children, Ivy creates moments that heal.
                  </p>
                  <p>
                    Inviting Ivy isn't just about a visit. It's about sharing the love of a therapy dog whose story is 
                    rooted in kindness, joy, and the simple power of being there when someone needs it most.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats & Certifications */}
            <div className="space-y-8">
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
                  <h3 className="font-heading font-semibold text-foreground mb-4 text-lg">What Makes Ivy Special</h3>
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

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-4">
            <div className="h-px bg-border flex-1 max-w-20"></div>
            <span className="text-4xl">🐾</span>
            <div className="h-px bg-border flex-1 max-w-20"></div>
          </div>
        </div>
      </div>

      {/* Our Mission Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Mission Stats */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <Card className="bg-primary/5 border-primary/20 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <MapPin className="w-8 h-8 text-primary" />
                      <div>
                        <div className="text-xl font-bold text-foreground">50+ Facilities</div>
                        <div className="text-muted-foreground">Hospitals, nursing homes, schools</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-accent/5 border-accent/20 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Star className="w-8 h-8 text-accent" />
                      <div>
                        <div className="text-xl font-bold text-foreground">100% Positive</div>
                        <div className="text-muted-foreground">Feedback from facilities</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mission Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                Our Mission
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  We believe in the healing power of the human-animal bond. Our mission is to provide 
                  therapeutic comfort and emotional support through Ivy's gentle presence and loving nature.
                </p>
                <p>
                  Whether it's bringing a smile to a child in the hospital, offering comfort to elderly 
                  residents, or helping students manage stress, Ivy's visits create moments of joy and 
                  connection that can make all the difference.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-4">
            <div className="h-px bg-border flex-1 max-w-20"></div>
            <span className="text-4xl">🐾</span>
            <div className="h-px bg-border flex-1 max-w-20"></div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Ivy in Action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See the joy and comfort Ivy brings to patients, residents, and visitors through her therapy work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryImages.map((image, index) => (
              <Card key={index} className="group overflow-hidden shadow-soft hover:shadow-warm transition-all duration-300 cursor-pointer">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-gradient-golden/10 border-primary/20 shadow-soft">
            <CardContent className="p-8">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
                Ready to Experience Ivy's Healing Presence?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Schedule a visit for your facility, organization, or loved one. Let Ivy bring comfort, 
                joy, and therapeutic healing to those who need it most.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="golden" size="lg" className="group text-base px-8 py-4">
                  <Calendar className="w-5 h-5" />
                  Schedule a Visit with Ivy
                </Button>
                <Button variant="outline" size="lg" className="text-base px-8 py-4">
                  <Heart className="w-5 h-5" />
                  Support Our Mission
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;