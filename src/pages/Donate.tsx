import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, DollarSign, Gift, Users } from "lucide-react";

const DonatePage = () => {
  const donationAmounts = [25, 50, 100, 250, 500];

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <section className="py-20 bg-gradient-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-accent/20 rounded-full px-4 py-2 backdrop-blur-sm mb-6">
                <span className="text-2xl">💝</span>
                <span className="text-sm font-medium text-accent-foreground">Support Ivy's Mission</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                <span className="text-gradient-golden">Help Us Spread Joy</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Your donation helps cover Ivy's training, certification, travel costs, and supplies needed 
                to bring comfort and healing to those who need it most.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {/* Donation Impact Cards */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">$25</CardTitle>
                  <CardDescription>Covers supplies for one therapy visit</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Sanitizing supplies</li>
                    <li>• Travel expenses</li>
                    <li>• Comfort items</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-accent/20 bg-accent/5">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto bg-accent/20 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">$100</CardTitle>
                  <CardDescription>Funds a full day of therapy visits</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Multiple facility visits</li>
                    <li>• Extended session time</li>
                    <li>• Documentation photos</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 bg-secondary/5">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                    <Gift className="w-6 h-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">$250</CardTitle>
                  <CardDescription>Supports monthly certification & training</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Ongoing training costs</li>
                    <li>• Health certifications</li>
                    <li>• Equipment maintenance</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Donation Form */}
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-warm border-border/50">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-heading">Make a Donation</CardTitle>
                  <CardDescription>Every contribution makes a difference in someone's day</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Choose an amount:</label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {donationAmounts.map((amount) => (
                        <Button 
                          key={amount}
                          variant="outline" 
                          className="h-12 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        >
                          ${amount}
                        </Button>
                      ))}
                      <Button 
                        variant="outline" 
                        className="h-12 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      >
                        Custom
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button variant="golden" size="lg" className="w-full">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Donate Securely
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Donations are processed securely. Your information is protected and never shared.
                    </p>
                  </div>
                  
                  <div className="border-t border-border pt-6">
                    <h4 className="font-semibold mb-2">Other Ways to Support:</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Shop our merchandise store</p>
                      <p>• Share our mission on social media</p>
                      <p>• Volunteer for special events</p>
                      <p>• Sponsor a therapy visit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default DonatePage;