import { CarrierFormData } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Phone, MapPin } from "lucide-react";

interface Step1Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const Step1Personal = ({ formData, updateFormData, errors }: Step1Props) => {
  const countryOptions = [
    { value: "south-africa", label: "South Africa" },
    { value: "lesotho", label: "Lesotho" },
    { value: "zimbabwe", label: "Zimbabwe" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2 flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Personal Information
        </h2>
        <p className="text-muted-foreground">
          Tell us about yourself. This information helps us verify your identity.
        </p>
      </div>

      {/* Full Name */}
      <div>
        <Label htmlFor="fullName">Full Name (as per ID) *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => updateFormData({ fullName: e.target.value })}
          placeholder="Enter your full legal name"
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
        )}
      </div>

      {/* ID & Passport */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="idNumber">ID Number *</Label>
          <Input
            id="idNumber"
            value={formData.idNumber}
            onChange={(e) => updateFormData({ idNumber: e.target.value })}
            placeholder="Your national ID number"
            className={errors.idNumber ? "border-destructive" : ""}
          />
          {errors.idNumber && (
            <p className="text-sm text-destructive mt-1">{errors.idNumber}</p>
          )}
        </div>

        <div>
          <Label htmlFor="passportNumber">Passport Number (Optional)</Label>
          <Input
            id="passportNumber"
            value={formData.passportNumber}
            onChange={(e) => updateFormData({ passportNumber: e.target.value })}
            placeholder="For cross-border operations"
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="your@email.com"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="+27 XX XXX XXXX"
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Country */}
      <div>
        <Label htmlFor="country">Country of Residence *</Label>
        <Select
          value={formData.country}
          onValueChange={(value) => updateFormData({ country: value as any })}
        >
          <SelectTrigger className={errors.country ? "border-destructive" : ""}>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {countryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && (
          <p className="text-sm text-destructive mt-1">{errors.country}</p>
        )}
      </div>

      {/* Physical Address */}
      <div>
        <Label htmlFor="physicalAddress" className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          Physical Address *
        </Label>
        <Input
          id="physicalAddress"
          value={formData.physicalAddress}
          onChange={(e) => updateFormData({ physicalAddress: e.target.value })}
          placeholder="Street, City, Province/Region, Postal Code"
          className={errors.physicalAddress ? "border-destructive" : ""}
        />
        {errors.physicalAddress && (
          <p className="text-sm text-destructive mt-1">{errors.physicalAddress}</p>
        )}
      </div>
    </div>
  );
};

export default Step1Personal;
