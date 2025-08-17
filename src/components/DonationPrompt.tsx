import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

interface DonationPromptProps {
  context?: "about" | "gallery" | "schedule" | "general";
  compact?: boolean;
}

const DonationPrompt = ({ context = "general", compact = false }: DonationPromptProps) => {
  const getContextMessage = () => {
    switch (context) {
      case "about":
        return {
          title: "Help Ivy Continue Her Mission",
          description: "Your support helps cover training, travel, and supplies needed for Ivy's therapy visits.",
          highlight: "$25 covers one therapy visit"
        };
      case "gallery":
        return {
          title: "Inspired by These Moments?",
          description: "Help us create more joyful moments like these with your donation.",
          highlight: "$50 funds a full day of therapy visits"
        };
      case "schedule":
        return {
          title: "Support Ivy's Visits",
          description: "While you're planning your visit, consider supporting our mission.",
          highlight: "$25 = one visit's travel cost"
        };
      default:
        return {
          title: "Support Ivy's Mission",
          description: "Every donation helps bring comfort and joy to those who need it most.",
          highlight: "$25 makes a difference"
        };
    }
  };

  const { title, description, highlight } = getContextMessage();

  if (compact) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{title}</h4>
              <p className="text-xs text-muted-foreground">{highlight}</p>
            </div>
            <Link to="/donate">
              <Button size="sm" variant="default">
                <DollarSign className="w-4 h-4 mr-1" />
                Donate
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-warm">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        
        <h3 className="text-xl font-heading font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
        
        <div className="bg-background/80 rounded-lg p-3 mb-4">
          <p className="text-sm font-semibold text-primary">{highlight}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            to="/donate"
            onClick={() => {
              // Scroll to top when navigating to donate
              setTimeout(() => window.scrollTo(0, 0), 100);
            }}
          >
            <Button variant="golden" className="w-full sm:w-auto">
              <DollarSign className="w-4 h-4 mr-2" />
              Make a Donation
            </Button>
          </Link>
          <Link 
            to="/shop" 
            onClick={() => {
              // Scroll to top when navigating to shop
              setTimeout(() => window.scrollTo(0, 0), 100);
            }}
          >
            <Button variant="outline" className="w-full sm:w-auto">
              Shop & Support
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonationPrompt;