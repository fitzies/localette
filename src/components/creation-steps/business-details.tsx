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

const BusinessDetails = ({
  businessName,
  description,
  onFormDataChange,
}: {
  businessName: string;
  description: string;
  onFormDataChange: (field: string, value: string) => void;
}) => {
  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = (files: File[]) => {
    console.log(files);
    setFiles(files);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 w-2/3">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          type="text"
          placeholder="Enter your business name"
          value={businessName}
          onChange={(e) => onFormDataChange("businessName", e.target.value)}
        />
      </div>

      <div className="space-y-2 ">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your business"
          value={description}
          onChange={(e) => onFormDataChange("description", e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
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
      </div>
    </div>
  );
};

export default BusinessDetails;
