export interface CreateBusinessData {
  businessType: string;
  businessName: string;
  description: string;
  address1: string;
  address2: string;
  unitNumber: string;
  postalCode: string;
  email: string;
  phone: string;
  pickupAvailable: boolean;
  dineInAvailable: boolean;
  availability: any;
  brandColor: string;
  businessLogo: any;
  bannerImage: any;
}

export interface CreateBusinessResponse {
  success: boolean;
  businessId: string;
  business: any;
}

export async function createBusiness(
  data: CreateBusinessData
): Promise<CreateBusinessResponse> {
  const response = await fetch("/api/creation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create business");
  }

  return response.json();
}

export interface HasBusinessResponse {
  success: boolean;
  hasBusiness: boolean;
  business?: any;
}

export async function hasBusiness(): Promise<HasBusinessResponse> {
  const response = await fetch("/api/has-business", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to check business status");
  }

  return response.json();
}

export interface GetBusinessResponse {
  success: boolean;
  business: {
    id: string;
    businessName: string;
    businessType?: string;
    description?: string;
    address?: string;
    email?: string;
    phone?: string;
    pickupAvailable: boolean;
    dineInAvailable: boolean;
    brandColor?: string;
    businessLogo?: string;
    bannerImage?: string;
    isActive: boolean;
    paymentSetup: boolean;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export async function getBusiness(): Promise<GetBusinessResponse> {
  const response = await fetch("/api/business", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get business");
  }

  return response.json();
}

export interface UpdateBusinessData {
  // Branding fields
  logo?: string;
  banner?: string;
  brandColor?: string;
  brandKeywords?: string;

  // Identity fields
  name?: string;
  description?: string;
  category?: string;

  // Contact fields
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  unitNumber?: string;
  postalCode?: string;

  // Social media fields
  instagram?: string;
  facebook?: string;
}

export interface UpdateBusinessResponse {
  success: boolean;
  message: string;
  business?: any;
}

export async function updateBusiness(
  businessId: string,
  data: UpdateBusinessData
): Promise<UpdateBusinessResponse> {
  const response = await fetch(`/api/business/${businessId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update business");
  }

  return response.json();
}
