import { CarrierFormData } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Step1Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const Step1Company = ({ formData, updateFormData, errors }: Step1Props) => {
  const countryOptions = [
    { value: "south-africa", label: "South Africa" },
    { value: "lesotho", label: "Lesotho" },
    { value: "zimbabwe", label: "Zimbabwe" },
  ];

  const businessTypes = [
    { value: "owner-operator", label: "Owner-Operator" },
    { value: "small-fleet", label: "Small Fleet (1-5 vehicles)" },
    { value: "midsize-fleet", label: "Midsize Fleet (6-25 vehicles)" },
    { value: "large-fleet", label: "Large Fleet (25+ vehicles)" },
  ];

  const yearsOptions = [
    "Less than 1 year",
    "1-2 years",
    "3-5 years",
    "6-10 years",
    "10+ years",
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
          Tell Us About Your Business
        </h2>
        <p className="text-muted-foreground">
          Provide your company details and primary contact information.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="legalBusinessName">Legal Business Name *</Label>
          <Input
            id="legalBusinessName"
            value={formData.legalBusinessName}
            onChange={(e) => updateFormData({ legalBusinessName: e.target.value })}
            placeholder="Your registered company name"
            className={errors.legalBusinessName ? "border-destructive" : ""}
          />
          {errors.legalBusinessName && (
            <p className="text-sm text-destructive mt-1">{errors.legalBusinessName}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="tradingName">Trading Name (if different)</Label>
          <Input
            id="tradingName"
            value={formData.tradingName}
            onChange={(e) => updateFormData({ tradingName: e.target.value })}
            placeholder="Optional trading name"
          />
        </div>

        <div>
          <Label htmlFor="country">Country of Operation *</Label>
          <Select
            value={formData.country}
            onValueChange={(value) => updateFormData({ country: value as any })}
          >
            <SelectTrigger className={errors.country ? "border-destructive" : ""}>
              <SelectValue placeholder="Select country" />
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
      </div>

      <div>
        <Label className="mb-3 block">Business Type *</Label>
        <RadioGroup
          value={formData.businessType}
          onValueChange={(value) => updateFormData({ businessType: value as any })}
          className="grid sm:grid-cols-2 gap-3"
        >
          {businessTypes.map((type) => (
            <div
              key={type.value}
              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                formData.businessType === type.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={type.value} id={type.value} />
              <Label htmlFor={type.value} className="cursor-pointer font-normal">
                {type.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.businessType && (
          <p className="text-sm text-destructive mt-1">{errors.businessType}</p>
        )}
      </div>

      <div>
        <Label htmlFor="yearsInOperation">Years in Operation *</Label>
        <Select
          value={formData.yearsInOperation}
          onValueChange={(value) => updateFormData({ yearsInOperation: value })}
        >
          <SelectTrigger className={errors.yearsInOperation ? "border-destructive" : ""}>
            <SelectValue placeholder="Select years in operation" />
          </SelectTrigger>
          <SelectContent>
            {yearsOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.yearsInOperation && (
          <p className="text-sm text-destructive mt-1">{errors.yearsInOperation}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="primaryContactPerson">Primary Contact Person *</Label>
          <Input
            id="primaryContactPerson"
            value={formData.primaryContactPerson}
            onChange={(e) => updateFormData({ primaryContactPerson: e.target.value })}
            placeholder="Full name"
            className={errors.primaryContactPerson ? "border-destructive" : ""}
          />
          {errors.primaryContactPerson && (
            <p className="text-sm text-destructive mt-1">{errors.primaryContactPerson}</p>
          )}
        </div>

        <div>
          <Label htmlFor="contactTitle">Contact Title *</Label>
          <Input
            id="contactTitle"
            value={formData.contactTitle}
            onChange={(e) => updateFormData({ contactTitle: e.target.value })}
            placeholder="e.g., Owner, Fleet Manager"
            className={errors.contactTitle ? "border-destructive" : ""}
          />
          {errors.contactTitle && (
            <p className="text-sm text-destructive mt-1">{errors.contactTitle}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="directPhone">Direct Phone *</Label>
          <Input
            id="directPhone"
            type="tel"
            value={formData.directPhone}
            onChange={(e) => updateFormData({ directPhone: e.target.value })}
            placeholder="+27 XX XXX XXXX"
            className={errors.directPhone ? "border-destructive" : ""}
          />
          {errors.directPhone && (
            <p className="text-sm text-destructive mt-1">{errors.directPhone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
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
      </div>

      <div>
        <Label htmlFor="physicalAddress">Physical Business Address *</Label>
        <Input
          id="physicalAddress"
          value={formData.physicalAddress}
          onChange={(e) => updateFormData({ physicalAddress: e.target.value })}
          placeholder="Street, City, Province, Postal Code"
          className={errors.physicalAddress ? "border-destructive" : ""}
        />
        {errors.physicalAddress && (
          <p className="text-sm text-destructive mt-1">{errors.physicalAddress}</p>
        )}
      </div>

      <div>
        <Label htmlFor="website">Website or Social Media</Label>
        <Input
          id="website"
          value={formData.website}
          onChange={(e) => updateFormData({ website: e.target.value })}
          placeholder="https://yourcompany.co.za (Optional)"
        />
      </div>
    </div>
  );
};

export default Step1Company;
