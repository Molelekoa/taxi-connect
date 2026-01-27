import { CarrierFormData } from "./types";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Step6Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const Step6Confirm = ({ formData, updateFormData, errors }: Step6Props) => {
  const referralOptions = [
    "Google / Search Engine",
    "Facebook / Social Media",
    "Friend / Family Referral",
    "Existing Driver Referral",
    "Job Board / Advertisement",
    "Other",
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-primary" />
          Confirm & Submit
        </h2>
        <p className="text-muted-foreground">
          Complete the final steps to submit your application.
        </p>
      </div>

      {/* Final Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
              Final Confirmation Required
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              By submitting this application, you confirm that all information provided is accurate, 
              complete, and truthful. Providing false information may result in rejection of your 
              application or termination of partnership.
            </p>
          </div>
        </div>
      </div>

      {/* Referral Source */}
      <div className="space-y-2">
        <Label htmlFor="referralSource">How did you hear about Parcel Buddy? *</Label>
        <Select
          value={formData.referralSource}
          onValueChange={(value) => updateFormData({ referralSource: value })}
        >
          <SelectTrigger className={errors.referralSource ? "border-destructive" : ""}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {referralOptions.map((option) => (
              <SelectItem key={option} value={option.toLowerCase()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.referralSource && (
          <p className="text-sm text-destructive mt-1">{errors.referralSource}</p>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="termsAccepted"
            checked={formData.termsAccepted}
            onCheckedChange={(checked) =>
              updateFormData({ termsAccepted: checked === true })
            }
            className={errors.termsAccepted ? "border-destructive" : ""}
          />
          <div className="space-y-1">
            <Label
              htmlFor="termsAccepted"
              className="cursor-pointer font-medium flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-primary" />
              Accept Terms & Conditions *
            </Label>
            <p className="text-sm text-muted-foreground">
              I have read and agree to the Parcel Buddy{" "}
              <Link to="/terms-of-service" className="text-primary hover:underline" target="_blank">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">
                Privacy Policy
              </Link>
              . I confirm that all information provided is accurate and complete.
            </p>
          </div>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-destructive mt-2">{errors.termsAccepted}</p>
        )}
      </div>
    </div>
  );
};

export default Step6Confirm;
