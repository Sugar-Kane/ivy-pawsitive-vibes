import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Camera, Play } from "lucide-react";

const GalleryPage = () => {
  const galleryItems = [
    {
      id: 1,
      type: "photo",
      title: "Hospital Visit - Children's Ward",
      description: "Ivy brings smiles to young patients during recovery",
      category: "Hospital",
      emoji: "🏥"
    },
    {
      id: 2,
      type: "video",
      title: "Nursing Home Music Therapy",
      description: "Ivy participates in a group music therapy session",
      category: "Senior Care",
      emoji: "🎵"
    },
    {
      id: 3,
      type: "photo",
      title: "School Reading Program",
      description: "Children read to Ivy in the school library",
      category: "Education",
      emoji: "📚"
    },
    {
      id: 4,
      type: "photo",
      title: "Veteran Support Group",
      description: "Ivy provides comfort during a support group meeting",
      category: "Veterans",
      emoji: "🇺🇸"
    },
    {
      id: 5,
      type: "video",
      title: "Birthday Party Visit",
      description: "Ivy helps celebrate a special 90th birthday",
      category: "Special Events",
      emoji: "🎂"
    },
    {
      id: 6,
      type: "photo",
      title: "Physical Therapy Session",
      description: "Ivy motivates patients during rehabilitation",
      category: "Rehabilitation",
      emoji: "💪"
    },
    {
      id: 7,
      type: "photo",
      title: "Community Center Visit",
      description: "Ivy meets families at a community wellness event",
      category: "Community",
      emoji: "🏘️"
    },
    {
      id: 8,
      type: "video",
      title: "Therapy Training Session",
      description: "Behind-the-scenes look at Ivy's ongoing training",
      category: "Training",
      emoji: "🎓"
    }
  ];

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
                <Card key={item.id} className="group hover:shadow-soft transition-gentle cursor-pointer overflow-hidden">
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
                      
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {item.description}
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
                  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Submit Photos
                  </button>
                  <button className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors">
                    Share Your Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default GalleryPage;