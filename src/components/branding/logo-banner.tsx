"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageIcon, AlertCircleIcon, XIcon, Upload } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useState } from "react";
import { toast } from "sonner";
import { updateBusiness } from "@/lib/functions";

interface LogoBannerProps {
  businessId: string;
  logo?: string | null;
  banner?: string | null;
}

export function LogoBanner({ businessId, logo, banner }: LogoBannerProps) {
  const [currentLogo, setCurrentLogo] = useState(logo);
  const [currentBanner, setCurrentBanner] = useState(banner);

  // UploadThing hooks for logo and banner
  const { startUpload: startLogoUpload, isUploading: isLogoUploading } =
    useUploadThing("businessLogo", {
      onClientUploadComplete: async (res) => {
        if (res && res[0]) {
          const logoUrl = res[0].url;
          setCurrentLogo(logoUrl);

          // Update business in database
          try {
            await updateBusiness(businessId, { logo: logoUrl });
            toast.success("Logo uploaded and saved successfully!");
          } catch (error) {
            console.error("Failed to update logo in database:", error);
            toast.error("Logo uploaded but failed to save. Please try again.");
          }
        }
      },
      onUploadError: (error) => {
        console.error("Logo upload error:", error);
        toast.error("Failed to upload logo. Please try again.");
      },
    });

  const { startUpload: startBannerUpload, isUploading: isBannerUploading } =
    useUploadThing("businessBanner", {
      onClientUploadComplete: async (res) => {
        if (res && res[0]) {
          const bannerUrl = res[0].url;
          setCurrentBanner(bannerUrl);

          // Update business in database
          try {
            await updateBusiness(businessId, { banner: bannerUrl });
            toast.success("Banner uploaded and saved successfully!");
          } catch (error) {
            console.error("Failed to update banner in database:", error);
            toast.error(
              "Banner uploaded but failed to save. Please try again."
            );
          }
        }
      },
      onUploadError: (error) => {
        console.error("Banner upload error:", error);
        toast.error("Failed to upload banner. Please try again.");
      },
    });

  // Logo Upload
  const maxLogoSizeMB = 2;
  const maxLogoSize = maxLogoSizeMB * 1024 * 1024;
  const [
    { files: logoFiles, isDragging: isLogoDragging, errors: logoErrors },
    {
      handleDragEnter: handleLogoDragEnter,
      handleDragLeave: handleLogoDragLeave,
      handleDragOver: handleLogoDragOver,
      handleDrop: handleLogoDrop,
      openFileDialog: openLogoDialog,
      removeFile: removeLogo,
      getInputProps: getLogoInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize: maxLogoSize,
  });

  // Banner Upload
  const maxBannerSizeMB = 5;
  const maxBannerSize = maxBannerSizeMB * 1024 * 1024;
  const [
    { files: bannerFiles, isDragging: isBannerDragging, errors: bannerErrors },
    {
      handleDragEnter: handleBannerDragEnter,
      handleDragLeave: handleBannerDragLeave,
      handleDragOver: handleBannerDragOver,
      handleDrop: handleBannerDrop,
      openFileDialog: openBannerDialog,
      removeFile: removeBanner,
      getInputProps: getBannerInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize: maxBannerSize,
  });

  const logoPreviewUrl = logoFiles[0]?.preview || currentLogo;
  const bannerPreviewUrl = bannerFiles[0]?.preview || currentBanner;

  const handleLogoUpload = async () => {
    if (logoFiles.length > 0) {
      await startLogoUpload(logoFiles);
      // Clear the file after upload
      if (logoFiles[0]?.id) {
        removeLogo(logoFiles[0].id);
      }
    }
  };

  const handleBannerUpload = async () => {
    if (bannerFiles.length > 0) {
      await startBannerUpload(bannerFiles);
      // Clear the file after upload
      if (bannerFiles[0]?.id) {
        removeBanner(bannerFiles[0].id);
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (logoFiles.length > 0) {
      removeLogo(logoFiles[0]?.id);
    }
    setCurrentLogo(null);

    // Update business in database
    try {
      await updateBusiness(businessId, { logo: undefined });
      toast.success("Logo removed successfully!");
    } catch (error) {
      console.error("Failed to remove logo from database:", error);
      toast.error("Failed to remove logo. Please try again.");
    }
  };

  const handleRemoveBanner = async () => {
    if (bannerFiles.length > 0) {
      removeBanner(bannerFiles[0]?.id);
    }
    setCurrentBanner(null);

    // Update business in database
    try {
      await updateBusiness(businessId, { banner: undefined });
      toast.success("Banner removed successfully!");
    } catch (error) {
      console.error("Failed to remove banner from database:", error);
      toast.error("Failed to remove banner. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Logo and Banner
        </CardTitle>
        <CardDescription>
          Upload your business's primary logo and banner to be displayed across
          your pages and communications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Business Logo</Label>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <div
                  role="button"
                  onClick={openLogoDialog}
                  onDragEnter={handleLogoDragEnter}
                  onDragLeave={handleLogoDragLeave}
                  onDragOver={handleLogoDragOver}
                  onDrop={handleLogoDrop}
                  data-dragging={isLogoDragging || undefined}
                  className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-32 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:ring-[3px]"
                >
                  <input
                    {...getLogoInputProps()}
                    className="sr-only"
                    aria-label="Upload logo file"
                  />
                  {logoPreviewUrl ? (
                    <div className="absolute inset-0">
                      <img
                        src={logoPreviewUrl}
                        alt={logoFiles[0]?.name || "Business logo"}
                        className="size-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                      <div
                        className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                        aria-hidden="true"
                      >
                        <ImageIcon className="size-4 opacity-60" />
                      </div>
                      <p className="mb-1.5 text-sm font-medium">
                        Drop your logo here or click to browse
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Max size: {maxLogoSizeMB}MB
                      </p>
                    </div>
                  )}
                </div>
                {logoPreviewUrl && (
                  <div className="absolute top-4 right-4">
                    <button
                      type="button"
                      className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                      onClick={handleRemoveLogo}
                      aria-label="Remove logo"
                    >
                      <XIcon className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
                {isLogoUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {logoErrors.length > 0 && (
                <div
                  className="text-destructive flex items-center gap-1 text-xs"
                  role="alert"
                >
                  <AlertCircleIcon className="size-3 shrink-0" />
                  <span>{logoErrors[0]}</span>
                </div>
              )}

              {/* Upload Button for Logo */}
              {logoFiles.length > 0 && !currentLogo && !isLogoUploading && (
                <Button
                  onClick={handleLogoUpload}
                  size="sm"
                  className="w-full mt-2"
                >
                  <Upload className="size-4 mr-2" />
                  Upload Logo
                </Button>
              )}
            </div>
          </div>

          {/* Banner Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Banner Image</Label>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <div
                  role="button"
                  onClick={openBannerDialog}
                  onDragEnter={handleBannerDragEnter}
                  onDragLeave={handleBannerDragLeave}
                  onDragOver={handleBannerDragOver}
                  onDrop={handleBannerDrop}
                  data-dragging={isBannerDragging || undefined}
                  className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-32 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:ring-[3px]"
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
                        alt={bannerFiles[0]?.name || "Business banner"}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                      <div
                        className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                        aria-hidden="true"
                      >
                        <ImageIcon className="size-4 opacity-60" />
                      </div>
                      <p className="mb-1.5 text-sm font-medium">
                        Drop your banner here or click to browse
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Max size: {maxBannerSizeMB}MB
                      </p>
                    </div>
                  )}
                </div>
                {bannerPreviewUrl && (
                  <div className="absolute top-4 right-4">
                    <button
                      type="button"
                      className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                      onClick={handleRemoveBanner}
                      aria-label="Remove banner"
                    >
                      <XIcon className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
                {isBannerUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {bannerErrors.length > 0 && (
                <div
                  className="text-destructive flex items-center gap-1 text-xs"
                  role="alert"
                >
                  <AlertCircleIcon className="size-3 shrink-0" />
                  <span>{bannerErrors[0]}</span>
                </div>
              )}

              {/* Upload Button for Banner */}
              {bannerFiles.length > 0 &&
                !currentBanner &&
                !isBannerUploading && (
                  <Button
                    onClick={handleBannerUpload}
                    size="sm"
                    className="w-full mt-2"
                  >
                    <Upload className="size-4 mr-2" />
                    Upload Banner
                  </Button>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
