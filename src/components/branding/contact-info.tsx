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
import { Mail, Phone, Loader2 } from "lucide-react";
import { useState, useId } from "react";
import {
  validateEmail,
  validatePhone,
  validateAddress,
  validateUnitNumber,
  validatePostalCode,
} from "@/lib/utils";
import { updateBusiness } from "@/lib/functions";
import { toast } from "sonner";

interface ContactInfoProps {
  businessId: string;
  email?: string | null;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  unitNumber?: string | null;
  postalCode?: string | null;
}

export function ContactInfo({
  businessId,
  email,
  phone,
  address1,
  address2,
  unitNumber,
  postalCode,
}: ContactInfoProps) {
  const emailId = useId();
  const phoneId = useId();
  const address1Id = useId();
  const address2Id = useId();
  const unitNumberId = useId();
  const postalCodeId = useId();

  const [formData, setFormData] = useState({
    email: email || "",
    phone: phone || "",
    address1: address1 || "",
    address2: address2 || "",
    unitNumber: unitNumber || "",
    postalCode: postalCode || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Validation states
  const emailValidation = validateEmail(formData.email);
  const phoneValidation = validatePhone(formData.phone);
  const address1Validation = validateAddress(formData.address1);
  const unitNumberValidation = validateUnitNumber(formData.unitNumber);
  const postalCodeValidation = validatePostalCode(formData.postalCode);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    if (!hasRequiredFields) {
      toast.error("Please provide at least an email or phone number");
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
      });

      toast.success("Contact information updated successfully!");
    } catch (error) {
      console.error("Failed to update contact information:", error);
      toast.error("Failed to update contact information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Manage your business contact details for customer communication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email */}
        <div className="space-y-2 w-2/3">
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
                !emailValidation.isValid && formData.email ? "true" : "false"
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
        <div className="space-y-2 w-2/3">
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
                !phoneValidation.isValid && formData.phone ? "true" : "false"
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

        {/* Address Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-1">
                <Label htmlFor={address1Id} className="leading-6">
                  Address Line 1
                </Label>
              </div>
              <Input
                id={address1Id}
                type="text"
                placeholder="Street address"
                value={formData.address1}
                onChange={(e) => handleInputChange("address1", e.target.value)}
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
                <Label htmlFor={address2Id} className="leading-6">
                  Address Line 2
                </Label>
                <span className="text-muted-foreground text-sm">Optional</span>
              </div>
              <Input
                id={address2Id}
                type="text"
                placeholder="Apartment, suite, etc."
                value={formData.address2}
                onChange={(e) => handleInputChange("address2", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-1">
                <Label htmlFor={unitNumberId} className="leading-6">
                  Unit Number
                </Label>
              </div>
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
              <div className="flex items-center justify-between gap-1">
                <Label htmlFor={postalCodeId} className="leading-6">
                  Postal Code
                </Label>
              </div>
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

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            variant={"outline"}
            disabled={
              isLoading ||
              !(formData.email || formData.phone) ||
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
              "Save"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
