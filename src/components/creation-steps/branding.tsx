"use client";

import {
  CircleUserRoundIcon,
  XIcon,
  AlertCircleIcon,
  ImageUpIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useId, useEffect } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { useFileUpload } from "@/hooks/use-file-upload";

const Branding = ({
  brandColor,
  businessLogo,
  bannerImage,
  onFormDataChange,
}: {
  brandColor: string;
  businessLogo: any;
  bannerImage: any;
  onFormDataChange: (field: string, value: string | any) => void;
}) => {
  // UploadThing hooks
  const { startUpload: startLogoUpload, isUploading: isLogoUploading } =
    useUploadThing("businessLogo", {
      onClientUploadComplete: (res) => {
        if (res && res[0]) {
          onFormDataChange("businessLogo", res[0].url);
        }
      },
      onUploadError: (error) => {
        console.error("Logo upload error:", error);
      },
    });

  const { startUpload: startBannerUpload, isUploading: isBannerUploading } =
    useUploadThing("businessBanner", {
      onClientUploadComplete: (res) => {
        if (res && res[0]) {
          onFormDataChange("bannerImage", res[0].url);
        }
      },
      onUploadError: (error) => {
        console.error("Banner upload error:", error);
      },
    });

  // Business Logo Upload
  const [
    { files: logoFiles },
    {
      removeFile: removeLogo,
      openFileDialog: openLogoDialog,
      getInputProps: getLogoInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
  });

  // Banner Image Upload
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024;
  const [
    { files: bannerFiles, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog: openBannerDialog,
      removeFile: removeBanner,
      getInputProps: getBannerInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
  });

  const logoPreviewUrl = logoFiles[0]?.preview || null;
  const logoFileName = logoFiles[0]?.name || null;
  const bannerPreviewUrl = bannerFiles[0]?.preview || null;

  const handleBrandColorChange = (value: string) => {
    onFormDataChange("brandColor", value);
  };

  const handleLogoChange = async (files: any) => {
    if (files && files.length > 0) {
      await startLogoUpload(files);
    }
  };

  const handleBannerChange = async (files: any) => {
    if (files && files.length > 0) {
      await startBannerUpload(files);
    }
  };

  // Trigger upload when files are selected
  useEffect(() => {
    if (logoFiles.length > 0) {
      handleLogoChange(logoFiles);
    }
  }, [logoFiles]);

  useEffect(() => {
    if (bannerFiles.length > 0) {
      handleBannerChange(bannerFiles);
    }
  }, [bannerFiles]);

  return (
    <div className="space-y-6">
      {/* Brand Color */}
      <fieldset className="space-y-4">
        <legend className="text-foreground text-sm leading-none font-medium">
          Choose a brand color
        </legend>
        <RadioGroup
          className="flex gap-1.5"
          value={brandColor || "blue"}
          onValueChange={handleBrandColorChange}
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

      {/* Business Logo */}
      <div className="space-y-4">
        <Label className="text-foreground text-sm leading-none font-medium">
          Business Logo
        </Label>
        <div className="flex flex-col items-start gap-2">
          <div className="relative inline-flex">
            <Button
              variant="outline"
              className="relative size-16 overflow-hidden p-0 shadow-none"
              onClick={openLogoDialog}
              disabled={isLogoUploading}
              aria-label={logoPreviewUrl ? "Change logo" : "Upload logo"}
            >
              {logoPreviewUrl ? (
                <img
                  className="size-full object-cover"
                  src={logoPreviewUrl}
                  alt="Preview of uploaded logo"
                  width={64}
                  height={64}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div aria-hidden="true">
                  <CircleUserRoundIcon className="size-4 opacity-60" />
                </div>
              )}
              {isLogoUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              )}
            </Button>
            {logoPreviewUrl && !isLogoUploading && (
              <Button
                onClick={() => {
                  removeLogo(logoFiles[0]?.id);
                  onFormDataChange("businessLogo", null);
                }}
                size="icon"
                className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                aria-label="Remove logo"
              >
                <XIcon className="size-3.5" />
              </Button>
            )}
            <input
              {...getLogoInputProps()}
              className="sr-only"
              aria-label="Upload logo file"
              tabIndex={-1}
            />
          </div>
          {logoFileName && (
            <p className="text-muted-foreground text-xs">{logoFileName}</p>
          )}
        </div>
      </div>

      {/* Banner Image */}
      <div className="space-y-4">
        <Label className="text-foreground text-sm leading-none font-medium">
          Banner Image
        </Label>
        <div className="flex flex-col gap-2">
          <div className="relative">
            <div
              role="button"
              onClick={openBannerDialog}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              data-dragging={isDragging || undefined}
              className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:ring-[3px]"
            >
              <input
                {...getBannerInputProps()}
                className="sr-only"
                aria-label="Upload banner file"
              />
              {bannerPreviewUrl ? (
                <div className="absolute inset-0">
                  <img
                    src={bannerPreviewUrl}
                    alt={bannerFiles[0]?.name || "Uploaded banner"}
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                  <div
                    className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                    aria-hidden="true"
                  >
                    <ImageUpIcon className="size-4 opacity-60" />
                  </div>
                  <p className="mb-1.5 text-sm font-medium">
                    Drop your banner image here or click to browse
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Max size: {maxSizeMB}MB
                  </p>
                </div>
              )}
              {isBannerUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            {bannerPreviewUrl && !isBannerUploading && (
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                  onClick={() => {
                    removeBanner(bannerFiles[0]?.id);
                    onFormDataChange("bannerImage", null);
                  }}
                  aria-label="Remove banner"
                >
                  <XIcon className="size-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <div
              className="text-destructive flex items-center gap-1 text-xs"
              role="alert"
            >
              <AlertCircleIcon className="size-3 shrink-0" />
              <span>{errors[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Branding;
