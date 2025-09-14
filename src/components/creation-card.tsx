"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import GettingStarted from "./creation-steps/getting-started";
import BusinessDetails from "./creation-steps/business-details";
import ContactInfo from "./creation-steps/contact-info";
import Availability from "./creation-steps/availability";
import Branding from "./creation-steps/branding";
import { createBusiness, CreateBusinessData } from "@/lib/functions";
import {
  validateBusinessType,
  validateBusinessName,
  validateDescription,
  validateAddress,
  validateUnitNumber,
  validatePostalCode,
  validateEmail,
  validatePhone,
} from "@/lib/utils";

export default function CreationCard() {
  const [step, setStep] = useState<number>(0);
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessType: "",
    businessName: "",
    description: "",
    address1: "",
    address2: "",
    unitNumber: "",
    postalCode: "",
    email: "",
    phone: "",
    pickupAvailable: true,
    dineInAvailable: false,
    availability: {},
    brandColor: "blue",
    businessLogo: null,
    bannerImage: null,
    address: "",
  });
  const steps = [
    "Getting started",
    "Business Details",
    "Contact Info",
    "Availability",
    "Branding",
  ];

  const createBusinessMutation = useMutation({
    mutationFn: (data: CreateBusinessData) => createBusiness(data),
    onSuccess: (response) => {
      router.push(`/admin/${response.businessId}`);
    },
    onError: (error) => {
      console.error("Error creating business:", error);
    },
  });

  // Define required fields for each step
  const stepRequirements = {
    0: ["businessType"],
    1: ["businessName", "description", "address1", "unitNumber", "postalCode"], // Address Line 2 is optional
    2: ["email", "phone"],
    3: ["pickupAvailable", "dineInAvailable", "availability"], // At least one delivery method + availability required
    4: [], // Branding - no required fields (all optional)
    5: [], // Review step - no additional requirements
  };

  const handleFormDataChange = (field: string, value: string | any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isStepValid = () => {
    const requiredFields =
      stepRequirements[step as keyof typeof stepRequirements] || [];

    const basicValidation = requiredFields.every((field) => {
      const value = formData[field as keyof typeof formData];

      // Special handling for delivery methods - at least one must be true
      if (field === "pickupAvailable" || field === "dineInAvailable") {
        return formData.pickupAvailable || formData.dineInAvailable;
      }

      // Special handling for availability object
      if (field === "availability") {
        const availability = value as { days?: string[]; timeSlots?: any };
        return (
          availability &&
          typeof availability === "object" &&
          Object.keys(availability).length > 0 &&
          availability.days &&
          Array.isArray(availability.days) &&
          availability.days.length > 0
        );
      }

      // Use proper validation functions for each field
      switch (field) {
        case "businessType":
          return validateBusinessType(value as string).isValid;
        case "businessName":
          return validateBusinessName(value as string).isValid;
        case "description":
          return validateDescription(value as string).isValid;
        case "address1":
          return validateAddress(value as string).isValid;
        case "unitNumber":
          return validateUnitNumber(value as string).isValid;
        case "postalCode":
          return validatePostalCode(value as string).isValid;
        case "email":
          return validateEmail(value as string).isValid;
        case "phone":
          return validatePhone(value as string).isValid;
        default:
          // Standard string validation for other fields
          return value !== "";
      }
    });

    // For the branding step (step 4), check if uploads are complete
    if (step === 4) {
      // Check if businessLogo and bannerImage are uploaded (not null/undefined)
      const logoUploaded =
        formData.businessLogo !== null && formData.businessLogo !== undefined;
      const bannerUploaded =
        formData.bannerImage !== null && formData.bannerImage !== undefined;

      // Both logo and banner are optional, so we don't require them
      // But if they're in the process of being uploaded, we should wait
      return basicValidation;
    }

    return basicValidation;
  };

  const handleContinue = () => {
    if (isStepValid()) {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        // Handle final step (submit form)
        createBusinessMutation.mutate(formData as CreateBusinessData);
      }
    }
  };

  const getButtonText = () => {
    return step === steps.length - 1 ? "Submit" : "Continue";
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <GettingStarted
            businessType={formData.businessType}
            onFormDataChange={handleFormDataChange}
          />
        );
      case 1:
        return (
          <BusinessDetails
            businessName={formData.businessName}
            description={formData.description}
            address1={formData.address1}
            address2={formData.address2}
            unitNumber={formData.unitNumber}
            postalCode={formData.postalCode}
            onFormDataChange={handleFormDataChange}
          />
        );
      case 2:
        return (
          <ContactInfo
            email={formData.email}
            phone={formData.phone}
            onFormDataChange={handleFormDataChange}
          />
        );
      case 3:
        return (
          <Availability
            availability={formData.availability}
            pickupAvailable={formData.pickupAvailable}
            dineInAvailable={formData.dineInAvailable}
            onFormDataChange={handleFormDataChange}
          />
        );
      case 4:
        return (
          <Branding
            brandColor={formData.brandColor}
            businessLogo={formData.businessLogo}
            bannerImage={formData.bannerImage}
            onFormDataChange={handleFormDataChange}
          />
        );
      default:
        return <div>Step {step + 1} content coming soon...</div>;
    }
  };

  return (
    <Card
      className={`mx-auto my-auto ${step === 4 ? "max-w-5xl" : "max-w-2xl"}`}
    >
      <CardHeader>
        <CardTitle>{steps[step]}</CardTitle>
        <CardDescription>
          Lorem ipsum dolor, sit amet consectetur adipisicing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStepContent()}
        <div className="mt-6 flex flex-col gap-4">
          {createBusinessMutation.error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              Error: {createBusinessMutation.error.message}
            </div>
          )}
          <div className="flex justify-start">
            <Button
              onClick={handleContinue}
              disabled={!isStepValid() || createBusinessMutation.isPending}
              className="min-w-[100px]"
            >
              {createBusinessMutation.isPending
                ? "Creating..."
                : getButtonText()}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Progress value={(step / (steps.length - 1)) * 100} />
      </CardFooter>
    </Card>
  );
}
