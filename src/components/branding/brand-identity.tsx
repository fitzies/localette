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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "emblor";
import { useId, useState } from "react";
import { validateBusinessName, validateDescription } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateBusiness } from "@/lib/functions";
import { toast } from "sonner";

interface BrandIdentityProps {
  businessId: string;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  brandColor?: string | null;
  brandKeywords?: string | null;
}

export function BrandIdentity({
  businessId,
  name,
  description,
  category,
  brandColor,
  brandKeywords,
}: BrandIdentityProps) {
  const businessNameId = useId();
  const descriptionId = useId();
  const categoryId = useId();
  const keywordsId = useId();

  const businessNameMaxLength = 100;
  const descriptionMaxLength = 500;

  const [formData, setFormData] = useState({
    businessName: name || "",
    description: description || "",
    category: category || "",
    brandColor: brandColor || "blue",
  });

  // Initialize brand keywords from props
  const [brandKeywordsState, setBrandKeywords] = useState<any[]>(() => {
    if (brandKeywords) {
      try {
        const parsed = JSON.parse(brandKeywords);
        return Array.isArray(parsed)
          ? parsed.map((keyword: string, index: number) => ({
              id: `keyword-${index}-${keyword}`,
              text: keyword,
            }))
          : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validation states
  const businessNameValidation = validateBusinessName(formData.businessName);
  const descriptionValidation = validateDescription(formData.description);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= businessNameMaxLength) {
      handleInputChange("businessName", value);
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= descriptionMaxLength) {
      handleInputChange("description", value);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!businessNameValidation.isValid || !descriptionValidation.isValid) {
      toast.error("Please fix the validation errors before saving");
      return;
    }

    setIsLoading(true);
    try {
      await updateBusiness(businessId, {
        name: formData.businessName,
        description: formData.description,
        category: formData.category,
        brandColor: formData.brandColor,
        brandKeywords: JSON.stringify(
          brandKeywordsState.map((tag) => tag.text)
        ),
      });

      toast.success("Brand identity updated successfully!");
    } catch (error) {
      console.error("Failed to update brand identity:", error);
      toast.error("Failed to update brand identity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Identity & Voice</CardTitle>
        <CardDescription>
          Manage your business name, description, category, and brand
          personality.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Name and Category - Same Line */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor={businessNameId}>Business Name</Label>
            <div className="relative">
              <Input
                id={businessNameId}
                className={`peer pe-14 ${
                  !businessNameValidation.isValid && formData.businessName
                    ? "border-red-500"
                    : ""
                }`}
                type="text"
                placeholder="Enter your business name"
                value={formData.businessName}
                maxLength={businessNameMaxLength}
                onChange={handleBusinessNameChange}
                aria-describedby={`${businessNameId}-description`}
                aria-invalid={
                  !businessNameValidation.isValid && formData.businessName
                    ? "true"
                    : "false"
                }
              />
              <div
                id={`${businessNameId}-description`}
                className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums peer-disabled:opacity-50"
                aria-live="polite"
                role="status"
              >
                {formData.businessName.length}/{businessNameMaxLength}
              </div>
            </div>
            {!businessNameValidation.isValid && formData.businessName && (
              <p
                className="text-destructive mt-2 text-xs"
                role="alert"
                aria-live="polite"
              >
                {businessNameValidation.message}
              </p>
            )}
          </div>

          {/* Business Category */}
          <div className="space-y-2">
            <Label htmlFor={categoryId}>Business Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger
                className={`w-full ${
                  !formData.category ? "border-red-500" : ""
                }`}
                aria-invalid={!formData.category ? "true" : "false"}
              >
                <SelectValue placeholder="Select your business category" />
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
            {!formData.category && (
              <p
                className="text-destructive mt-2 text-xs"
                role="alert"
                aria-live="polite"
              >
                Please select a business category
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={descriptionId}>Business Description</Label>
          <div className="relative">
            <Textarea
              id={descriptionId}
              className={`peer pe-14 resize-none ${
                !descriptionValidation.isValid && formData.description
                  ? "border-red-500"
                  : ""
              }`}
              placeholder="Describe your business, what you offer, and what makes you unique..."
              value={formData.description}
              maxLength={descriptionMaxLength}
              onChange={handleDescriptionChange}
              rows={4}
              aria-describedby={`${descriptionId}-description`}
              aria-invalid={
                !descriptionValidation.isValid && formData.description
                  ? "true"
                  : "false"
              }
            />
            <div
              id={`${descriptionId}-description`}
              className="text-muted-foreground pointer-events-none absolute bottom-2 end-2 text-xs tabular-nums peer-disabled:opacity-50"
              aria-live="polite"
              role="status"
            >
              {formData.description.length}/{descriptionMaxLength}
            </div>
          </div>
          {!descriptionValidation.isValid && formData.description && (
            <p
              className="text-destructive mt-2 text-xs"
              role="alert"
              aria-live="polite"
            >
              {descriptionValidation.message}
            </p>
          )}
        </div>

        {/* Brand Keywords and Brand Color - Same Line */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Keywords */}
          <div className="space-y-2">
            <Label htmlFor={keywordsId}>Brand Keywords</Label>
            <TagInput
              id={keywordsId}
              tags={brandKeywordsState}
              setTags={setBrandKeywords}
              placeholder="Add brand keywords (premium, organic, local, innovative)"
              styleClasses={{
                tagList: {
                  container: "gap-1",
                },
                input:
                  "rounded-md transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                tag: {
                  body: "relative h-7 bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7",
                  closeButton:
                    "absolute -inset-y-px -end-px p-0 rounded-s-none rounded-e-md flex size-7 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-muted-foreground/80 hover:text-foreground",
                },
              }}
              activeTagIndex={activeTagIndex}
              setActiveTagIndex={setActiveTagIndex}
              inlineTags={false}
              inputFieldPosition="top"
            />
            <p className="text-xs text-gray-500">
              Keywords that describe your brand personality and values
            </p>
          </div>

          {/* Brand Color */}
          <div className="space-y-2">
            <Label>Brand Color</Label>
            <fieldset className="space-y-4">
              <RadioGroup
                className="flex gap-1.5"
                value={formData.brandColor}
                onValueChange={(value) =>
                  handleInputChange("brandColor", value)
                }
              >
                <RadioGroupItem
                  value="blue"
                  aria-label="Blue"
                  className="size-6 border-blue-500 bg-blue-500 shadow-none data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                />
                <RadioGroupItem
                  value="indigo"
                  aria-label="Indigo"
                  className="size-6 border-indigo-500 bg-indigo-500 shadow-none data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
                />
                <RadioGroupItem
                  value="pink"
                  aria-label="Pink"
                  className="size-6 border-pink-500 bg-pink-500 shadow-none data-[state=checked]:border-pink-500 data-[state=checked]:bg-pink-500"
                />
                <RadioGroupItem
                  value="red"
                  aria-label="Red"
                  className="size-6 border-red-500 bg-red-500 shadow-none data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
                />
                <RadioGroupItem
                  value="orange"
                  aria-label="Orange"
                  className="size-6 border-orange-500 bg-orange-500 shadow-none data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
                />
                <RadioGroupItem
                  value="amber"
                  aria-label="Amber"
                  className="size-6 border-amber-500 bg-amber-500 shadow-none data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500"
                />
                <RadioGroupItem
                  value="emerald"
                  aria-label="Emerald"
                  className="size-6 border-emerald-500 bg-emerald-500 shadow-none data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                />
              </RadioGroup>
            </fieldset>
            <p className="text-xs text-gray-500">
              Choose your primary brand color
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            variant={"outline"}
            disabled={
              isLoading ||
              !businessNameValidation.isValid ||
              !descriptionValidation.isValid
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
