import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Camera, Play, X } from "lucide-react";
import StickyBookingCTA from "@/components/StickyBookingCTA";
import DonationPrompt from "@/components/DonationPrompt";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const GalleryPage = () => {
  // State for modal display
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

  return (
    <div className="min-h-screen">
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
                  variant="secondary" 
                  className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-gentle"
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {galleryItems.map((item) => (
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
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="default">Submit Photos</Button>
                  <Button variant="outline">Share Your Story</Button>
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
    </div>
  );
};

export default GalleryPage;