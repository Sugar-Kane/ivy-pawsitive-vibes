import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const StickyBookingCTA = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-elegant max-w-sm">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 bg-background text-foreground rounded-full p-1 hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="pr-6">
          <h4 className="font-semibold text-sm mb-2">Ready to book a visit?</h4>
          <p className="text-xs text-primary-foreground/90 mb-3">
            Schedule Ivy's therapy visit today
          </p>
          <Link to="/schedule">
            <Button variant="secondary" size="sm" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StickyBookingCTA;