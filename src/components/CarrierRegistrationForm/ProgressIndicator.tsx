import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, label: "Personal" },
  { number: 2, label: "Compliance" },
  { number: 3, label: "Vehicle" },
  { number: 4, label: "Routes" },
  { number: 5, label: "Review" },
  { number: 6, label: "Confirm" },
];

const ProgressIndicator = ({ currentStep }: ProgressIndicatorProps) => {
  return (
    <div className="mb-8">
      {/* Mobile: Simple text */}
      <div className="md:hidden text-center mb-4">
        <span className="text-primary font-semibold">Step {currentStep}</span>
        <span className="text-muted-foreground"> of {steps.length}</span>
        <p className="text-sm text-muted-foreground mt-1">{steps[currentStep - 1]?.label}</p>
      </div>

      {/* Desktop: Full progress bar */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        
        {/* Active progress line */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="relative flex flex-col items-center z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-secondary text-muted-foreground border-2 border-border"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
