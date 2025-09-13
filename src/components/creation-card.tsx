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
import GettingStarted from "./creation-steps/getting-started";
import BusinessDetails from "./creation-steps/business-details";
import ContactInfo from "./creation-steps/contact-info";
import Availability from "./creation-steps/availability";
import AdditionalDetails from "./creation-steps/additional-details";

export default function CreationCard() {
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState({
    businessType: "",
    businessName: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    website: "",
  });
  const steps = [
    "Getting started",
    "Business Details",
    "Contact Info",
    "Availability",
    "Additional Details",
    "Review",
  ];

  // Define required fields for each step
  const stepRequirements = {
    0: ["businessType"],
    1: ["businessName", "description"],
    2: ["email", "phone"],
    3: [], // Availability step - no requirements (just button)
    4: ["address"], // Additional Details - address required, website optional
    5: [], // Review step - no additional requirements
  };

  const handleFormDataChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isStepValid = () => {
    const requiredFields =
      stepRequirements[step as keyof typeof stepRequirements] || [];
    return requiredFields.every(
      (field) => formData[field as keyof typeof formData] !== ""
    );
  };

  const handleContinue = () => {
    if (isStepValid()) {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        // Handle final step (submit form, etc.)
        console.log("Form submitted:", formData);
        // Add your submission logic here
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
        return <Availability />;
      case 4:
        return (
          <AdditionalDetails
            address={formData.address}
            website={formData.website}
            onFormDataChange={handleFormDataChange}
          />
        );
      default:
        return <div>Step {step + 1} content coming soon...</div>;
    }
  };

  return (
    <Card className="mx-auto my-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{steps[step]}</CardTitle>
        <CardDescription>
          Lorem ipsum dolor, sit amet consectetur adipisicing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStepContent()}
        <div className="mt-6 flex justify-start">
          <Button
            onClick={handleContinue}
            disabled={!isStepValid()}
            className="min-w-[100px]"
          >
            {getButtonText()}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Progress value={(step / (steps.length - 1)) * 100} />
      </CardFooter>
    </Card>
  );
}
