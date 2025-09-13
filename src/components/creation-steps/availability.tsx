"use client";

import { Button } from "@/components/ui/button";

const Availability = () => {
  const handleAvailabilitySetup = () => {
    // Placeholder for availability setup functionality
    console.log("Availability setup clicked");
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">Set Your Availability</h3>
        <p className="text-muted-foreground text-sm">
          Configure when your business is open and available for orders
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleAvailabilitySetup}
          className="w-full max-w-xs"
        >
          Configure Availability
        </Button>
      </div>
    </div>
  );
};

export default Availability;
