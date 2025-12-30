import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressIndicator from "./ProgressIndicator";
import Step1Contact from "./Step1Contact";
import Step2Locations from "./Step2Locations";
import Step3LoadDetails from "./Step3LoadDetails";
import Step4Special from "./Step4Special";
import Step5Review from "./Step5Review";
import {
  QuoteFormData,
  step1Schema,
  step2Schema,
  step3Schema,
} from "./types";

const STORAGE_KEY = "dynodash_quote_form";

const stepTitles = ["Contact", "Locations", "Load", "Special", "Review"];

const defaultFormData: QuoteFormData = {
  // Step 1
  contactName: "",
  companyName: "",
  email: "",
  phone: "",
  loadDescription: "",
  shipmentType: "",
  // Step 2
  pickupAddress: "",
  pickupDate: "",
  pickupLocationType: "",
  deliveryAddress: "",
  deliveryDate: "",
  deliveryLocationType: "",
  // Step 3
  weight: "",
  dimensions: "",
  palletCount: "",
  commodityClass: "",
  stackable: "",
  liftgateRequired: "",
  // Step 4
  hazmat: false,
  hazmatUN: "",
  hazmatClass: "",
  hazmatSDS: "",
  tempControlled: false,
  tempRange: "",
  tempType: "",
  international: false,
  countries: "",
  customsClearance: false,
  additionalInsurance: false,
  insuranceCoverage: "",
  // Step 5
  specialInstructions: "",
  referenceNumbers: "",
};

const MultiStepQuoteForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({ ...defaultFormData, ...parsed.data });
        setCurrentStep(parsed.step || 1);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save to session storage on changes
  useEffect(() => {
    if (!isSubmitted) {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ data: formData, step: currentStep })
      );
    }
  }, [formData, currentStep, isSubmitted]);

  const updateFormData = (data: Partial<QuoteFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Clear errors for updated fields
    const newErrors = { ...errors };
    Object.keys(data).forEach((key) => delete newErrors[key]);
    setErrors(newErrors);
  };

  const validateStep = (step: number): boolean => {
    let result;
    setErrors({});

    switch (step) {
      case 1:
        result = step1Schema.safeParse(formData);
        break;
      case 2:
        result = step2Schema.safeParse(formData);
        break;
      case 3:
        result = step3Schema.safeParse(formData);
        break;
      default:
        return true;
    }

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    sessionStorage.removeItem(STORAGE_KEY);
    setIsSubmitted(true);
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="font-display font-bold text-3xl text-foreground mb-4">
          Quote Request Submitted!
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Thank you for choosing Dyno Dash. A logistics specialist will contact you within 1 business hour with your customized quote.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setFormData(defaultFormData);
            setCurrentStep(1);
            setIsSubmitted(false);
          }}
        >
          Submit Another Quote
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="card-elevated p-6 md:p-10">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={5}
        stepTitles={stepTitles}
      />

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <Step1Contact
            key="step1"
            data={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <Step2Locations
            key="step2"
            data={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 3 && (
          <Step3LoadDetails
            key="step3"
            data={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 4 && (
          <Step4Special
            key="step4"
            data={formData}
            onChange={updateFormData}
          />
        )}
        {currentStep === 5 && (
          <Step5Review
            key="step5"
            formData={formData}
            step5Data={formData}
            onChange={updateFormData}
          />
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-10 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {currentStep < 5 ? (
          <Button variant="hero" onClick={nextStep} className="gap-2">
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="hero"
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                Submit Quote Request
                <Send className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Privacy Note */}
      <p className="text-xs text-muted-foreground text-center mt-6">
        Your information is secure. We'll contact you within 1 business hour.
      </p>
    </div>
  );
};

export default MultiStepQuoteForm;
