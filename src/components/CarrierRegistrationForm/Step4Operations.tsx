import { CarrierFormData } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Package, Phone, Users, Route, Calendar, Clock, Truck, Plus, X } from "lucide-react";
import { CARRIER_CITY_OPTIONS } from "@/config/cities";

interface Step4Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const Step4Operations = ({ formData, updateFormData, errors }: Step4Props) => {
  const cities = CARRIER_CITY_OPTIONS;

  const cargoTypes = [
    { id: "documents", label: "Documents & Paperwork" },
    { id: "electronics", label: "Electronic Devices" },
    { id: "medication", label: "Medication & Pharmacy" },
    { id: "automotive", label: "Automotive Parts" },
    { id: "clothing", label: "Clothing & Apparel" },
    { id: "food-ambient", label: "Food (Non-perishable)" },
    { id: "gifts", label: "Gifts & Personal Items" },
    { id: "books", label: "Books & Printed Materials" },
  ];

  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "2-3-weekly", label: "2-3 times per week" },
    { value: "weekly", label: "Weekly" },
    { value: "fortnightly", label: "Fortnightly" },
    { value: "monthly", label: "Monthly" },
    { value: "occasionally", label: "Occasionally" },
  ];

  const departureTimeOptions = [
    { value: "early-morning", label: "Early morning (before 8am)" },
    { value: "morning", label: "Morning (8am - 12pm)" },
    { value: "afternoon", label: "Afternoon (12pm - 5pm)" },
    { value: "evening", label: "Evening (after 5pm)" },
    { value: "varies", label: "Varies" },
  ];

  const advanceNoticeOptions = [
    { value: "same-day", label: "Same day" },
    { value: "24-hours", label: "24 hours" },
    { value: "2-3-days", label: "2-3 days" },
    { value: "1-week", label: "1 week or more" },
  ];

  const parcelsPerTripOptions = [
    { value: "1-2", label: "1-2 parcels" },
    { value: "3-5", label: "3-5 parcels" },
    { value: "6-10", label: "6-10 parcels" },
    { value: "10+", label: "10+ parcels" },
  ];

  const storageTypeOptions = [
    { value: "dedicated", label: "Dedicated cargo area (boot/truck bed)" },
    { value: "shared", label: "Shared with passenger space" },
    { value: "trailer", label: "Trailer/additional storage" },
  ];

  const daysOfWeek = [
    { value: "mon", label: "Mon" },
    { value: "tue", label: "Tue" },
    { value: "wed", label: "Wed" },
    { value: "thu", label: "Thu" },
    { value: "fri", label: "Fri" },
    { value: "sat", label: "Sat" },
    { value: "sun", label: "Sun" },
  ];

  const relationshipOptions = [
    "Spouse/Partner",
    "Parent",
    "Sibling",
    "Child",
    "Friend",
    "Other",
  ];

  const toggleCargoType = (cargoId: string) => {
    const current = formData.cargoTypes || [];
    if (current.includes(cargoId)) {
      updateFormData({ cargoTypes: current.filter((id) => id !== cargoId) });
    } else {
      updateFormData({ cargoTypes: [...current, cargoId] });
    }
  };

  const toggleDay = (day: string) => {
    const current = formData.availableDays || [];
    if (current.includes(day)) {
      updateFormData({ availableDays: current.filter((d) => d !== day) });
    } else {
      updateFormData({ availableDays: [...current, day] });
    }
  };

  const addAdditionalRoute = () => {
    const current = formData.additionalRoutes || [];
    if (current.length < 3) {
      updateFormData({ additionalRoutes: [...current, { from: "", to: "" }] });
    }
  };

  const updateAdditionalRoute = (index: number, field: "from" | "to", value: string) => {
    const current = formData.additionalRoutes || [];
    const updated = current.map((route, i) => 
      i === index ? { ...route, [field]: value } : route
    );
    updateFormData({ additionalRoutes: updated });
  };

  const removeAdditionalRoute = (index: number) => {
    const current = formData.additionalRoutes || [];
    updateFormData({ additionalRoutes: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2 flex items-center gap-2">
          <Route className="w-6 h-6 text-primary" />
          Routes & Availability
        </h2>
        <p className="text-muted-foreground">
          Help us match you with parcels heading your way. The more we know about your regular routes and schedule, the better we can send you relevant delivery opportunities.
        </p>
      </div>

      {/* YOUR REGULAR ROUTES */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Your Regular Routes
        </Label>
        <p className="text-sm text-muted-foreground -mt-2">
          Tell us about the routes you travel regularly
        </p>

        {/* Primary Route */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primaryRouteFrom">From *</Label>
            <Select
              value={formData.primaryRouteFrom}
              onValueChange={(value) => updateFormData({ primaryRouteFrom: value })}
            >
              <SelectTrigger className={errors.primaryRouteFrom ? "border-destructive" : ""}>
                <SelectValue placeholder="Select departure city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.primaryRouteFrom && (
              <p className="text-sm text-destructive mt-1">{errors.primaryRouteFrom}</p>
            )}
          </div>

          <div>
            <Label htmlFor="primaryRouteTo">To *</Label>
            <Select
              value={formData.primaryRouteTo}
              onValueChange={(value) => updateFormData({ primaryRouteTo: value })}
            >
              <SelectTrigger className={errors.primaryRouteTo ? "border-destructive" : ""}>
                <SelectValue placeholder="Select destination city" />
              </SelectTrigger>
              <SelectContent>
                {cities.filter(c => c.value !== formData.primaryRouteFrom).map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.primaryRouteTo && (
              <p className="text-sm text-destructive mt-1">{errors.primaryRouteTo}</p>
            )}
          </div>
        </div>

        {/* Return Trip */}
        <div>
          <Label className="mb-3 block">Do you travel this route in both directions? *</Label>
          <RadioGroup
            value={formData.returnTrip}
            onValueChange={(value: "yes" | "no" | "sometimes") => updateFormData({ returnTrip: value })}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="return-yes" />
              <Label htmlFor="return-yes" className="font-normal cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="return-no" />
              <Label htmlFor="return-no" className="font-normal cursor-pointer">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sometimes" id="return-sometimes" />
              <Label htmlFor="return-sometimes" className="font-normal cursor-pointer">Sometimes</Label>
            </div>
          </RadioGroup>
          {errors.returnTrip && (
            <p className="text-sm text-destructive mt-1">{errors.returnTrip}</p>
          )}
        </div>

        {/* Additional Routes */}
        {formData.additionalRoutes && formData.additionalRoutes.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Additional Routes</Label>
            {formData.additionalRoutes.map((route, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select
                  value={route.from}
                  onValueChange={(value) => updateAdditionalRoute(index, "from", value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">→</span>
                <Select
                  value={route.to}
                  onValueChange={(value) => updateAdditionalRoute(index, "to", value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.filter(c => c.value !== route.from).map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAdditionalRoute(index)}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {(!formData.additionalRoutes || formData.additionalRoutes.length < 3) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAdditionalRoute}
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add another route
          </Button>
        )}
      </div>

      {/* YOUR TRAVEL SCHEDULE */}
      <div className="space-y-4 pt-6 border-t border-border">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Your Travel Schedule
        </Label>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="travelFrequency">How often do you travel your primary route? *</Label>
            <Select
              value={formData.travelFrequency}
              onValueChange={(value) => updateFormData({ travelFrequency: value })}
            >
              <SelectTrigger className={errors.travelFrequency ? "border-destructive" : ""}>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.travelFrequency && (
              <p className="text-sm text-destructive mt-1">{errors.travelFrequency}</p>
            )}
          </div>

          <div>
            <Label>Is your schedule predictable? *</Label>
            <RadioGroup
              value={formData.scheduleType}
              onValueChange={(value: "fixed" | "somewhat" | "varies") => updateFormData({ scheduleType: value })}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="schedule-fixed" />
                <Label htmlFor="schedule-fixed" className="font-normal cursor-pointer text-sm">Yes, I travel on fixed days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="somewhat" id="schedule-somewhat" />
                <Label htmlFor="schedule-somewhat" className="font-normal cursor-pointer text-sm">Somewhat - days may vary</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="varies" id="schedule-varies" />
                <Label htmlFor="schedule-varies" className="font-normal cursor-pointer text-sm">No - varies week to week</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Available Days - show if schedule is fixed or somewhat predictable */}
        {(formData.scheduleType === "fixed" || formData.scheduleType === "somewhat") && (
          <div>
            <Label className="mb-3 block">Which days are you typically available to travel?</Label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    formData.availableDays?.includes(day.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="departureTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              What time do you usually depart? *
            </Label>
            <Select
              value={formData.departureTime}
              onValueChange={(value) => updateFormData({ departureTime: value })}
            >
              <SelectTrigger className={errors.departureTime ? "border-destructive" : ""}>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {departureTimeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.departureTime && (
              <p className="text-sm text-destructive mt-1">{errors.departureTime}</p>
            )}
          </div>

          <div>
            <Label htmlFor="advanceNotice">How much advance notice do you need? *</Label>
            <Select
              value={formData.advanceNotice}
              onValueChange={(value) => updateFormData({ advanceNotice: value })}
            >
              <SelectTrigger className={errors.advanceNotice ? "border-destructive" : ""}>
                <SelectValue placeholder="Select notice period" />
              </SelectTrigger>
              <SelectContent>
                {advanceNoticeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.advanceNotice && (
              <p className="text-sm text-destructive mt-1">{errors.advanceNotice}</p>
            )}
          </div>
        </div>
      </div>

      {/* PARCEL TYPES & CAPACITY */}
      <div className="space-y-4 pt-6 border-t border-border">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Parcel Types & Capacity
        </Label>

        <div>
          <Label className="mb-3 block">Parcel Types You Can Carry *</Label>
          <div className="grid grid-cols-2 gap-3">
            {cargoTypes.map((cargo) => (
              <div
                key={cargo.id}
                className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.cargoTypes?.includes(cargo.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => toggleCargoType(cargo.id)}
              >
                <Checkbox
                  checked={formData.cargoTypes?.includes(cargo.id)}
                  onCheckedChange={() => toggleCargoType(cargo.id)}
                />
                <Label className="cursor-pointer font-normal text-sm">{cargo.label}</Label>
              </div>
            ))}
          </div>
          {errors.cargoTypes && (
            <p className="text-sm text-destructive mt-1">{errors.cargoTypes}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="parcelsPerTrip" className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-muted-foreground" />
              How many parcels can you carry per trip? *
            </Label>
            <Select
              value={formData.parcelsPerTrip}
              onValueChange={(value) => updateFormData({ parcelsPerTrip: value })}
            >
              <SelectTrigger className={errors.parcelsPerTrip ? "border-destructive" : ""}>
                <SelectValue placeholder="Select capacity" />
              </SelectTrigger>
              <SelectContent>
                {parcelsPerTripOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.parcelsPerTrip && (
              <p className="text-sm text-destructive mt-1">{errors.parcelsPerTrip}</p>
            )}
          </div>

          <div>
            <Label htmlFor="storageType">Where will parcels be stored? (Optional)</Label>
            <Select
              value={formData.storageType}
              onValueChange={(value) => updateFormData({ storageType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select storage type" />
              </SelectTrigger>
              <SelectContent>
                {storageTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* EMERGENCY CONTACT */}
      <div className="pt-6 border-t border-border">
        <Label className="mb-4 block text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Emergency Contact
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Please provide an emergency contact we can reach if needed.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="emergencyContactName">Contact Name *</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
              placeholder="Full name"
              className={errors.emergencyContactName ? "border-destructive" : ""}
            />
            {errors.emergencyContactName && (
              <p className="text-sm text-destructive mt-1">{errors.emergencyContactName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="emergencyContactRelation">Relationship *</Label>
            <Select
              value={formData.emergencyContactRelation}
              onValueChange={(value) => updateFormData({ emergencyContactRelation: value })}
            >
              <SelectTrigger className={errors.emergencyContactRelation ? "border-destructive" : ""}>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((option) => (
                  <SelectItem key={option} value={option.toLowerCase()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.emergencyContactRelation && (
              <p className="text-sm text-destructive mt-1">{errors.emergencyContactRelation}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="emergencyContactPhone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Contact Phone Number *
          </Label>
          <Input
            id="emergencyContactPhone"
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
            placeholder="+27 XX XXX XXXX"
            className={errors.emergencyContactPhone ? "border-destructive" : ""}
          />
          {errors.emergencyContactPhone && (
            <p className="text-sm text-destructive mt-1">{errors.emergencyContactPhone}</p>
          )}
        </div>
      </div>

      {/* PAYOUT / BANKING DETAILS */}
      <div className="pt-6 border-t border-border">
        <Label className="mb-4 block text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Payout Details
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Add bank details so we can pay you for completed deliveries. You can add these now or update them later from your dashboard before your first payout.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="bankAccountHolder">Account Holder Name</Label>
            <Input
              id="bankAccountHolder"
              value={formData.bankAccountHolder}
              onChange={(e) => updateFormData({ bankAccountHolder: e.target.value })}
              placeholder="Full name as on account"
            />
          </div>
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => updateFormData({ bankName: e.target.value })}
              placeholder="e.g. Standard Bank, ABSA"
            />
          </div>
          <div>
            <Label htmlFor="bankAccountNumber">Account Number</Label>
            <Input
              id="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={(e) => updateFormData({ bankAccountNumber: e.target.value })}
              placeholder="Account number"
            />
          </div>
          <div>
            <Label htmlFor="bankBranchCode">Branch Code</Label>
            <Input
              id="bankBranchCode"
              value={formData.bankBranchCode}
              onChange={(e) => updateFormData({ bankBranchCode: e.target.value })}
              placeholder="e.g. 051001"
            />
          </div>
          <div>
            <Label htmlFor="bankAccountType">Account Type</Label>
            <Select
              value={formData.bankAccountType}
              onValueChange={(value) => updateFormData({ bankAccountType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cheque">Cheque / Current</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Operations;