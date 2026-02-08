import { useState } from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DeliveryRatingProps {
  onSubmit?: (rating: number, feedback: string) => void;
}

const DeliveryRating = ({ onSubmit }: DeliveryRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitted(true);
    setIsSubmitting(false);
    onSubmit?.(rating, feedback);
  };

  if (isSubmitted) {
    return (
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="font-display font-bold text-lg text-foreground mb-1">
          Thank you for your feedback!
        </h3>
        <p className="text-sm text-muted-foreground">
          Your rating helps us maintain a trusted community.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <h3 className="font-display font-bold text-lg text-foreground mb-1">
          Rate Your Traveler
        </h3>
        <p className="text-sm text-muted-foreground">
          How was your delivery experience? (required)
        </p>
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredStar || rating)
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {rating === 1 && "Poor"}
          {rating === 2 && "Fair"}
          {rating === 3 && "Good"}
          {rating === 4 && "Very Good"}
          {rating === 5 && "Excellent"}
        </p>
      )}

      {/* Optional feedback */}
      <div className="space-y-2">
        <Label htmlFor="rating-feedback">Additional feedback (optional)</Label>
        <Textarea
          id="rating-feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
          placeholder="Tell us about your experience..."
          rows={3}
        />
      </div>

      <Button
        onClick={handleSubmit}
        variant="hero"
        size="lg"
        className="w-full"
        disabled={rating === 0 || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Rating"}
      </Button>
    </motion.div>
  );
};

export default DeliveryRating;
