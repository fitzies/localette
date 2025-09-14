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
