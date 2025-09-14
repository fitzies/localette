"use client";

import { useState, useCallback } from "react";
import { PlusIcon, XIcon, GripVerticalIcon, TrashIcon } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Types matching your Prisma schema
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

interface ProductOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: ProductOption[];
  onOptionsChange: (options: ProductOption[]) => void;
}

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const createNewOption = (position: number): ProductOption => ({
  id: generateId(),
  title: "",
  type: "TEXT",
  position,
  choices: [],
});

const createNewChoice = (): OptionChoice => ({
  id: generateId(),
  label: "",
  value: "",
  price: 0,
});

// Sortable Option Item Component
interface SortableOptionItemProps {
  option: ProductOption;
  onUpdate: (updatedOption: ProductOption) => void;
  onDelete: () => void;
}

function SortableOptionItem({
  option,
  onUpdate,
  onDelete,
}: SortableOptionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTitleChange = (title: string) => {
    onUpdate({ ...option, title });
  };

  const handleTypeChange = (type: OptionType) => {
    onUpdate({ ...option, type, choices: [] });
  };

  const handleChoiceUpdate = (index: number, updatedChoice: OptionChoice) => {
    const newChoices = [...option.choices];
    newChoices[index] = updatedChoice;
    onUpdate({ ...option, choices: newChoices });
  };

  const handleAddChoice = () => {
    const newChoice = createNewChoice();
    onUpdate({ ...option, choices: [...option.choices, newChoice] });
  };

  const handleDeleteChoice = (index: number) => {
    const newChoices = option.choices.filter((_, i) => i !== index);
    onUpdate({ ...option, choices: newChoices });
  };

  const needsChoices =
    option.type === "CHECKBOX" || option.type === "SELECTION";

  return (
    <Card ref={setNodeRef} style={style} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="size-4 text-muted-foreground" />
          </Button>

          <div className="flex-1 grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`title-${option.id}`} className="text-xs">
                Option Title
              </Label>
              <Input
                id={`title-${option.id}`}
                placeholder="e.g. Size, Color, Quantity"
                value={option.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`type-${option.id}`} className="text-xs">
                Option Type
              </Label>
              <Select value={option.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Text Input</SelectItem>
                  <SelectItem value="NUMBER">Number Input</SelectItem>
                  <SelectItem value="DATE">Date Picker</SelectItem>
                  <SelectItem value="CHECKBOX">Checkboxes</SelectItem>
                  <SelectItem value="SELECTION">Dropdown Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-1 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      </CardHeader>

      {needsChoices && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Choices</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddChoice}
                className="h-7 px-2 text-xs"
              >
                <PlusIcon className="size-3 mr-1" />
                Add Choice
              </Button>
            </div>

            {option.choices.map((choice, index) => (
              <div key={choice.id} className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Label (e.g. Small)"
                    value={choice.label}
                    onChange={(e) =>
                      handleChoiceUpdate(index, {
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
                      handleChoiceUpdate(index, {
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
                        handleChoiceUpdate(index, {
                          ...choice,
                          price: parseFloat(e.target.value) || 0,
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
                  onClick={() => handleDeleteChoice(index)}
                  className="p-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <XIcon className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function ProductOptionsDialog({
  open,
  onOpenChange,
  options,
  onOptionsChange,
}: ProductOptionsDialogProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = options.findIndex((option) => option.id === active.id);
        const newIndex = options.findIndex((option) => option.id === over.id);

        const reorderedOptions = arrayMove(options, oldIndex, newIndex).map(
          (option, index) => ({ ...option, position: index })
        );

        onOptionsChange(reorderedOptions);
      }
    },
    [options, onOptionsChange]
  );

  const handleAddOption = () => {
    if (options.length >= 3) return;

    const newOption = createNewOption(options.length);
    onOptionsChange([...options, newOption]);
  };

  const handleUpdateOption = (index: number, updatedOption: ProductOption) => {
    const newOptions = [...options];
    newOptions[index] = updatedOption;
    onOptionsChange(newOptions);
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    const reindexedOptions = newOptions.map((option, i) => ({
      ...option,
      position: i,
    }));
    onOptionsChange(reindexedOptions);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-[150] !fixed !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <DialogTitle>Product Options</DialogTitle>
          <DialogDescription>
            Add up to 3 options for your product. Options can be text inputs,
            selections, checkboxes, or other types.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {options.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No options added yet</p>
              <Button onClick={handleAddOption} variant="outline">
                <PlusIcon className="size-4 mr-2" />
                Add Your First Option
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={options.map((o) => o.id)}
                strategy={verticalListSortingStrategy}
              >
                {options.map((option, index) => (
                  <SortableOptionItem
                    key={option.id}
                    option={option}
                    onUpdate={(updatedOption) =>
                      handleUpdateOption(index, updatedOption)
                    }
                    onDelete={() => handleDeleteOption(index)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {options.length > 0 && options.length < 3 && (
            <Button
              onClick={handleAddOption}
              variant="outline"
              className="w-full"
            >
              <PlusIcon className="size-4 mr-2" />
              Add Another Option ({options.length}/3)
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Save Options
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
