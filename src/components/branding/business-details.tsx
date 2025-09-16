"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, Loader2, Clock, MapPin } from "lucide-react";
import { useState, useId, useEffect } from "react";
import {
  validateEmail,
  validatePhone,
  validateAddress,
  validateUnitNumber,
  validatePostalCode,
} from "@/lib/utils";
import { updateBusiness } from "@/lib/functions";
import { toast } from "sonner";

interface BusinessDetailsProps {
  businessId: string;
  email?: string | null;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  unitNumber?: string | null;
  postalCode?: string | null;
  pickupAvailable?: boolean;
  dineInAvailable?: boolean;
  availableDays?: string[];
  timeSlots?: string | null;
}

export function BusinessDetails({
  businessId,
  email,
  phone,
  address1,
  address2,
  unitNumber,
  postalCode,
  pickupAvailable = false,
  dineInAvailable = false,
  availableDays = [],
  timeSlots,
}: BusinessDetailsProps) {
  const emailId = useId();
  const phoneId = useId();
  const address1Id = useId();
  const address2Id = useId();
  const unitNumberId = useId();
  const postalCodeId = useId();
  const id = useId();

  const [formData, setFormData] = useState({
    email: email || "",
    phone: phone || "",
    address1: address1 || "",
    address2: address2 || "",
    unitNumber: unitNumber || "",
    postalCode: postalCode || "",
    pickupAvailable: pickupAvailable,
    dineInAvailable: dineInAvailable,
  });

  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    new Set(availableDays || [])
  );

  const [businessTimeSlots, setBusinessTimeSlots] = useState<
    Record<string, { from: string; to: string }>
  >({});

  const [isLoading, setIsLoading] = useState(false);

  // Parse existing time slots
  useEffect(() => {
    if (timeSlots) {
      try {
        const parsed = JSON.parse(timeSlots);
        setBusinessTimeSlots(parsed);
      } catch (error) {
        console.error("Failed to parse time slots:", error);
      }
    }
  }, [timeSlots]);

  // Days of the week
  const days = [
    { value: "1", label: "Sunday" },
    { value: "2", label: "Monday" },
    { value: "3", label: "Tuesday" },
    { value: "4", label: "Wednesday" },
    { value: "5", label: "Thursday" },
    { value: "6", label: "Friday" },
    { value: "7", label: "Saturday" },
  ];

  // Validation states
  const emailValidation = validateEmail(formData.email);
  const phoneValidation = validatePhone(formData.phone);
  const address1Validation = validateAddress(formData.address1);
  const unitNumberValidation = validateUnitNumber(formData.unitNumber);
  const postalCodeValidation = validatePostalCode(formData.postalCode);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (dayValue: string, checked: boolean) => {
    const newSelectedDays = new Set(selectedDays);
    if (checked) {
      newSelectedDays.add(dayValue);
      // Set default time slots for new day
      setBusinessTimeSlots((prev) => ({
        ...prev,
        [dayValue]: { from: "09:00", to: "17:00" },
      }));
    } else {
      newSelectedDays.delete(dayValue);
      // Remove time slots for unselected day
      setBusinessTimeSlots((prev) => {
        const newSlots = { ...prev };
        delete newSlots[dayValue];
        return newSlots;
      });
    }
    setSelectedDays(newSelectedDays);
  };

  const handleTimeChange = (
    dayValue: string,
    timeType: "from" | "to",
    time: string
  ) => {
    setBusinessTimeSlots((prev) => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        [timeType]: time,
      },
    }));
  };

  const handleSave = async () => {
    // Validation - only require email if provided
    const hasRequiredFields = formData.email || formData.phone;
    const emailValid = !formData.email || emailValidation.isValid;
    const phoneValid = !formData.phone || phoneValidation.isValid;
    const address1Valid = !formData.address1 || address1Validation.isValid;
    const unitNumberValid =
      !formData.unitNumber || unitNumberValidation.isValid;
    const postalCodeValid =
      !formData.postalCode || postalCodeValidation.isValid;

    // At least one delivery method must be selected
    const hasDeliveryMethod =
      formData.pickupAvailable || formData.dineInAvailable;

    if (!hasRequiredFields) {
      toast.error("Please provide at least an email or phone number");
      return;
    }

    if (!hasDeliveryMethod) {
      toast.error("Please select at least one delivery method");
      return;
    }

    if (
      !emailValid ||
      !phoneValid ||
      !address1Valid ||
      !unitNumberValid ||
      !postalCodeValid
    ) {
      toast.error("Please fix the validation errors before saving");
      return;
    }

    setIsLoading(true);
    try {
      await updateBusiness(businessId, {
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address1: formData.address1 || undefined,
        address2: formData.address2 || undefined,
        unitNumber: formData.unitNumber || undefined,
        postalCode: formData.postalCode || undefined,
        pickupAvailable: formData.pickupAvailable,
        dineInAvailable: formData.dineInAvailable,
        availableDays: Array.from(selectedDays),
        timeSlots: JSON.stringify(businessTimeSlots),
      });

      toast.success("Business details updated successfully! 🎉");
    } catch (error) {
      console.error("Failed to update business details:", error);
      toast.error("Failed to update business details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Business Details
        </CardTitle>
        <CardDescription>
          Manage your business contact information, delivery methods, and
          operating hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Contact Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor={emailId}>Business Email</Label>
              <div className="relative">
                <Input
                  id={emailId}
                  className={`peer pe-9 ${
                    !emailValidation.isValid && formData.email
                      ? "border-red-500"
                      : ""
                  }`}
                  type="email"
                  placeholder="Enter your business email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  aria-invalid={
                    !emailValidation.isValid && formData.email
                      ? "true"
                      : "false"
                  }
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              {!emailValidation.isValid && formData.email && (
                <p
                  className="text-destructive mt-2 text-xs"
                  role="alert"
                  aria-live="polite"
                >
                  {emailValidation.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor={phoneId}>Phone Number</Label>
              <div className="relative">
                <Input
                  id={phoneId}
                  className={`peer pe-9 ${
                    !phoneValidation.isValid && formData.phone
                      ? "border-red-500"
                      : ""
                  }`}
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  aria-invalid={
                    !phoneValidation.isValid && formData.phone
                      ? "true"
                      : "false"
                  }
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              {!phoneValidation.isValid && formData.phone && (
                <p
                  className="text-destructive mt-2 text-xs"
                  role="alert"
                  aria-live="polite"
                >
                  {phoneValidation.message}
                </p>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={address1Id}>Address Line 1</Label>
                <Input
                  id={address1Id}
                  type="text"
                  placeholder="Street address"
                  value={formData.address1}
                  onChange={(e) =>
                    handleInputChange("address1", e.target.value)
                  }
                  className={
                    !address1Validation.isValid && formData.address1
                      ? "border-red-500"
                      : ""
                  }
                  aria-invalid={
                    !address1Validation.isValid && formData.address1
                      ? "true"
                      : "false"
                  }
                />
                {!address1Validation.isValid && formData.address1 && (
                  <p
                    className="text-destructive mt-2 text-xs"
                    role="alert"
                    aria-live="polite"
                  >
                    {address1Validation.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <Label htmlFor={address2Id}>Address Line 2</Label>
                  <span className="text-muted-foreground text-sm">
                    Optional
                  </span>
                </div>
                <Input
                  id={address2Id}
                  type="text"
                  placeholder="Apartment, suite, etc."
                  value={formData.address2}
                  onChange={(e) =>
                    handleInputChange("address2", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={unitNumberId}>Unit Number</Label>
                <Input
                  id={unitNumberId}
                  type="text"
                  placeholder="Unit Number"
                  value={formData.unitNumber}
                  onChange={(e) =>
                    handleInputChange("unitNumber", e.target.value)
                  }
                  className={
                    !unitNumberValidation.isValid && formData.unitNumber
                      ? "border-red-500"
                      : ""
                  }
                  aria-invalid={
                    !unitNumberValidation.isValid && formData.unitNumber
                      ? "true"
                      : "false"
                  }
                />
                {!unitNumberValidation.isValid && formData.unitNumber && (
                  <p
                    className="text-destructive mt-2 text-xs"
                    role="alert"
                    aria-live="polite"
                  >
                    {unitNumberValidation.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={postalCodeId}>Postal Code</Label>
                <Input
                  id={postalCodeId}
                  type="text"
                  placeholder="123456 (SG) or 12345 (MY)"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  className={
                    !postalCodeValidation.isValid && formData.postalCode
                      ? "border-red-500"
                      : ""
                  }
                  aria-invalid={
                    !postalCodeValidation.isValid && formData.postalCode
                      ? "true"
                      : "false"
                  }
                />
                {!postalCodeValidation.isValid && formData.postalCode && (
                  <p
                    className="text-destructive mt-2 text-xs"
                    role="alert"
                    aria-live="polite"
                  >
                    {postalCodeValidation.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Methods Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">
              Delivery Methods & Operating Hours
            </h3>
          </div>

          <div className="grid gap-3">
            {/* Pickup Option */}
            <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
              <Checkbox
                id={`${id}-pickup`}
                className="order-1 after:absolute after:inset-0"
                checked={formData.pickupAvailable}
                onCheckedChange={(checked) =>
                  handleInputChange("pickupAvailable", checked)
                }
                aria-describedby={`${id}-pickup-description`}
              />
              <div className="flex grow items-center gap-3">
                <div className="grid gap-2">
                  <Label htmlFor={`${id}-pickup`}>
                    Pickup{" "}
                    <span className="text-muted-foreground text-xs leading-[inherit] font-normal">
                      (Self-collection)
                    </span>
                  </Label>
                  <p
                    id={`${id}-pickup-description`}
                    className="text-muted-foreground text-xs"
                  >
                    Customers can pick up their orders from your location.
                  </p>
                </div>
              </div>
            </div>

            {/* Dine-in Option */}
            <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
              <Checkbox
                id={`${id}-dinein`}
                className="order-1 after:absolute after:inset-0"
                checked={formData.dineInAvailable}
                onCheckedChange={(checked) =>
                  handleInputChange("dineInAvailable", checked)
                }
                aria-describedby={`${id}-dinein-description`}
              />
              <div className="flex grow items-center gap-3">
                <div className="grid gap-2">
                  <Label htmlFor={`${id}-dinein`}>
                    Dine-in{" "}
                    <span className="text-muted-foreground text-xs leading-[inherit] font-normal">
                      (Restaurant seating)
                    </span>
                  </Label>
                  <p
                    id={`${id}-dinein-description`}
                    className="text-muted-foreground text-xs"
                  >
                    Customers can dine at your restaurant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours Section */}
        <div className="space-y-6">
          {/* <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Operating Hours</h3>
          </div> */}

          <fieldset className="space-y-4">
            <legend className="text-foreground text-sm leading-none font-medium">
              Available Days
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {days.map((day) => (
                <label
                  key={`${id}-${day.value}`}
                  className="border-input has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex size-9 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50"
                >
                  <Checkbox
                    id={`${id}-${day.value}`}
                    value={day.value}
                    className="sr-only after:absolute after:inset-0"
                    checked={selectedDays.has(day.value)}
                    onCheckedChange={(checked) =>
                      handleDayToggle(day.value, checked as boolean)
                    }
                  />
                  <span aria-hidden="true" className="text-sm font-medium">
                    {day.label[0]}
                  </span>
                  <span className="sr-only">{day.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {selectedDays.size > 0 && (
            <div className="space-y-4">
              <Label className="text-foreground text-sm leading-none font-medium">
                Working Hours
              </Label>
              <div className="space-y-3">
                {days
                  .filter((day) => selectedDays.has(day.value))
                  .map((day) => (
                    <div
                      key={`time-${day.value}`}
                      className="flex items-center gap-4"
                    >
                      <div className="w-20 text-sm font-medium">
                        {day.label}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={businessTimeSlots[day.value]?.from || "09:00"}
                          onChange={(e) =>
                            handleTimeChange(day.value, "from", e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={businessTimeSlots[day.value]?.to || "17:00"}
                          onChange={(e) =>
                            handleTimeChange(day.value, "to", e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end border-t pt-6">
          <Button
            onClick={handleSave}
            variant={"outline"}
            disabled={
              isLoading ||
              !(formData.email || formData.phone) ||
              !(formData.pickupAvailable || formData.dineInAvailable) ||
              (!!formData.email && !emailValidation.isValid) ||
              (!!formData.phone && !phoneValidation.isValid) ||
              (!!formData.address1 && !address1Validation.isValid) ||
              (!!formData.unitNumber && !unitNumberValidation.isValid) ||
              (!!formData.postalCode && !postalCodeValidation.isValid)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Business Details"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
