"use client";

import * as React from "react";
import EasyCropper, { type Area, type Point } from "react-easy-crop";

import { cn } from "@/lib/utils";

interface CropperProps {
  image: string;
  crop?: Point;
  zoom?: number;
  aspect?: number;
  cropShape?: "rect" | "round";
  showGrid?: boolean;
  onCropChange?: (crop: Point) => void;
  onZoomChange?: (zoom: number) => void;
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void;
  className?: string;
  children?: React.ReactNode;
}

interface CropperContextType {
  croppedAreaPixels: Area | null;
  setCroppedAreaPixels: (area: Area | null) => void;
}

const CropperContext = React.createContext<CropperContextType | null>(null);

const Cropper = React.forwardRef<HTMLDivElement, CropperProps>(
  (
    {
      image,
      crop = { x: 0, y: 0 },
      zoom = 1,
      aspect = 1,
      cropShape = "rect",
      showGrid = true,
      onCropChange,
      onZoomChange,
      onCropComplete,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [croppedAreaPixels, setCroppedAreaPixels] =
      React.useState<Area | null>(null);

    const handleCropComplete = React.useCallback(
      (croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
        onCropComplete?.(croppedArea, croppedAreaPixels);
      },
      [onCropComplete]
    );

    return (
      <CropperContext.Provider
        value={{ croppedAreaPixels, setCroppedAreaPixels }}
      >
        <div ref={ref} className={cn("relative", className)} {...props}>
          <EasyCropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={showGrid}
            onCropChange={onCropChange || (() => {})}
            onZoomChange={onZoomChange || (() => {})}
            onCropComplete={handleCropComplete}
          />
          {children}
        </div>
      </CropperContext.Provider>
    );
  }
);
Cropper.displayName = "Cropper";

const CropperImage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("cropper-image", className)} {...props} />
));
CropperImage.displayName = "CropperImage";

const CropperCropArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("cropper-crop-area", className)} {...props} />
));
CropperCropArea.displayName = "CropperCropArea";

const CropperDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("cropper-description sr-only", className)}
    {...props}
  >
    Use the mouse wheel or pinch gesture to zoom. Drag to reposition the crop
    area.
  </div>
));
CropperDescription.displayName = "CropperDescription";

const useCropper = () => {
  const context = React.useContext(CropperContext);
  if (!context) {
    throw new Error("useCropper must be used within a Cropper component");
  }
  return context;
};

export {
  Cropper,
  CropperImage,
  CropperCropArea,
  CropperDescription,
  useCropper,
  type Area,
  type Point,
};
