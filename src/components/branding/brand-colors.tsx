"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette } from "lucide-react";
import { useState } from "react";

interface BrandColorsProps {
  businessId: string;
  brandColor?: string | null;
}

export function BrandColors({ businessId, brandColor }: BrandColorsProps) {
  const [currentBrandColor, setCurrentBrandColor] = useState(
    brandColor || "blue"
  );

  const handleColorChange = (value: string) => {
    setCurrentBrandColor(value);
  };

  const handleSave = () => {
    // TODO: Implement save brand color
    console.log(
      "Save brand color for business:",
      businessId,
      currentBrandColor
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Brand Color
        </CardTitle>
        <CardDescription>
          Choose your primary brand color to match your business identity across
          the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-foreground text-sm leading-none font-medium">
            Choose a color
          </legend>
          <RadioGroup
            className="flex gap-1.5"
            value={currentBrandColor}
            onValueChange={handleColorChange}
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

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>Update Brand Color</Button>
        </div>
      </CardContent>
    </Card>
  );
}
