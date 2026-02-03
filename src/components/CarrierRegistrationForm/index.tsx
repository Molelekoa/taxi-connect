import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import ProgressIndicator from "./ProgressIndicator";
import Step1Personal from "./Step1Personal";
import Step2License from "./Step2License";
import Step3Vehicle from "./Step3Vehicle";
import Step4Operations from "./Step4Operations";
import Step5Review from "./Step5Review";
import Step6Confirm from "./Step6Confirm";
import {
  CarrierFormData,
  initialFormData,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
} from "./types";

const STORAGE_KEY = "parcelbuddy-driver-registration";
const TOTAL_STEPS = 6;

const CarrierRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CarrierFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Scroll to top of form when step changes
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  // Load from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({ ...initialFormData, ...parsed.formData });
        setCurrentStep(parsed.currentStep || 1);
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  // Save to session storage
  useEffect(() => {
    if (!isSubmitted) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, currentStep }));
    }
  }, [formData, currentStep, isSubmitted]);

  const updateFormData = (data: Partial<CarrierFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Clear errors for updated fields
    const newErrors = { ...errors };
    Object.keys(data).forEach((key) => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const validateStep = (step: number): boolean => {
    let schema;
    switch (step) {
      case 1:
        schema = step1Schema;
        break;
      case 2:
        schema = step2Schema;
        break;
      case 3:
        schema = step3Schema;
        break;
      case 4:
        schema = step4Schema;
        break;
      case 5:
        schema = step5Schema;
        break;
      case 6:
        schema = step6Schema;
        break;
      default:
        return true;
    }

    const result = schema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setIsSubmitted(true);
    sessionStorage.removeItem(STORAGE_KEY);

    toast({
      title: "Application Submitted Successfully!",
      description: "Our team will review your application and contact you within 2-3 business days.",
    });
  };

  const renderStep = () => {
    const stepProps = { formData, updateFormData, errors };

    switch (currentStep) {
      case 1:
        return <Step1Personal {...stepProps} />;
      case 2:
        return <Step2License {...stepProps} />;
      case 3:
        return <Step3Vehicle {...stepProps} />;
      case 4:
        return <Step4Operations {...stepProps} />;
      case 5:
        return <Step5Review {...stepProps} />;
      case 6:
        return <Step6Confirm {...stepProps} />;
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-elevated p-8 md:p-12 text-center max-w-2xl mx-auto"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display font-bold text-3xl text-foreground mb-4">
          Welcome to the Community!
        </h2>
        <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
          Thank you for joining our network of travelers who help connect people across Southern Africa. 
          Our team will verify your documents and contact you within 2-3 business days.
        </p>
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">What happens next?</strong><br />
            Once approved, you'll be able to pick up parcels along routes you're already traveling. 
            The delivery fees you earn can help cover your petrol and toll costs.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div ref={formRef} className="max-w-3xl mx-auto">
      <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <div className="card-elevated p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={currentStep === 1 ? "invisible" : ""}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <Button type="button" variant="hero" onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="hero"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarrierRegistrationForm;
