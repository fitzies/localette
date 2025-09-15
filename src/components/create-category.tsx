"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions";
import { validateCategoryName, validateCategoryDescription } from "@/lib/utils";
import { useCharacterLimit } from "@/hooks/use-character-limit";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Category } from "@prisma/client";
import CategoryCard from "./category-card";

// Popular emojis for categories
const CATEGORY_EMOJIS = [
  "🍇",
  "🍈",
  "🍉",
  "🍊",
  "🍋",
  "🍌",
  "🍍",
  "🥭",
  "🍎",
  "🍏",
  "🍐",
  "🍑",
  "🍒",
  "🍓",
  "🫐",
  "🥝",
  "🍅",
  "🍆",
  "🥑",
  "🥦",
  "🥬",
  "🥒",
  "🌶️",
  "🫑",
  "🌽",
  "🥕",
  "🫒",
  "🧄",
  "🧅",
  "🥔",
  "🍠",
  "🥐",
  "🥯",
  "🍞",
  "🥖",
  "🫓",
  "🥨",
  "🥞",
  "🧇",
  "🧀",
  "🍖",
  "🍗",
  "🥩",
  "🥓",
  "🍔",
  "🍟",
  "🍕",
  "🌭",
  "🥪",
  "🌮",
  "🌯",
  "🫔",
  "🥙",
  "🧆",
  "🥚",
  "🍳",
  "🥘",
  "🍲",
  "🫕",
  "🥣",
  "🥗",
  "🍿",
  "🧈",
  "🧂",
  "🥫",
  "🍱",
  "🍘",
  "🍙",
  "🍚",
  "🍛",
  "🍜",
  "🍝",
  "🍢",
  "🍣",
  "🍤",
  "🍥",
  "🥮",
  "🍡",
  "🥟",
  "🥠",
  "🥡",
  "🦪",
  "🍦",
  "🍧",
  "🍨",
  "🍩",
  "🍪",
  "🎂",
  "🍰",
  "🧁",
  "🥧",
  "🍫",
  "🍬",
  "🍭",
  "🍮",
  "🍯",
  "🍼",
  "🥛",
  "☕",
  "🫖",
  "🍵",
  "🍶",
  "🍾",
  "🍷",
  "🍸",
  "🍹",
  "🍺",
  "🍻",
  "🥂",
  "🥃",
  "🫗",
  "🥤",
  "🧋",
  "🧃",
  "🧉",
  "🧊",
];

interface CreateCategoryProps {
  categories: Category[];
  onCategoryChange?: () => void;
}

export default function CreateCategory({
  categories,
  onCategoryChange,
}: CreateCategoryProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("🍕");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const params = useParams();
  const businessId = params.shop as string;

  // Character limits
  const nameCharacterLimit = useCharacterLimit({ maxLength: 50 });
  const descriptionCharacterLimit = useCharacterLimit({ maxLength: 200 });

  const isEditMode = !!editingCategory;

  // Check if form is valid for submission
  const isFormValid =
    nameCharacterLimit.characterCount >= 3 &&
    nameCharacterLimit.characterCount <= 50 &&
    (descriptionCharacterLimit.characterCount === 0 ||
      (descriptionCharacterLimit.characterCount >= 10 &&
        descriptionCharacterLimit.characterCount <= 200));

  // Check if we can submit (form valid + not loading)
  const canSubmit = isFormValid && !loading;

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    try {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;

      // Validate category name
      const nameValidation = validateCategoryName(name);
      if (!nameValidation.isValid) {
        toast.error(nameValidation.message!);
        return;
      }

      // Validate category description (optional)
      const descriptionValidation = validateCategoryDescription(description);
      if (!descriptionValidation.isValid) {
        toast.error(descriptionValidation.message!);
        return;
      }

      if (isEditMode && editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          icon: selectedEmoji,
          description: description.trim() || undefined,
        });
        toast.success("Category updated successfully! 🎉");
      } else {
        // Create new category
        await createCategory({
          name: name.trim(),
          icon: selectedEmoji,
          description: description.trim() || undefined,
          businessId,
        });
        toast.success("Category created successfully! 🎉");
      }

      setOpen(false);
      setEditingCategory(null);
      setSelectedEmoji("🍕");
      onCategoryChange?.();
      // Refresh the page to show updated categories
      window.location.reload();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} category:`,
        error
      );
      toast.error(
        `Failed to ${
          isEditMode ? "update" : "create"
        } category. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setSelectedEmoji(category.icon);
    nameCharacterLimit.setValue(category.name);
    descriptionCharacterLimit.setValue(category.description || "");
    setOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast.success("Category deleted successfully!");
      onCategoryChange?.();
      // Refresh the page to show updated categories
      window.location.reload();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setEditingCategory(null);
      setSelectedEmoji("🍕");
      nameCharacterLimit.setValue("");
      descriptionCharacterLimit.setValue("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Create Category Button */}
      <div className="w-full flex items-center justify-end">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline">Create Category</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] !fixed !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Category" : "Create New Category"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update the category details below."
                  : "Add a new category to organize your products. Choose an emoji icon and provide details."}
              </DialogDescription>
            </DialogHeader>

            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    className="peer pe-14"
                    placeholder="e.g., Appetizers, Main Course, Desserts"
                    defaultValue={editingCategory?.name || ""}
                    maxLength={nameCharacterLimit.maxLength}
                    onChange={(e) => {
                      nameCharacterLimit.handleChange(e);
                    }}
                    required
                    aria-describedby="name-description"
                  />
                  <div
                    id="name-description"
                    className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums peer-disabled:opacity-50"
                    aria-live="polite"
                    role="status"
                  >
                    {nameCharacterLimit.characterCount}/
                    {nameCharacterLimit.maxLength}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-10 gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                  {CATEGORY_EMOJIS.map((emoji) => (
                    <Button
                      variant={"ghost"}
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-2xl p-2 rounded hover:bg-muted transition-colors ${
                        selectedEmoji === emoji
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedEmoji}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    name="description"
                    className="min-h-[80px] resize-none peer pe-14"
                    placeholder="Brief description of this category..."
                    defaultValue={editingCategory?.description || ""}
                    maxLength={descriptionCharacterLimit.maxLength}
                    onChange={(e) => {
                      descriptionCharacterLimit.handleChange(e);
                    }}
                    rows={3}
                    aria-describedby="description-description"
                  />
                  <div
                    id="description-description"
                    className="text-muted-foreground pointer-events-none absolute top-2 end-0 flex items-center justify-center pe-3 text-xs tabular-nums peer-disabled:opacity-50"
                    aria-live="polite"
                    role="status"
                  >
                    {descriptionCharacterLimit.characterCount}/
                    {descriptionCharacterLimit.maxLength}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={!canSubmit}>
                  {loading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                    ? "Update Category"
                    : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-5 gap-4 px-4">
        {categories.length <= 0 ? (
          <div className="col-span-5 text-center py-8 text-muted-foreground">
            No categories yet. Create your first category to get started!
          </div>
        ) : (
          categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
