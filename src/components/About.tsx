import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Award, Users, Calendar, Star, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

const About = () => {
  // Extended gallery images pool
  const allGalleryImages = [
    { src: "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy with a patient in the garden" },
    { src: "https://images.unsplash.com/photo-1439886183900-e79ec0057170?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy during a therapy session" },
    { src: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy visiting a care facility" },
    { src: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy playing with children" },
    { src: "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy comforting an elderly patient" },
    { src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy in a hospital corridor" },
    { src: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy with healthcare workers" },
    { src: "https://images.unsplash.com/photo-1560743173-567a3b5658b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy during reading therapy" },
    { src: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy visiting a nursing home" },
    { src: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy bringing joy to patients" },
    { src: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy in a school setting" },
    { src: "https://images.unsplash.com/photo-1594736797933-d0f1dcf8cd87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", alt: "Ivy providing emotional support" }
  ];

  // State for current gallery images (4 at a time)
  const [currentImageSet, setCurrentImageSet] = useState(0);
  
  // Get current 4 images to display
  const getCurrentImages = () => {
    const startIndex = currentImageSet * 4;
    return allGalleryImages.slice(startIndex, startIndex + 4);
  };

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageSet((prev) => {
        const maxSets = Math.ceil(allGalleryImages.length / 4) - 1;
        return prev >= maxSets ? 0 : prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [allGalleryImages.length]);

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
                    With dedicated training and certification, Ivy turned that natural gift into 
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
                      <span>Certified therapy dog with specialized training</span>
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

      {/* The Proven Impact of Therapy Dogs Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
              The Proven Impact of Therapy Dogs
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Research worldwide shows that therapy dog visits help people of all ages—from children in hospitals, 
              to students under academic stress, to seniors in long-term care. Interacting with a therapy dog can 
              lower stress hormones, reduce blood pressure, ease pain, and boost endorphins that create feelings 
              of happiness and well-being.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Benefits */}
            <div>
              <h3 className="text-2xl font-heading font-bold text-foreground mb-6">
                A visit from Ivy can provide:
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-foreground">Emotional comfort & stress relief</p>
                    <p className="text-muted-foreground text-sm">reduces anxiety and uplifts mood</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-foreground">Improved physical health</p>
                    <p className="text-muted-foreground text-sm">lowers blood pressure and heart rate, lessens perception of pain</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-foreground">Motivation for therapy & rehabilitation</p>
                    <p className="text-muted-foreground text-sm">encourages movement and participation in treatment</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-foreground">Cognitive stimulation</p>
                    <p className="text-muted-foreground text-sm">helps with memory recall, attention, and communication</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-foreground">Social connection</p>
                    <p className="text-muted-foreground text-sm">sparks conversation, empathy, and a sense of belonging</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Snapshot */}
            <div>
              <Card className="bg-gradient-golden/10 border-primary/20 shadow-soft">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl mb-3">📊</div>
                    <h3 className="font-heading font-bold text-lg text-foreground">
                      Making a Difference, One Visit at a Time
                    </h3>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">
                        Up to <span className="font-semibold text-foreground">79%</span> of patients report reduced stress and anxiety after a therapy dog visit
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">85%</span> of healthcare workers feel less stressed and more satisfied after therapy dog interactions
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">
                        Children in reading-to-dog programs show significant improvements in reading scores and confidence
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">
                        Seniors in care homes report less loneliness and depression with regular therapy dog visits
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground italic text-center">
                      (Sources: peer-reviewed hospital, school, and elder care studies, 2015–2024)
                    </p>
                  </div>
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
            {getCurrentImages().map((image, index) => (
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