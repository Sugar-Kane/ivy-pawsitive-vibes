import { useState, useEffect } from "react";
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, DollarSign, Gift, Users, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DonatePage = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);
  const { toast } = useToast();
  const donationAmounts = [10, 25, 50];

  // Check URL parameters for payment status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowSuccess(true);
    } else if (urlParams.get('canceled') === 'true') {
      setShowCanceled(true);
    }
  }, []);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setShowCustomInput(false);
    setCustomAmount("");
  };

  const handleCustomClick = () => {
    setShowCustomInput(true);
    setSelectedAmount(null);
  };

  const handleDonate = async () => {
    let amount;
    
    if (showCustomInput) {
      amount = parseFloat(customAmount);
      if (!amount || amount < 1) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid donation amount of at least $1.",
          variant: "destructive"
        });
        return;
      }
    } else if (selectedAmount) {
      amount = selectedAmount;
    } else {
      toast({
        title: "No Amount Selected",
        description: "Please select or enter a donation amount.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-donation', {
        body: { amount: Math.round(amount * 100) } // Convert to cents
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      toast({
        title: "Donation Failed",
        description: "There was an error processing your donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Success message component
  if (showSuccess) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-16">
          <section className="py-20 bg-gradient-soft">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="bg-background rounded-3xl p-8 shadow-warm border border-border/50">
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
                <h1 className="text-3xl font-heading font-bold mb-4 text-primary">
                  Thank You for Your Donation!
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Your generous contribution will help Ivy bring comfort and joy to those who need it most.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="golden"
                    onClick={() => window.location.href = '/'}
                  >
                    Return to Homepage
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/schedule'}
                  >
                    Schedule a Visit
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

  // Canceled message component
  if (showCanceled) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-16">
          <section className="py-20 bg-gradient-soft">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="bg-background rounded-3xl p-8 shadow-warm border border-border/50">
                <X className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <h1 className="text-3xl font-heading font-bold mb-4">
                  Donation Canceled
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Your donation was canceled. You can try again anytime.
                </p>
                <Button 
                  variant="golden"
                  onClick={() => window.location.href = '/donate'}
                >
                  Try Again
                </Button>
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
                  <CardTitle className="text-xl">$10</CardTitle>
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
                  <CardTitle className="text-xl">$25</CardTitle>
                  <CardDescription>Funds a 1 hour session of a therapy visit</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Professional session time</li>
                    <li>• Extended therapy interaction</li>
                    <li>• Personalized care activities</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 bg-secondary/5">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                    <Gift className="w-6 h-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">$50</CardTitle>
                  <CardDescription>Support monthly certification and training</CardDescription>
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
                          variant={selectedAmount === amount ? "default" : "outline"}
                          className={`h-12 transition-all ${
                            selectedAmount === amount 
                              ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20" 
                              : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
                          }`}
                          onClick={() => handleAmountSelect(amount)}
                        >
                          ${amount}
                        </Button>
                      ))}
                      <Button 
                        variant={showCustomInput ? "default" : "outline"}
                        className={`h-12 transition-all ${
                          showCustomInput 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        }`}
                        onClick={handleCustomClick}
                      >
                        Custom
                      </Button>
                    </div>
                    
                    {showCustomInput && (
                      <div className="mt-4">
                        <label className="text-sm font-medium mb-2 block">Enter custom amount:</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="0.00"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      variant="golden" 
                      size="lg" 
                      className="w-full"
                      onClick={handleDonate}
                      disabled={isProcessing || (!selectedAmount && !customAmount)}
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      {isProcessing ? "Processing..." : "Donate Securely"}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Donations are processed securely through Stripe. Your information is protected and never shared.
                    </p>
                  </div>
                  
                  <div className="border-t border-border pt-6">
                    <h4 className="font-semibold mb-2">Other Ways to Support:</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• <a href="/shop" className="text-primary hover:underline">Shop our merchandise store</a></p>
                      <p>• Follow our mission on social media</p>
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