"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useId } from "react";
import { validateBusinessType } from "@/lib/utils";

const GettingStarted = ({
  businessType,
  onFormDataChange,
}: {
  businessType: string;
  onFormDataChange: (field: string, value: string) => void;
}) => {
  const businessTypeId = useId();
  const businessTypeValidation = validateBusinessType(businessType);

  const businessOptions = [
    "Food and dining",
    "Grocery and supermarket",
    "Health and beauty",
    "Travel and rental",
    "Retail and shopping",
    "Gifts and crafts",
    "Pets and grooming",
    "Home services",
    "Education",
    "Professional services",
    "B2B",
    "Others",
  ];

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={businessTypeId}>
        What type of business do you operate?
      </Label>
      <Select
        value={businessType}
        onValueChange={(value) => onFormDataChange("businessType", value)}
      >
        <SelectTrigger
          className={`w-2/3 ${
            !businessTypeValidation.isValid && businessType
              ? "border-red-500"
              : ""
          }`}
          aria-invalid={
            !businessTypeValidation.isValid && businessType ? "true" : "false"
          }
        >
          <SelectValue placeholder="Select your business type" />
        </SelectTrigger>
        <SelectContent>
          {businessOptions.map((option) => (
            <SelectItem
              key={option}
              value={option.toLowerCase().replace(/\s+/g, "-")}
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!businessTypeValidation.isValid && businessType && (
        <p
          className="text-destructive mt-2 text-xs"
          role="alert"
          aria-live="polite"
        >
          {businessTypeValidation.message}
        </p>
      )}
    </div>
  );
};

export default GettingStarted;
