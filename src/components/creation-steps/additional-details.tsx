"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AdditionalDetails = ({
  address,
  website,
  onFormDataChange,
}: {
  address: string;
  website: string;
  onFormDataChange: (field: string, value: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Business Address</Label>
        <Textarea
          id="address"
          placeholder="Enter your business address"
          value={address}
          onChange={(e) => onFormDataChange("address", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://your-website.com"
          value={website}
          onChange={(e) => onFormDataChange("website", e.target.value)}
        />
      </div>
    </div>
  );
};

export default AdditionalDetails;
