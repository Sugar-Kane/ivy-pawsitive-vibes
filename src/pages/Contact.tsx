import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Download, Construction, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    subject: "",
    message: ""
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-contact-notification', {
        body: formData
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24-48 hours."
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        organization: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again or call us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message if form was submitted
  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <SEOHead 
          title="Message Sent - Ivy Therapy"
          description="Your message has been sent successfully. We'll get back to you within 24-48 hours."
          keywords="contact confirmation, message sent, Ivy therapy contact"
          canonical="/contact"
        />
        <Navigation />
        <div className="pt-16">
          <section className="py-20 bg-gradient-soft">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="bg-background rounded-3xl p-8 shadow-warm border border-border/50">
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
                <h1 className="text-3xl font-heading font-bold mb-4 text-primary">
                  Message Sent Successfully!
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Thank you for reaching out. We'll get back to you within 24-48 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="golden"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                  >
                    Return to Homepage
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Contact Ivy Therapy - Schedule Your Visit"
        description="Contact Ivy Therapy to schedule a visit, ask questions, or learn more about our therapy dog services in Midland, TX."
        keywords="contact therapy dog, schedule visit, Midland TX therapy dog, book appointment"
        canonical="/contact"
      />
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
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          name="firstName"
                          placeholder="Enter your first name" 
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          name="lastName"
                          placeholder="Enter your last name" 
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        placeholder="your.email@example.com" 
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        type="tel" 
                        placeholder="(555) 123-4567" 
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization/Facility (Optional)</Label>
                      <Input 
                        id="organization" 
                        name="organization"
                        placeholder="Hospital, school, nursing home, etc." 
                        value={formData.organization}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject" 
                        name="subject"
                        placeholder="What would you like to discuss?" 
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        name="message"
                        placeholder="Tell us about your therapy visit needs, questions, or how we can help..."
                        className="min-h-[120px]"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      variant="golden" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      <Send className="w-5 h-5 mr-2" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
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
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Monday thru Sunday</span>
                      <span className="text-muted-foreground">Available by appointment only</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="bg-background border-primary/20 shadow-warm">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link to="/schedule">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        Schedule Visit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = '/info/ivy-information-packet.pdf';
                        link.download = 'ivy-information-packet.pdf';
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Information Packet
                    </Button>
                    <div className="relative">
                      <Button 
                        variant="outline" 
                        className="w-full border-muted text-muted-foreground cursor-not-allowed"
                        disabled
                      >
                        Volunteer Opportunities
                      </Button>
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Construction className="w-3 h-3" />
                        Under Construction
                      </div>
                    </div>
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