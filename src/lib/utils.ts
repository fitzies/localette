import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Validation functions
export function validateEmail(email: string): {
  isValid: boolean;
  message?: string;
} {
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  return { isValid: true };
}

export function validatePhone(phone: string): {
  isValid: boolean;
  message?: string;
} {
  if (!phone) {
    return { isValid: false, message: "Phone number is required" };
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");

  // Singapore phone numbers: +65 followed by 8 digits starting with 6, 8, or 9
  // When cleaned, +6598260978 becomes 6598260978 (10 digits total)
  const sgRegex = /^(65)?[689]\d{7}$/;

  // Malaysia phone numbers: +60 followed by 10-11 digits, or 10-11 digits starting with 1
  const myRegex = /^(\+60)?1\d{8,9}$/;

  if (sgRegex.test(cleanPhone) || myRegex.test(cleanPhone)) {
    return { isValid: true };
  }

  return {
    isValid: false,
    message: "Please enter a valid Singapore or Malaysia phone number",
  };
}

export function validateBusinessName(name: string): {
  isValid: boolean;
  message?: string;
} {
  if (!name) {
    return { isValid: false, message: "Business name is required" };
  }

  if (name.length < 3) {
    return {
      isValid: false,
      message: "Business name must be at least 3 characters long",
    };
  }

  if (name.length > 100) {
    return {
      isValid: false,
      message: "Business name must be less than 100 characters",
    };
  }

  return { isValid: true };
}

export function validateDescription(description: string): {
  isValid: boolean;
  message?: string;
} {
  if (!description) {
    return { isValid: false, message: "Description is required" };
  }

  if (description.length < 50) {
    return {
      isValid: false,
      message: "Description must be at least 50 characters long",
    };
  }

  if (description.length > 500) {
    return {
      isValid: false,
      message: "Description must be less than 500 characters",
    };
  }

  return { isValid: true };
}

export function validateAddress(address: string): {
  isValid: boolean;
  message?: string;
} {
  if (!address) {
    return { isValid: false, message: "Address is required" };
  }

  if (address.length < 5) {
    return {
      isValid: false,
      message: "Address must be at least 5 characters long",
    };
  }

  return { isValid: true };
}

export function validateUnitNumber(unitNumber: string): {
  isValid: boolean;
  message?: string;
} {
  if (!unitNumber) {
    return { isValid: false, message: "Unit number is required" };
  }

  if (unitNumber.length < 1) {
    return { isValid: false, message: "Unit number is required" };
  }

  return { isValid: true };
}

export function validatePostalCode(postalCode: string): {
  isValid: boolean;
  message?: string;
} {
  if (!postalCode) {
    return { isValid: false, message: "Postal code is required" };
  }

  // Singapore postal codes: 6 digits
  const sgPostalRegex = /^\d{6}$/;

  // Malaysia postal codes: 5 digits
  const myPostalRegex = /^\d{5}$/;

  if (sgPostalRegex.test(postalCode) || myPostalRegex.test(postalCode)) {
    return { isValid: true };
  }

  return {
    isValid: false,
    message:
      "Please enter a valid Singapore (6 digits) or Malaysia (5 digits) postal code",
  };
}

export function validateWebsite(website: string): {
  isValid: boolean;
  message?: string;
} {
  if (!website) {
    return { isValid: true }; // Website is optional
  }

  // Basic URL validation
  const urlRegex = /^https?:\/\/.+\..+/;
  if (!urlRegex.test(website)) {
    return {
      isValid: false,
      message: "Please enter a valid website URL (e.g., https://example.com)",
    };
  }

  return { isValid: true };
}

export function validateBusinessType(businessType: string): {
  isValid: boolean;
  message?: string;
} {
  if (!businessType) {
    return { isValid: false, message: "Business type is required" };
  }

  return { isValid: true };
}

export function generateSKU(productName: string): string {
  if (!productName || productName.trim() === "") {
    return `PROD-${Date.now().toString().slice(-6)}`;
  }

  // Clean the product name: remove special characters, convert to uppercase, limit to 6 chars
  const cleanName = productName
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, "") // Remove spaces
    .toUpperCase()
    .slice(0, 6); // Limit to 6 characters

  // Generate a 4-digit random number
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  // Combine: clean name + random number
  return `${cleanName}-${randomNum}`;
}
