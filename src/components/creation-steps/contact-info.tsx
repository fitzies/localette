"use client";

import React, { useId } from "react";
import { ChevronDownIcon, MailIcon, PhoneIcon } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { cn, validateEmail, validatePhone } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ContactInfo = ({
  email,
  phone,
  onFormDataChange,
}: {
  email: string;
  phone: string;
  onFormDataChange: (field: string, value: string) => void;
}) => {
  const emailId = useId();
  const phoneId = useId();

  // Validation states
  const emailValidation = validateEmail(email);
  const phoneValidation = validatePhone(phone);

  return (
    <div className="space-y-4">
      <div className="space-y-2 w-2/3">
        <Label htmlFor={emailId}>Business Email</Label>
        <div className="relative">
          <Input
            id={emailId}
            className={`peer pe-9 ${
              !emailValidation.isValid && email ? "border-red-500" : ""
            }`}
            type="email"
            placeholder="Enter your business email"
            value={email}
            onChange={(e) => onFormDataChange("email", e.target.value)}
            aria-invalid={!emailValidation.isValid && email ? "true" : "false"}
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
            <MailIcon size={16} aria-hidden="true" />
          </div>
        </div>
        {!emailValidation.isValid && email && (
          <p
            className="text-destructive mt-2 text-xs"
            role="alert"
            aria-live="polite"
          >
            {emailValidation.message}
          </p>
        )}
      </div>

      <div className="space-y-2 w-2/3" dir="ltr">
        <Label htmlFor={phoneId}>Phone Number</Label>
        <RPNInput.default
          className="flex rounded-md shadow-xs"
          international
          countries={["SG", "MY"]}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={PhoneInput}
          id={phoneId}
          placeholder="Enter phone number"
          value={phone}
          onChange={(value) => onFormDataChange("phone", value ?? "")}
        />
        {!phoneValidation.isValid && phone && (
          <p
            className="text-destructive mt-2 text-xs"
            role="alert"
            aria-live="polite"
          >
            {phoneValidation.message}
          </p>
        )}
      </div>
    </div>
  );
};

const PhoneInput = ({ className, ...props }: React.ComponentProps<"input">) => {
  const phoneValidation = validatePhone((props.value as string) || "");

  return (
    <Input
      data-slot="phone-input"
      className={cn(
        "-ms-px rounded-s-none shadow-none focus-visible:z-10",
        !phoneValidation.isValid && props.value ? "border-red-500" : "",
        className
      )}
      aria-invalid={!phoneValidation.isValid && props.value ? "true" : "false"}
      {...props}
    />
  );
};

PhoneInput.displayName = "PhoneInput";

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: { label: string; value: RPNInput.Country | undefined }[];
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as RPNInput.Country);
  };

  return (
    <div className="border-input bg-background text-muted-foreground focus-within:border-ring focus-within:ring-ring/50 hover:bg-accent hover:text-foreground has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 relative inline-flex items-center self-stretch rounded-s-md border py-2 ps-3 pe-2 transition-[color,box-shadow] outline-none focus-within:z-10 focus-within:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50">
      <div className="inline-flex items-center gap-1" aria-hidden="true">
        <FlagComponent country={value} countryName={value} aria-hidden="true" />
        <span className="text-muted-foreground/80">
          <ChevronDownIcon size={16} aria-hidden="true" />
        </span>
      </div>
      <select
        disabled={disabled}
        value={value}
        onChange={handleSelect}
        className="absolute inset-0 text-sm opacity-0"
        aria-label="Select country"
      >
        <option key="default" value="">
          Select a country
        </option>
        {options
          .filter((x) => x.value)
          .map((option, i) => (
            <option key={option.value ?? `empty-${i}`} value={option.value}>
              {option.label}{" "}
              {option.value &&
                `+${RPNInput.getCountryCallingCode(option.value)}`}
            </option>
          ))}
      </select>
    </div>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="w-5 overflow-hidden rounded-sm">
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <PhoneIcon size={16} aria-hidden="true" />
      )}
    </span>
  );
};

export default ContactInfo;
