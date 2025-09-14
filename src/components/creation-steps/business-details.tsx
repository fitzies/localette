"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "../ui/kibo-ui/dropzone";
import { useState } from "react";
import { useId } from "react";
import {
  validateBusinessName,
  validateDescription,
  validateAddress,
  validateUnitNumber,
  validatePostalCode,
} from "@/lib/utils";

const BusinessDetails = ({
  businessName,
  description,
  address1,
  address2,
  unitNumber,
  postalCode,
  onFormDataChange,
}: {
  businessName: string;
  description: string;
  address1: string;
  address2: string;
  unitNumber: string;
  postalCode: string;
  onFormDataChange: (field: string, value: string) => void;
}) => {
  // const [files, setFiles] = useState<File[] | undefined>();

  // const handleDrop = (files: File[]) => {
  //   console.log(files);
  //   setFiles(files);
  // };

  const businessNameMaxLength = 100;
  const descriptionMaxLength = 500;

  // Generate unique IDs for each input
  const businessNameId = useId();
  const descriptionId = useId();
  const address1Id = useId();
  const address2Id = useId();
  const unitNumberId = useId();
  const postalCodeId = useId();

  // Validation states
  const businessNameValidation = validateBusinessName(businessName);
  const descriptionValidation = validateDescription(description);
  const address1Validation = validateAddress(address1);
  const unitNumberValidation = validateUnitNumber(unitNumber);
  const postalCodeValidation = validatePostalCode(postalCode);

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= businessNameMaxLength) {
      onFormDataChange("businessName", value);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= descriptionMaxLength) {
      onFormDataChange("description", value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 w-2/3">
        <Label htmlFor={businessNameId}>Business Name</Label>
        <div className="relative">
          <Input
            id={businessNameId}
            className={`peer pe-14 ${
              !businessNameValidation.isValid && businessName
                ? "border-red-500"
                : ""
            }`}
            type="text"
            placeholder="Enter your business name"
            value={businessName}
            maxLength={businessNameMaxLength}
            onChange={handleBusinessNameChange}
            aria-describedby={`${businessNameId}-description`}
            aria-invalid={
              !businessNameValidation.isValid && businessName ? "true" : "false"
            }
          />
          <div
            id={`${businessNameId}-description`}
            className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums peer-disabled:opacity-50"
            aria-live="polite"
            role="status"
          >
            {businessName.length}/{businessNameMaxLength}
          </div>
        </div>
        {!businessNameValidation.isValid && businessName && (
          <p
            className="text-destructive mt-2 text-xs"
            role="alert"
            aria-live="polite"
          >
            {businessNameValidation.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={descriptionId}>Description</Label>
        <div className="relative">
          <Textarea
            id={descriptionId}
            className={`peer pe-14 resize-none ${
              !descriptionValidation.isValid && description
                ? "border-red-500"
                : ""
            }`}
            placeholder="Describe your business (minimum 50 characters)"
            value={description}
            maxLength={descriptionMaxLength}
            onChange={handleDescriptionChange}
            rows={4}
            aria-describedby={`${descriptionId}-description`}
            aria-invalid={
              !descriptionValidation.isValid && description ? "true" : "false"
            }
          />
          <div
            id={`${descriptionId}-description`}
            className="text-muted-foreground pointer-events-none absolute bottom-2 end-2 text-xs tabular-nums peer-disabled:opacity-50"
            aria-live="polite"
            role="status"
          >
            {description.length}/{descriptionMaxLength}
          </div>
        </div>
        {!descriptionValidation.isValid && description && (
          <p
            className="text-destructive mt-2 text-xs"
            role="alert"
            aria-live="polite"
          >
            {descriptionValidation.message}
          </p>
        )}
      </div>

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
              value={address1}
              onChange={(e) => onFormDataChange("address1", e.target.value)}
              className={
                !address1Validation.isValid && address1 ? "border-red-500" : ""
              }
              aria-invalid={
                !address1Validation.isValid && address1 ? "true" : "false"
              }
            />
            {!address1Validation.isValid && address1 && (
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
              value={address2}
              onChange={(e) => onFormDataChange("address2", e.target.value)}
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
              value={unitNumber}
              onChange={(e) => onFormDataChange("unitNumber", e.target.value)}
              className={
                !unitNumberValidation.isValid && unitNumber
                  ? "border-red-500"
                  : ""
              }
              aria-invalid={
                !unitNumberValidation.isValid && unitNumber ? "true" : "false"
              }
            />
            {!unitNumberValidation.isValid && unitNumber && (
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
              value={postalCode}
              onChange={(e) => onFormDataChange("postalCode", e.target.value)}
              className={
                !postalCodeValidation.isValid && postalCode
                  ? "border-red-500"
                  : ""
              }
              aria-invalid={
                !postalCodeValidation.isValid && postalCode ? "true" : "false"
              }
            />
            {!postalCodeValidation.isValid && postalCode && (
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

      {/* <div className="space-y-2">
        <Label>Business Image</Label>
        <Dropzone
          accept={{ "image/*": [] }}
          onDrop={handleDrop}
          onError={console.error}
          src={files}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      </div> */}
    </div>
  );
};

export default BusinessDetails;
