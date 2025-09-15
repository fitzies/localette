"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { EditIcon, TrashIcon } from "lucide-react";
import { Category } from "@prisma/client";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export default function CategoryCard({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(category.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group relative">
      <CardHeader className="text-center pb-4">
        <div className="text-4xl mb-2">{category.icon}</div>
        <CardTitle className="text-xl">{category.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center text-sm">
          {category.description}
        </p>
      </CardContent>

      {/* Edit/Delete Actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                disabled={isDeleting}
                className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive hover:text-destructive"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="!fixed !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{category.name}"? This action
                  cannot be undone. Any products in this category will become
                  uncategorized.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
