"use client";

import { useId, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Hand } from "lucide-react";

const Availability = ({
  availability,
  pickupAvailable,
  dineInAvailable,
  onFormDataChange,
}: {
  availability: any;
  pickupAvailable: boolean;
  dineInAvailable: boolean;
  onFormDataChange: (field: string, value: any) => void;
}) => {
  const id = useId();

  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    new Set() // No days selected by default
  );

  const [timeSlots, setTimeSlots] = useState<
    Record<string, { from: string; to: string }>
  >({});

  const items = [
    { value: "1", label: "Sunday" },
    { value: "2", label: "Monday" },
    { value: "3", label: "Tuesday" },
    { value: "4", label: "Wednesday" },
    { value: "5", label: "Thursday" },
    { value: "6", label: "Friday" },
    { value: "7", label: "Saturday" },
  ];

  const handleDayToggle = (dayValue: string, checked: boolean) => {
    const newSelectedDays = new Set(selectedDays);
    if (checked) {
      newSelectedDays.add(dayValue);
      // Set default time slots for new day
      setTimeSlots((prev) => ({
        ...prev,
        [dayValue]: { from: "09:00", to: "17:00" },
      }));
    } else {
      newSelectedDays.delete(dayValue);
      // Remove time slots for unselected day
      setTimeSlots((prev) => {
        const newSlots = { ...prev };
        delete newSlots[dayValue];
        return newSlots;
      });
    }
    setSelectedDays(newSelectedDays);

    // Update parent component
    const availabilityData = {
      days: Array.from(newSelectedDays),
      timeSlots: checked
        ? {
            ...timeSlots,
            [dayValue]: { from: "09:00", to: "17:00" },
          }
        : Object.fromEntries(
            Object.entries(timeSlots).filter(([key]) => key !== dayValue)
          ),
    };
    onFormDataChange("availability", availabilityData);
  };

  const handleTimeChange = (
    dayValue: string,
    timeType: "from" | "to",
    time: string
  ) => {
    const newTimeSlots = {
      ...timeSlots,
      [dayValue]: {
        ...timeSlots[dayValue],
        [timeType]: time,
      },
    };
    setTimeSlots(newTimeSlots);

    // Update parent component
    const availabilityData = {
      days: Array.from(selectedDays),
      timeSlots: newTimeSlots,
    };
    onFormDataChange("availability", availabilityData);
  };

  return (
    <div className="space-y-6">
      {/* Delivery Methods */}
      <div className="space-y-4">
        <Label className="text-foreground text-sm leading-none font-medium">
          Delivery Methods
        </Label>
        <div className="grid gap-3">
          {/* Pickup Option */}
          <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
            <Checkbox
              id={`${id}-pickup`}
              className="order-1 after:absolute after:inset-0"
              checked={pickupAvailable}
              onCheckedChange={(checked) =>
                onFormDataChange("pickupAvailable", checked)
              }
              aria-describedby={`${id}-pickup-description`}
            />
            <div className="flex grow items-center gap-3">
              <div className="grid gap-2">
                <Label htmlFor={`${id}-pickup`}>
                  Pickup{" "}
                  <span className="text-muted-foreground text-xs leading-[inherit] font-normal">
                    (Self-collection)
                  </span>
                </Label>
                <p
                  id={`${id}-pickup-description`}
                  className="text-muted-foreground text-xs"
                >
                  Customers can pick up their orders from your location.
                </p>
              </div>
            </div>
          </div>

          {/* Dine-in Option */}
          <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
            <Checkbox
              id={`${id}-dinein`}
              className="order-1 after:absolute after:inset-0"
              checked={dineInAvailable}
              onCheckedChange={(checked) =>
                onFormDataChange("dineInAvailable", checked)
              }
              aria-describedby={`${id}-dinein-description`}
            />
            <div className="flex grow items-center gap-3">
              <div className="grid gap-2">
                <Label htmlFor={`${id}-dinein`}>
                  Dine-in{" "}
                  <span className="text-muted-foreground text-xs leading-[inherit] font-normal">
                    (Restaurant seating)
                  </span>
                </Label>
                <p
                  id={`${id}-dinein-description`}
                  className="text-muted-foreground text-xs"
                >
                  Customers can dine at your apartment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-foreground text-sm leading-none font-medium">
          Available Days
        </legend>
        <div className="flex gap-1.5">
          {items.map((item) => (
            <label
              key={`${id}-${item.value}`}
              className="border-input has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex size-9 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50"
            >
              <Checkbox
                id={`${id}-${item.value}`}
                value={item.value}
                className="sr-only after:absolute after:inset-0"
                onCheckedChange={(checked) =>
                  handleDayToggle(item.value, checked as boolean)
                }
              />
              <span aria-hidden="true" className="text-sm font-medium">
                {item.label[0]}
              </span>
              <span className="sr-only">{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {selectedDays.size > 0 && (
        <div className="space-y-4">
          <Label className="text-foreground text-sm leading-none font-medium">
            Working Hours
          </Label>
          <div className="space-y-3">
            {items
              .filter((item) => selectedDays.has(item.value))
              .map((item) => (
                <div
                  key={`time-${item.value}`}
                  className="flex items-center gap-4"
                >
                  <div className="w-20 text-sm font-medium">{item.label}</div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={timeSlots[item.value]?.from || "09:00"}
                      onChange={(e) =>
                        handleTimeChange(item.value, "from", e.target.value)
                      }
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={timeSlots[item.value]?.to || "17:00"}
                      onChange={(e) =>
                        handleTimeChange(item.value, "to", e.target.value)
                      }
                      className="w-32"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;
