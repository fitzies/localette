"use client";

import { useId, useState } from "react";
import { CircleAlertIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Business, Order, Product } from "@prisma/client";

type BusinessWithRelations = Business & {
  products: Product[];
  orders: Order[];
};

export default function DeleteMyBusiness({
  business,
}: {
  business: BusinessWithRelations | null;
}) {
  const id = useId();
  const [inputValue, setInputValue] = useState("");

  if (!business) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Delete my Business</CardTitle>
          <CardDescription>Business not found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete my Business</CardTitle>
        <CardDescription>
          Remove your business profile and data permanently from the app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete project</Button>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <CircleAlertIcon className="opacity-80" size={16} />
              </div>
              <DialogHeader>
                <DialogTitle className="sm:text-center">
                  Final confirmation
                </DialogTitle>
                <DialogDescription className="sm:text-center">
                  This action cannot be undone. To confirm, please enter the
                  project name{" "}
                  <span className="text-foreground">{business.name}</span>.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form className="space-y-5">
              <div className="*:not-first:mt-2">
                <Label htmlFor={id}>Project name</Label>
                <Input
                  id={id}
                  type="text"
                  placeholder={`Type ${business.name} to confirm`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={inputValue !== business.name}
                >
                  Delete
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
