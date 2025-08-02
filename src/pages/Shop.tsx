import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Heart, Star } from "lucide-react";
import StickyBookingCTA from "@/components/StickyBookingCTA";
import DonationPrompt from "@/components/DonationPrompt";

const ShopPage = () => {
  const products = [
    {
      id: 1,
      name: "Ivy's Therapy Paws T-Shirt",
      price: 25,
      image: "🐕",
      description: "Soft cotton tee featuring Ivy's paw print design",
      rating: 5
    },
    {
      id: 2,
      name: "Golden Doodle Therapy Mug",
      price: 18,
      image: "☕",
      description: "Ceramic mug with inspirational therapy dog quotes",
      rating: 5
    },
    {
      id: 3,
      name: "Plush Ivy Companion",
      price: 35,
      image: "🧸",
      description: "Soft plush version of Ivy for comfort and cuddles",
      rating: 5
    },
    {
      id: 4,
      name: "Therapy Paws Tote Bag",
      price: 22,
      image: "👜",
      description: "Eco-friendly canvas bag with Ivy's mission message",
      rating: 5
    },
    {
      id: 5,
      name: "Paw Print Sticker Set",
      price: 8,
      image: "🐾",
      description: "Waterproof stickers featuring Ivy's paw prints",
      rating: 5
    },
    {
      id: 6,
      name: "Therapy Dog Calendar",
      price: 15,
      image: "📅",
      description: "12-month calendar with photos from Ivy's visits",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <section className="py-20 bg-gradient-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-accent/20 rounded-full px-4 py-2 backdrop-blur-sm mb-6">
                <span className="text-2xl">🛍️</span>
                <span className="text-sm font-medium text-accent-foreground">Ivy's Merchandise</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                <span className="text-gradient-golden">Shop for a Cause</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Every purchase supports Ivy's therapy visits and helps us reach more people in need of comfort and joy. 
                Show your support with our exclusive merchandise collection.
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {products.map((product) => (
                <Card key={product.id} className="shadow-warm border-border/50 hover:shadow-soft transition-gentle group">
                  <CardHeader>
                    <div className="text-6xl text-center mb-4 group-hover:scale-110 transition-transform">
                      {product.image}
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <div className="flex items-center space-x-1">
                        {[...Array(product.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">${product.price}</span>
                      <Button variant="golden" size="sm">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Benefits Section */}
            <div className="bg-background rounded-3xl p-8 shadow-warm border border-border/50">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-heading font-bold mb-4">Your Purchase Makes a Difference</h3>
                <p className="text-muted-foreground">
                  100% of proceeds go directly to supporting Ivy's therapy mission
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-xl bg-primary/5 border border-primary/20">
                  <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Funds Therapy Visits</h4>
                  <p className="text-sm text-muted-foreground">
                    Covers travel costs and supplies for more therapy sessions
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-accent/5 border border-accent/20">
                  <Star className="w-8 h-8 text-accent mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Supports Training</h4>
                  <p className="text-sm text-muted-foreground">
                    Helps maintain Ivy's certifications and ongoing education
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-secondary/5 border border-secondary/20">
                  <ShoppingBag className="w-8 h-8 text-secondary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Spreads Awareness</h4>
                  <p className="text-sm text-muted-foreground">
                    Each item helps share Ivy's mission with the community
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Mission Support */}
        <section className="py-16 bg-gradient-soft">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-heading font-bold mb-4">Every Purchase Supports Ivy's Mission</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                100% of proceeds go directly toward funding therapy visits, training, and supplies needed to bring joy and healing to our community.
              </p>
              <DonationPrompt compact />
            </div>
          </div>
        </section>
      </div>
      <Footer />
      <StickyBookingCTA />
    </div>
  );
};

export default ShopPage;