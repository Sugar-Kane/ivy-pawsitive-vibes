import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <section className="py-20 bg-gradient-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-accent/20 rounded-full px-4 py-2 backdrop-blur-sm mb-6">
                <span className="text-2xl">📞</span>
                <span className="text-sm font-medium text-accent-foreground">Get in Touch</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                <span className="text-gradient-golden">Contact Us</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Ready to schedule a visit with Ivy or have questions about our therapy dog services? 
                We'd love to hear from you and discuss how Ivy can bring joy to your community.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="shadow-warm border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading flex items-center">
                    <MessageCircle className="w-6 h-6 mr-3 text-primary" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Enter your first name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Enter your last name" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="(209) 819-9985" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization/Facility (Optional)</Label>
                    <Input id="organization" placeholder="Hospital, school, nursing home, etc." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What would you like to discuss?" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us about your therapy visit needs, questions, or how we can help..."
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <Button variant="golden" size="lg" className="w-full">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                {/* Direct Contact */}
                <Card className="shadow-warm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl">Direct Contact</CardTitle>
                    <CardDescription>Reach us directly for immediate assistance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-secondary/50 transition-gentle">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">(209) 819-9985</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-secondary/50 transition-gentle">
                      <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">hello@ivystherapypaws.org</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-secondary/50 transition-gentle">
                      <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">Service Area</p>
                        <p className="text-sm text-muted-foreground">Midland, TX Area</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Office Hours */}
                <Card className="shadow-warm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-primary" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="font-medium">Monday - Friday</span>
                      <span className="text-muted-foreground">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="font-medium">Saturday</span>
                      <span className="text-muted-foreground">By appointment</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Sunday</span>
                      <span className="text-muted-foreground">Emergency only</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="bg-background border-primary/20 shadow-warm">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Schedule Emergency Visit
                    </Button>
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Request Information Packet
                    </Button>
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Volunteer Opportunities
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;