import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";

interface Review {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
  location: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Nursing Director",
    rating: 5,
    text: "Ivy's visit to our memory care unit was absolutely magical. The residents lit up the moment she walked in, and several patients who rarely speak were suddenly sharing stories about their own pets.",
    location: "Sunset Manor Care Facility"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Pediatric Therapist",
    rating: 5,
    text: "Working with Ivy has been incredible. She has this amazing ability to calm anxious children before their therapy sessions. Our treatment outcomes have noticeably improved since incorporating her visits.",
    location: "Children's Rehabilitation Center"
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    role: "School Counselor",
    rating: 5,
    text: "Ivy's reading program has transformed our struggling readers into confident storytellers. The kids line up every week asking when 'their furry friend' is coming back.",
    location: "Lincoln Elementary School"
  },
  {
    id: 4,
    name: "Robert Thompson",
    role: "Veteran",
    rating: 5,
    text: "I've struggled with PTSD for years, but something about Ivy's gentle presence helps quiet the noise in my head. She's helped me more than I ever thought possible.",
    location: "Veterans Support Group"
  }
];

interface ReviewSnippetsProps {
  showTitle?: boolean;
  maxReviews?: number;
}

const ReviewSnippets = ({ showTitle = true, maxReviews = 3 }: ReviewSnippetsProps) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Rotate through reviews every 8 seconds
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update displayed reviews based on current index
    const selectedReviews = [];
    for (let i = 0; i < maxReviews; i++) {
      selectedReviews.push(reviews[(currentReviewIndex + i) % reviews.length]);
    }
    setDisplayedReviews(selectedReviews);
  }, [currentReviewIndex, maxReviews]);

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h3 className="text-2xl font-heading font-bold mb-2">What People Say About Ivy</h3>
          <p className="text-muted-foreground">Real stories from the lives Ivy has touched</p>
        </div>
      )}

      <div className={`grid gap-4 ${maxReviews > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : ''}`}>
        {displayedReviews.map((review, index) => (
          <Card 
            key={`${review.id}-${currentReviewIndex}`} 
            className="border-accent/20 bg-accent/5 hover:shadow-soft transition-all duration-500 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <Quote className="w-5 h-5 text-accent mr-2" />
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-foreground mb-4 leading-relaxed italic">
                "{review.text}"
              </p>
              
              <div className="border-t border-accent/20 pt-4">
                <p className="font-semibold text-sm text-foreground">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.role}</p>
                <p className="text-xs text-accent">{review.location}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewSnippets;