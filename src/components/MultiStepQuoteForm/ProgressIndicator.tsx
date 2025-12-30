import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const ProgressIndicator = ({ currentStep, totalSteps, stepTitles }: ProgressIndicatorProps) => {
  return (
    <div className="mb-10">
      {/* Progress Bar */}
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-6">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: "var(--gradient-primary)" }}
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Step Dots */}
      <div className="flex justify-between">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </motion.div>
              <span
                className={`mt-2 text-xs text-center hidden md:block ${
                  isCurrent ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Step Title */}
      <div className="mt-4 text-center md:hidden">
        <span className="text-primary font-semibold">
          Step {currentStep}: {stepTitles[currentStep - 1]}
        </span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
