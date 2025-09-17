"use client";

import { useState, useEffect, useId, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PlusIcon,
  XIcon,
  ImageUpIcon,
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
import { Card } from "@/components/ui/card";
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

export function AddProductDialog({
  businessId,
  categories = [],
  onProductAdded,
  product,
}: AddProductDialogProps) {
  // Debug categories
  console.log("AddProductDialog categories:", categories);
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

  // Image state - initialize with existing image in edit mode
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(
    product?.imageUrl || null
  );

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
      try {
        // Upload the image directly
        const fileToUpload = files[0]?.file || files[0];
        await startImageUpload([fileToUpload]);

        // Set the preview URL for display
        const previewUrl =
          files[0]?.preview || URL.createObjectURL(fileToUpload);
        if (finalImageUrl && finalImageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(finalImageUrl);
        }
        setFinalImageUrl(previewUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image", {
          description: "Please try again.",
        });
      }
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

  // Trigger image upload when files are selected
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
      // Clear uploaded files and image state
      if (imageFiles.length > 0) {
        removeImage(imageFiles[0]?.id);
      }
      if (finalImageUrl && finalImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(finalImageUrl);
      }
      setFinalImageUrl(null);
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
                      <SelectContent className="z-[200]">
                        <SelectItem value="uncategorized">
                          No Category
                        </SelectItem>
                        {categories.map((category) => {
                          console.log("Rendering category:", category);
                          return (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          );
                        })}
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
                      <div className="relative">
                        <div
                          role="button"
                          onClick={openImageDialog}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          data-dragging={isDragging || undefined}
                          className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex aspect-square w-full max-w-sm mx-auto flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
                        >
                          <input
                            {...getImageInputProps()}
                            className="sr-only"
                            aria-label="Upload product image"
                          />
                          {finalImageUrl ? (
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                              <img
                                src={finalImageUrl}
                                alt={
                                  imageFiles[0]?.name ||
                                  "Uploaded product image"
                                }
                                className="mx-auto max-h-full max-w-full rounded object-contain"
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
                                Drop your image here
                              </p>
                              <p className="text-muted-foreground text-xs mb-4">
                                PNG, JPG or GIF (max. {maxSizeMB}MB)
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={openImageDialog}
                                className="pointer-events-auto"
                              >
                                <ImageUpIcon
                                  className="-ms-1 size-4 opacity-60"
                                  aria-hidden="true"
                                />
                                Select image
                              </Button>
                            </div>
                          )}
                          {isImageUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>

                        {finalImageUrl && !isImageUploading && (
                          <div className="absolute top-4 right-4">
                            <button
                              type="button"
                              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                              onClick={handleRemoveFinalImage}
                              aria-label="Remove image"
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
    </Dialog>
  );
}
