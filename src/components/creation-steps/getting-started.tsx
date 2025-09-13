"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GettingStarted = ({
  businessType,
  onFormDataChange,
}: {
  businessType: string;
  onFormDataChange: (field: string, value: string) => void;
}) => {
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
      <Label>What type of business do you operate?</Label>
      <Select
        value={businessType}
        onValueChange={(value) => onFormDataChange("businessType", value)}
      >
        <SelectTrigger className="w-2/3">
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
    </div>
  );
};

export default GettingStarted;
