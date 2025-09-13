"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ContactInfo = ({
  email,
  phone,
  onFormDataChange,
}: {
  email: string;
  phone: string;
  onFormDataChange: (field: string, value: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2 w-2/3">
        <Label htmlFor="email">Business Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your business email"
          value={email}
          onChange={(e) => onFormDataChange("email", e.target.value)}
        />
      </div>

      <div className="space-y-2 w-2/3">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+65 9123 8123"
          value={phone}
          onChange={(e) => onFormDataChange("phone", e.target.value)}
        />
      </div>
    </div>
  );
};

export default ContactInfo;
