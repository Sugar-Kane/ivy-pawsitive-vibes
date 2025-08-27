import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Camera, Play, X, Upload, Calendar, Mail } from "lucide-react";
import StickyBookingCTA from "@/components/StickyBookingCTA";
import DonationPrompt from "@/components/DonationPrompt";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";

const GalleryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // State for modal display
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    photos: null as FileList | null,
    eventDate: "",
    story: ""
  });
  const [newsletterForm, setNewsletterForm] = useState({
    name: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const activeCategory = searchParams.get("category") || "All";

  // Sample gallery items with event dates - sorted by date descending
  const galleryItems = [
    {
      id: 1,
      type: "photo",
      title: "Community Center Visit",
      description: "Ivy meets families at a community wellness event",
      category: "Community",
      emoji: "🏘️",
      eventDate: "2025-08-20",
      newsletterContent: "What an amazing day at the community center! Ivy had the chance to meet so many wonderful families during our wellness event. The joy on children's faces as they interacted with Ivy was absolutely heartwarming. We're grateful for the opportunity to be part of such meaningful community gatherings."
    },
    {
      id: 2,
      type: "photo",
      title: "Hospital Visit - Children's Ward",
      description: "Ivy brings smiles to young patients during recovery",
      category: "Hospital",
      emoji: "🏥",
      eventDate: "2025-08-15",
      newsletterContent: "Today's visit to the children's ward was particularly special. Ivy spent time with several young patients who are on their road to recovery. The healing power of her gentle presence was evident as we watched children light up with smiles and laughter. These moments remind us why therapy dog work is so important."
    }
  ].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()); // Sort by date descending

  const categories = ["All", "Hospital", "Senior Care", "Education", "Veterans", "Special Events", "Rehabilitation", "Community", "Training"];

  // Filter gallery items based on active category
  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return galleryItems;
    return galleryItems.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  const handleCategoryClick = (category: string) => {
    if (category === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const handleSubmitPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submitForm.photos || !submitForm.eventDate) {
      toast({
        title: "Required fields missing",
        description: "Please select photos and an event date.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload photos to Supabase Storage first
      const photoUrls: string[] = [];
      
      for (let i = 0; i < submitForm.photos.length; i++) {
        const file = submitForm.photos[i];
        const fileName = `${Date.now()}-${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photo-submissions')
          .upload(fileName, file);
          
        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        photoUrls.push(uploadData.path);
      }
      
      // Submit to backend edge function
      const { data, error } = await supabase.functions.invoke('submit-photos', {
        body: {
          photoUrls,
          eventDate: submitForm.eventDate,
          story: submitForm.story || null,
          submitterName: null, // Could be added to form if needed
          submitterEmail: null // Could be added to form if needed
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Photos submitted successfully!",
        description: "Thank you for sharing your experience with Ivy. We'll review and add them to the gallery soon.",
      });
      
      setShowSubmitModal(false);
      setSubmitForm({ photos: null, eventDate: "", story: "" });
    } catch (error: any) {
      console.error('Photo submission error:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterForm.name || !newsletterForm.email) {
      toast({
        title: "Required fields missing",
        description: "Please enter your name and email.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('email_subscribers')
        .insert({
          email: newsletterForm.email,
          notification_preferences: {
            newsletter: true,
            visit_updates: true,
            donation_updates: false,
            gallery_notifications: true
          },
          verified: false
        });
        
      if (error) throw error;
      
      toast({
        title: "Successfully subscribed!",
        description: "You'll be notified when new gallery events are posted.",
      });
      
      setShowNewsletterModal(false);
      setNewsletterForm({ name: "", email: "" });
    } catch (error: any) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Gallery - Ivy's Moments of Joy"
        description="See Ivy in action bringing comfort and healing to hospitals, nursing homes, schools, and communities across Midland, TX."
        keywords="therapy dog photos, healing moments, pet therapy gallery, community visits"
        canonical="/gallery"
      />
      <Navigation />
      <div className="pt-16">
        <section className="py-20 bg-gradient-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-accent/20 rounded-full px-4 py-2 backdrop-blur-sm mb-6">
                <span className="text-2xl">📸</span>
                <span className="text-sm font-medium text-accent-foreground">Ivy's Journey</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                <span className="text-gradient-golden">Moments of Joy</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                See Ivy in action as she brings comfort, healing, and happiness to people of all ages. 
                Each photo and video captures the special bond between Ivy and those she visits.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <Badge 
                  key={category}
                  variant={activeCategory === category ? "default" : "secondary"}
                  className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-gentle"
                  onClick={() => handleCategoryClick(category)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCategoryClick(category);
                    }
                  }}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="group hover:shadow-soft transition-gentle cursor-pointer overflow-hidden"
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-0">
                    {/* Image/Video Thumbnail */}
                    <div className="relative aspect-square bg-gradient-warm flex items-center justify-center text-6xl text-background/80 overflow-hidden">
                      {item.emoji}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        {item.type === "video" ? (
                          <Play className="w-12 h-12 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <Camera className="w-12 h-12 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      
                      {/* Type Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge variant={item.type === "video" ? "default" : "secondary"} className="text-xs">
                          {item.type === "video" ? "Video" : "Photo"}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm leading-tight flex-1">{item.title}</h3>
                        <Heart className="w-4 h-4 text-muted-foreground hover:text-primary hover:fill-primary transition-colors cursor-pointer ml-2 flex-shrink-0" />
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                        {item.description}
                      </p>
                      
                      <p className="text-xs text-primary font-medium mb-3">
                        {new Date(item.eventDate).toLocaleDateString()}
                      </p>
                      
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-background rounded-3xl p-8 shadow-warm border border-border/50 max-w-2xl mx-auto">
                <h3 className="text-2xl font-heading font-bold mb-4">Want to Share Your Experience?</h3>
                <p className="text-muted-foreground mb-6">
                  If Ivy has visited you or your facility, we'd love to feature your photos and stories 
                  in our gallery to inspire others and show the impact of therapy dog visits.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button 
                    variant="default"
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Submit Photos
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowNewsletterModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Get Notified of New Events
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Donation Prompt */}
        <section className="py-16 bg-gradient-soft">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <DonationPrompt context="gallery" />
          </div>
        </section>
      </div>
      <Footer />
      <StickyBookingCTA />

      {/* Gallery Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedItem?.title}</span>
              <Badge variant="outline">{selectedItem?.category}</Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {/* Image placeholder */}
              <div className="aspect-video bg-gradient-warm flex items-center justify-center text-8xl text-background/80 rounded-lg">
                {selectedItem.emoji}
              </div>
              
              {/* Event Date */}
              <div className="text-sm text-primary font-medium">
                Event Date: {new Date(selectedItem.eventDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              {/* Newsletter Content */}
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {selectedItem.newsletterContent}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Photos Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Photos</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitPhotos} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photos">Photos *</Label>
              <Input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                required
                onChange={(e) => setSubmitForm(prev => ({ ...prev, photos: e.target.files }))}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Select one or more photos to share</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="eventDate"
                  type="date"
                  required
                  value={submitForm.eventDate}
                  onChange={(e) => setSubmitForm(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="story">Your Story (Optional)</Label>
              <Textarea
                id="story"
                placeholder="Share your experience with Ivy..."
                value={submitForm.story}
                onChange={(e) => setSubmitForm(prev => ({ ...prev, story: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowSubmitModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Newsletter Signup Modal */}
      <Dialog open={showNewsletterModal} onOpenChange={setShowNewsletterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Get Notified of New Gallery Events</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleNewsletterSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="Your name"
                value={newsletterForm.name}
                onChange={(e) => setNewsletterForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="your.email@example.com"
                value={newsletterForm.email}
                onChange={(e) => setNewsletterForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <p className="text-sm text-muted-foreground">
              We'll send you an email notification when new gallery events are posted. You can unsubscribe at any time.
            </p>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowNewsletterModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryPage;