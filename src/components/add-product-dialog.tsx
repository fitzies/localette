"use client";

import {
  useState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PlusIcon,
  XIcon,
  ImageUpIcon,
  ArrowLeftIcon,
  ZoomInIcon,
  ZoomOutIcon,
  GripVerticalIcon,
  TrashIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useCharacterLimit } from "@/hooks/use-character-limit";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProduct, updateProduct } from "@/lib/actions";
import {
  validateBusinessName,
  validateDescription,
  generateSKU,
} from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
  type Area,
} from "@/components/ui/cropper";
// Option types
export type OptionType = "TEXT" | "NUMBER" | "DATE" | "CHECKBOX" | "SELECTION";

export interface OptionChoice {
  id: string;
  label: string;
  value: string;
  price?: number;
}

export interface ProductOption {
  id: string;
  title: string;
  type: OptionType;
  position: number;
  choices: OptionChoice[];
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = {
  id: string;
  name: string;
  description: string | null;
};

interface AddProductDialogProps {
  businessId: string;
  categories?: Category[];
  onProductAdded?: () => void;
  product?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean;
    isVisible: boolean;
    weight: number | null;
    categoryId: string | null;
    options: Array<{
      id: string;
      title: string;
      type: string;
      position: number;
      productId: string;
      choices: Array<{
        id: string;
        label: string;
        value: string;
        price: number | null;
        optionId: string;
      }>;
    }>;
  };
}

const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .min(3, "Product name must be at least 3 characters long")
    .max(100, "Product name must be less than 100 characters"),
  description: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      return val.length >= 10 && val.length <= 500;
    }, "Description must be between 10-500 characters if provided"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Price must be a positive number"),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean(),
  isVisible: z.boolean(),
  weight: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, "Weight must be a positive number"),
  categoryId: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  } catch (error) {
    console.error("Error in getCroppedImg:", error);
    return null;
  }
}

export function AddProductDialog({
  businessId,
  categories = [],
  onProductAdded,
  product,
}: AddProductDialogProps) {
  const [open, setOpen] = useState(!!product); // Auto-open if product is provided (edit mode)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if we're in edit mode
  const isEditMode = !!product;

  // IDs for accessibility
  const nameId = useId();
  const priceId = useId();
  const weightId = useId();
  const descriptionId = useId();

  // Character limits
  const nameCharacterLimit = useCharacterLimit({ maxLength: 50 });
  const descriptionCharacterLimit = useCharacterLimit({ maxLength: 200 });

  // UploadThing hook for product images
  const { startUpload: startImageUpload, isUploading: isImageUploading } =
    useUploadThing("productImage", {
      onClientUploadComplete: (res) => {
        if (res && res[0]) {
          form.setValue("imageUrl", res[0].url);
        }
      },
      onUploadError: (error) => {
        console.error("Image upload error:", error);
        toast.error("Failed to upload image", {
          description: "Please try again or use a different image.",
        });
      },
    });

  // File upload hook for product images
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024;
  const [
    { files: imageFiles, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog: openImageDialog,
      removeFile: removeImage,
      getInputProps: getImageInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
  });

  const imagePreviewUrl = imageFiles[0]?.preview || null;
  const imageFileName = imageFiles[0]?.name || null;

  // Cropping state - initialize with existing image in edit mode
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(
    product?.imageUrl || null
  );
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);
  const previousFileIdRef = useRef<string | undefined | null>(null);

  // Convert existing product options to internal format
  const convertExistingOptions = (): ProductOption[] => {
    if (!product?.options) return [];

    return product.options.map((option) => ({
      id: option.id,
      title: option.title,
      type: option.type as OptionType,
      position: option.position,
      choices: option.choices.map((choice) => ({
        id: choice.id,
        label: choice.label,
        value: choice.value,
        price: choice.price || 0,
      })),
    }));
  };

  // Options state - initialize with existing options in edit mode
  const [productOptions, setProductOptions] = useState<ProductOption[]>(
    convertExistingOptions()
  );

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price ? product.price.toString() : "",
      imageUrl: product?.imageUrl || "",
      isAvailable: product?.isAvailable ?? true,
      isVisible: product?.isVisible ?? true,
      weight: product?.weight ? product.weight.toString() : "",
      categoryId: product?.categoryId || "uncategorized",
    },
  });

  // Watch form values for validation
  const watchedValues = form.watch();

  // Check if form is valid for submission
  const isFormValid = useMemo(() => {
    const { name, price } = watchedValues;
    // Required fields: name and price must be provided and valid
    return !!(name?.trim() && price && parseFloat(price) > 0);
  }, [watchedValues]);

  // Check if product options are valid
  const areOptionsValid = useMemo(() => {
    return productOptions.every((option) => {
      // For options that require choices (CHECKBOX and SELECTION)
      if (option.type === "CHECKBOX" || option.type === "SELECTION") {
        // Must have at least one choice and all choices must have valid label and value
        return (
          option.choices.length > 0 &&
          option.choices.every(
            (choice) => choice.label?.trim() && choice.value?.trim()
          )
        );
      }
      // For other option types, just check if title is provided
      return option.title?.trim();
    });
  }, [productOptions]);

  // Check if we can submit (form valid + options valid + not uploading + not already submitting)
  const canSubmit =
    isFormValid && areOptionsValid && !isImageUploading && !isSubmitting;

  // Callback for Cropper to provide crop data
  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // Handle applying the crop
  const handleApplyCrop = async () => {
    if (!imagePreviewUrl || !imageFiles[0]?.id || !croppedAreaPixels) {
      console.error("Missing data for apply:", {
        imagePreviewUrl,
        fileId: imageFiles[0]?.id,
        croppedAreaPixels,
      });
      if (imageFiles[0]?.id) {
        removeImage(imageFiles[0]?.id);
        setCroppedAreaPixels(null);
      }
      return;
    }

    try {
      const croppedBlob = await getCroppedImg(
        imagePreviewUrl,
        croppedAreaPixels
      );

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image blob.");
      }

      // Convert blob to file for upload
      const croppedFile = new File(
        [croppedBlob],
        imageFiles[0]?.name || "cropped-image.jpg",
        {
          type: "image/jpeg",
        }
      );

      // Upload the cropped image
      await startImageUpload([croppedFile]);

      // Create preview URL for display
      const newFinalUrl = URL.createObjectURL(croppedBlob);
      if (finalImageUrl) {
        URL.revokeObjectURL(finalImageUrl);
      }
      setFinalImageUrl(newFinalUrl);

      setIsCropDialogOpen(false);
    } catch (error) {
      console.error("Error during apply:", error);
      toast.error("Failed to crop image", {
        description: "Please try again.",
      });
      setIsCropDialogOpen(false);
    }
  };

  const handleRemoveFinalImage = () => {
    if (finalImageUrl) {
      URL.revokeObjectURL(finalImageUrl);
    }
    setFinalImageUrl(null);
    form.setValue("imageUrl", "");
    if (imageFiles[0]?.id) {
      removeImage(imageFiles[0]?.id);
    }
  };

  // Handle image upload when files are selected
  const handleImageChange = async (files: any) => {
    if (files && files.length > 0) {
      // Don't upload immediately, open crop dialog instead
      setIsCropDialogOpen(true);
      setCroppedAreaPixels(null);
      setZoom(1);
    }
  };

  // Option handlers
  const generateId = () => `temp-${Math.random().toString(36).substr(2, 9)}`;

  const createNewOption = (position: number): ProductOption => ({
    id: generateId(),
    title: "",
    type: "TEXT",
    position,
    choices: [],
  });

  const createNewChoice = () => ({
    id: generateId(),
    label: "",
    value: "",
    price: 0,
  });

  const handleAddOption = () => {
    if (productOptions.length >= 3) return;
    const newOption = createNewOption(productOptions.length);
    setProductOptions([...productOptions, newOption]);
  };

  const handleUpdateOption = (index: number, updatedOption: ProductOption) => {
    const newOptions = [...productOptions];
    newOptions[index] = updatedOption;
    setProductOptions(newOptions);
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = productOptions.filter((_, i) => i !== index);
    const reindexedOptions = newOptions.map((option, i) => ({
      ...option,
      position: i,
    }));
    setProductOptions(reindexedOptions);
  };

  const handleAddChoice = (optionIndex: number) => {
    const newChoice = createNewChoice();
    const newOptions = [...productOptions];
    newOptions[optionIndex].choices.push(newChoice);
    setProductOptions(newOptions);
  };

  const handleChoiceUpdate = (
    optionIndex: number,
    choiceIndex: number,
    updatedChoice: any
  ) => {
    const newOptions = [...productOptions];
    newOptions[optionIndex].choices[choiceIndex] = updatedChoice;
    setProductOptions(newOptions);
  };

  const handleDeleteChoice = (optionIndex: number, choiceIndex: number) => {
    const newOptions = [...productOptions];
    newOptions[optionIndex].choices = newOptions[optionIndex].choices.filter(
      (_, i) => i !== choiceIndex
    );
    setProductOptions(newOptions);
  };

  // Trigger crop dialog when files are selected
  useEffect(() => {
    if (imageFiles.length > 0) {
      handleImageChange(imageFiles);
    }
  }, [imageFiles]);

  // Cleanup effect for memory leaks
  useEffect(() => {
    const currentFinalUrl = finalImageUrl;
    return () => {
      if (currentFinalUrl && currentFinalUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentFinalUrl);
      }
    };
  }, [finalImageUrl]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && product) {
        // Update existing product
        const updateData = {
          name: data.name,
          description: data.description || null,
          price: parseFloat(data.price),
          weight: data.weight ? parseFloat(data.weight) : null,
          imageUrl: data.imageUrl || null,
          categoryId:
            data.categoryId === "uncategorized"
              ? null
              : data.categoryId || null,
          isAvailable: data.isAvailable,
          isVisible: data.isVisible,
          options:
            productOptions.length > 0
              ? productOptions.map((option) => ({
                  id: option.id.startsWith("temp-") ? undefined : option.id, // New options won't have real IDs
                  title: option.title,
                  type: option.type,
                  position: option.position,
                  choices: option.choices.map((choice) => ({
                    id: choice.id.startsWith("temp-") ? undefined : choice.id,
                    label: choice.label,
                    value: choice.value,
                    price: choice.price,
                  })),
                }))
              : [],
        };

        await updateProduct(product.id, updateData);

        toast.success("Product updated successfully!", {
          description: `${data.name} has been updated.`,
        });
      } else {
        // Create new product
        const generatedSKU = generateSKU(data.name);

        const productData = {
          ...data,
          businessId,
          price: parseFloat(data.price),
          weight: data.weight ? parseFloat(data.weight) : null,
          imageUrl: data.imageUrl || null,
          categoryId:
            data.categoryId === "uncategorized"
              ? null
              : data.categoryId || null,
          sku: generatedSKU,
          description: data.description || null,
          options:
            productOptions.length > 0
              ? productOptions.map((option) => ({
                  title: option.title,
                  type: option.type,
                  position: option.position,
                  choices: option.choices.map((choice) => ({
                    label: choice.label,
                    value: choice.value,
                    price: choice.price,
                  })),
                }))
              : undefined,
        };

        await createProduct(productData);

        toast.success("Product created successfully!", {
          description: `${data.name} has been added to your catalog.`,
        });
      }

      // Reset form and close dialog
      form.reset();
      nameCharacterLimit.setValue("");
      descriptionCharacterLimit.setValue("");
      // Clear uploaded files and crop state
      if (imageFiles.length > 0) {
        removeImage(imageFiles[0]?.id);
      }
      if (finalImageUrl && finalImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(finalImageUrl);
      }
      setFinalImageUrl(null);
      setCroppedAreaPixels(null);
      setZoom(1);
      setProductOptions([]);
      setOpen(false);
      onProductAdded?.();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} product:`,
        error
      );
      toast.error(`Failed to ${isEditMode ? "update" : "create"} product`, {
        description: "Please check your information and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && isEditMode) {
      // In edit mode, when dialog closes, trigger callback to clean up
      onProductAdded?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button variant="outline">
            <PlusIcon
              className="-ms-1 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Add product
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[80vh] min-w-2xl overflow-y-auto z-[100] !fixed !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 w-full max-w-[min(90vw,800px)]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the product details below."
              : "Create a new product for your business. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Product Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={nameId}>Product Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id={nameId}
                          className="peer pe-14"
                          type="text"
                          placeholder="Enter product name"
                          maxLength={nameCharacterLimit.maxLength}
                          onChange={(e) => {
                            nameCharacterLimit.handleChange(e);
                            field.onChange(e.target.value);
                          }}
                          value={field.value || ""}
                          aria-describedby={`${nameId}-description`}
                        />
                        <div
                          id={`${nameId}-description`}
                          className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums peer-disabled:opacity-50"
                          aria-live="polite"
                          role="status"
                        >
                          {nameCharacterLimit.characterCount}/
                          {nameCharacterLimit.maxLength}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="invisible">
                      Required field for product identification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value === "uncategorized" ? "" : value);
                      }}
                      defaultValue={field.value || "uncategorized"}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full min-w-[180px]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="uncategorized">
                          No Category
                        </SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="invisible">
                      Choose a category or leave uncategorized
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={descriptionId}>Description</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        id={descriptionId}
                        className="min-h-[80px] resize-none peer pe-14"
                        placeholder="Describe your product..."
                        maxLength={descriptionCharacterLimit.maxLength}
                        onChange={(e) => {
                          descriptionCharacterLimit.handleChange(e);
                          field.onChange(e.target.value);
                        }}
                        value={field.value || ""}
                        aria-describedby={`${descriptionId}-description`}
                      />
                      <div
                        id={`${descriptionId}-description`}
                        className="text-muted-foreground pointer-events-none absolute top-2 end-0 flex items-center justify-center pe-3 text-xs tabular-nums peer-disabled:opacity-50"
                        aria-live="polite"
                        role="status"
                      >
                        {descriptionCharacterLimit.characterCount}/
                        {descriptionCharacterLimit.maxLength}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={priceId}>Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id={priceId}
                          className="peer ps-6 pe-12"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                        />
                        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
                          $
                        </span>
                        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
                          SGD
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weight */}
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={weightId}>Weight</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id={weightId}
                          className="peer pe-12"
                          placeholder="0.000"
                          type="number"
                          step="0.001"
                          min="0"
                          {...field}
                        />
                        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
                          kg
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Product Image Upload - Full Width */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div
                        role="button"
                        onClick={openImageDialog}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        data-dragging={isDragging || undefined}
                        className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-32 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:ring-[3px]"
                      >
                        <input
                          {...getImageInputProps()}
                          className="sr-only"
                          aria-label="Upload product image"
                        />
                        {finalImageUrl ? (
                          <div className="absolute inset-0">
                            <img
                              src={finalImageUrl}
                              alt={
                                imageFiles[0]?.name || "Uploaded product image"
                              }
                              className="size-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                            <div
                              className="bg-background mb-2 flex size-8 shrink-0 items-center justify-center rounded-full border"
                              aria-hidden="true"
                            >
                              <ImageUpIcon className="size-4 opacity-60" />
                            </div>
                            <p className="mb-1 text-sm font-medium">
                              Drop image here or click to browse
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Max size: {maxSizeMB}MB
                            </p>
                          </div>
                        )}
                        {isImageUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                      {finalImageUrl && !isImageUploading && (
                        <div className="flex items-center justify-between">
                          <p className="text-muted-foreground text-xs">
                            {imageFileName}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFinalImage}
                            className="h-6 px-2 text-xs"
                          >
                            <XIcon className="size-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      )}
                      {errors.length > 0 && (
                        <div className="text-destructive flex items-center gap-1 text-xs">
                          <span>{errors[0]}</span>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="invisible">
                    Optional: Upload a product image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checkboxes */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="order-1 after:absolute after:inset-0"
                        />
                        <div className="grid grow gap-2">
                          <FormLabel className="text-sm font-medium">
                            Available for purchase
                          </FormLabel>
                          <p className="text-muted-foreground text-xs">
                            Customers can order this product
                          </p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isVisible"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="order-1 after:absolute after:inset-0"
                        />
                        <div className="grid grow gap-2">
                          <FormLabel className="text-sm font-medium">
                            Visible to customers
                          </FormLabel>
                          <p className="text-muted-foreground text-xs">
                            Show this product in your catalog
                          </p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Options Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Product Options</Label>
                  <p className="text-xs text-muted-foreground">
                    Add customizable options like size, color, or quantity
                  </p>
                </div>
                {productOptions.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                  >
                    <PlusIcon className="size-4 mr-2" />
                    Add Option ({productOptions.length}/3)
                  </Button>
                )}
              </div>

              {productOptions.length > 0 && (
                <div className="space-y-4">
                  {productOptions.map((option, index) => (
                    <Card key={option.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted"
                          >
                            <GripVerticalIcon className="size-4 text-muted-foreground" />
                          </Button>

                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <Label
                                htmlFor={`title-${option.id}`}
                                className="text-xs"
                              >
                                Option Title
                              </Label>
                              <Input
                                id={`title-${option.id}`}
                                placeholder="e.g. Size, Color, Quantity"
                                value={option.title}
                                onChange={(e) =>
                                  handleUpdateOption(index, {
                                    ...option,
                                    title: e.target.value,
                                  })
                                }
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label
                                htmlFor={`type-${option.id}`}
                                className="text-xs"
                              >
                                Option Type
                              </Label>
                              <Select
                                value={option.type}
                                onValueChange={(value) =>
                                  handleUpdateOption(index, {
                                    ...option,
                                    type: value as any,
                                    choices: [],
                                  })
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[150]">
                                  <SelectItem value="TEXT">
                                    Text Input
                                  </SelectItem>
                                  <SelectItem value="NUMBER">
                                    Number Input
                                  </SelectItem>
                                  <SelectItem value="DATE">
                                    Date Picker
                                  </SelectItem>
                                  <SelectItem value="CHECKBOX">
                                    Checkboxes
                                  </SelectItem>
                                  <SelectItem value="SELECTION">
                                    Dropdown Selection
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOption(index)}
                            className="p-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <TrashIcon className="size-4" />
                          </Button>
                        </div>

                        {(option.type === "CHECKBOX" ||
                          option.type === "SELECTION") && (
                          <div className="space-y-2 pl-8">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Choices</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddChoice(index)}
                                className="h-7 px-2 text-xs"
                              >
                                <PlusIcon className="size-3 mr-1" />
                                Add Choice
                              </Button>
                            </div>

                            {option.choices.map((choice, choiceIndex) => (
                              <div
                                key={choice.id}
                                className="flex items-center gap-2"
                              >
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <Input
                                    placeholder="Label (e.g. Small)"
                                    value={choice.label}
                                    onChange={(e) =>
                                      handleChoiceUpdate(index, choiceIndex, {
                                        ...choice,
                                        label: e.target.value,
                                        value: e.target.value
                                          .toLowerCase()
                                          .replace(/\s+/g, "-"),
                                      })
                                    }
                                    className="text-sm"
                                  />
                                  <Input
                                    placeholder="Value (e.g. sm)"
                                    value={choice.value}
                                    onChange={(e) =>
                                      handleChoiceUpdate(index, choiceIndex, {
                                        ...choice,
                                        value: e.target.value,
                                      })
                                    }
                                    className="text-sm"
                                  />
                                </div>

                                {option.type === "SELECTION" && (
                                  <div className="w-24">
                                    <Input
                                      type="number"
                                      placeholder="$0"
                                      step="0.01"
                                      min="0"
                                      value={choice.price || ""}
                                      onChange={(e) =>
                                        handleChoiceUpdate(index, choiceIndex, {
                                          ...choice,
                                          price:
                                            parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="text-sm"
                                    />
                                  </div>
                                )}

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteChoice(index, choiceIndex)
                                  }
                                  className="p-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <XIcon className="size-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isImageUploading
                  ? "Uploading image..."
                  : isEditMode
                  ? "Update Product"
                  : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Cropper Dialog */}
      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-[800px] *:[button]:hidden z-[100] !fixed !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2">
          <DialogDescription className="sr-only">
            Crop image dialog
          </DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-my-1 opacity-60"
                  onClick={() => setIsCropDialogOpen(false)}
                  aria-label="Cancel"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </Button>
                <span>Crop image</span>
              </div>
              <Button
                className="-my-1"
                onClick={handleApplyCrop}
                disabled={!imagePreviewUrl}
                autoFocus
              >
                Apply
              </Button>
            </DialogTitle>
          </DialogHeader>
          {imagePreviewUrl && (
            <Cropper
              className="h-96 sm:h-[500px]"
              image={imagePreviewUrl}
              zoom={zoom}
              onCropChange={() => {}} // Required by react-easy-crop
              onCropComplete={handleCropChange}
              onZoomChange={setZoom}
              aspect={1}
              cropShape="rect"
            >
              <CropperDescription />
              <CropperImage />
              <CropperCropArea />
            </Cropper>
          )}
          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              <ZoomOutIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
              <Slider
                defaultValue={[1]}
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0] || 1)}
                aria-label="Zoom slider"
              />
              <ZoomInIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
