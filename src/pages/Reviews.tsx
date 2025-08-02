import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Quote, Send, Heart } from "lucide-react";
import StickyBookingCTA from "@/components/StickyBookingCTA";
import ReviewSnippets from "@/components/ReviewSnippets";
import DonationPrompt from "@/components/DonationPrompt";
import { useState } from "react";

const ReviewsPage = () => {
  const [rating, setRating] = useState(5);

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <section className="py-20 bg-gradient-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-accent/20 rounded-full px-4 py-2 backdrop-blur-sm mb-6">
                <span className="text-2xl">⭐</span>
                <span className="text-sm font-medium text-accent-foreground">Client Testimonials</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                <span className="text-gradient-golden">Stories from the Heart</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Read heartwarming testimonials from those whose lives have been touched by Ivy's gentle presence 
                and healing spirit. Every story is a testament to the power of therapy dog visits.
              </p>
            </div>

            {/* All Reviews */}
            <ReviewSnippets showTitle={false} maxReviews={4} />
            
            {/* Leave a Review Section */}
            <div className="mt-20">
              <div className="bg-background rounded-3xl p-8 shadow-warm border border-border/50 max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-2">Share Your Experience</h3>
                  <p className="text-muted-foreground">
                    Help others discover the joy of therapy dog visits by sharing your story with Ivy
                  </p>
                </div>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reviewName">Your Name</Label>
                      <Input id="reviewName" placeholder="Enter your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reviewLocation">Location/Organization</Label>
                      <Input id="reviewLocation" placeholder="Hospital, school, etc." />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Your Rating</Label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star 
                            className={`w-8 h-8 transition-colors ${
                              star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reviewTitle">Review Title</Label>
                    <Input id="reviewTitle" placeholder="Give your review a title" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reviewText">Your Experience</Label>
                    <Textarea 
                      id="reviewText" 
                      placeholder="Tell us about your experience with Ivy and how her visit made a difference..."
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <Button variant="golden" size="lg" className="w-full">
                    <Send className="w-5 h-5 mr-2" />
                    Submit Review
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
        
        {/* Donation Prompt */}
        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <DonationPrompt context="general" />
          </div>
        </section>
      </div>
      <Footer />
      <StickyBookingCTA />
    </div>
  );
};

export default ReviewsPage;