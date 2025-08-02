import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, X } from "lucide-react";
import { useState } from "react";

interface NewsletterSignupProps {
  variant?: "inline" | "popup";
  onClose?: () => void;
}

const NewsletterSignup = ({ variant = "inline", onClose }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => {
      if (variant === "popup" && onClose) {
        onClose();
      }
    }, 2000);
  };

  if (isSubscribed) {
    return (
      <Card className={`${variant === "popup" ? "fixed bottom-4 left-4 z-50 max-w-sm animate-fade-in" : ""} border-accent/20 bg-accent/5`}>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-accent" />
          </div>
          <h4 className="font-semibold text-accent mb-2">Thank you for subscribing!</h4>
          <p className="text-sm text-muted-foreground">
            You'll receive updates about Ivy's visits and heartwarming stories.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${variant === "popup" ? "fixed bottom-4 left-4 z-50 max-w-sm animate-fade-in" : ""} border-accent/20 bg-accent/5`}>
      {variant === "popup" && (
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-background text-foreground rounded-full p-1 hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center">
          <Mail className="w-5 h-5 mr-2 text-accent" />
          Stay Updated with Ivy
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get weekly updates, visit photos, and heartwarming stories delivered to your inbox.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-accent/30 focus:border-accent"
          />
          <Button type="submit" variant="default" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Subscribe to Updates
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;