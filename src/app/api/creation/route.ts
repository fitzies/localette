import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Extract all the form data
    const {
      businessType,
      businessName,
      description,
      address1,
      address2,
      unitNumber,
      postalCode,
      email,
      phone,
      pickupAvailable,
      dineInAvailable,
      availability,
      brandColor,
      businessLogo,
      bannerImage,
    } = body;

    // Validate required fields
    if (
      !businessName ||
      !description ||
      !address1 ||
      !unitNumber ||
      !postalCode ||
      !email ||
      !phone
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the business
    const business = await prisma.business.create({
      data: {
        name: businessName,
        description,
        category: businessType,
        address1,
        address2,
        unitNumber,
        postalCode,
        phone,
        email,
        pickupAvailable,
        dineInAvailable,
        ownerId: userId,
        logo: businessLogo,
        banner: bannerImage,
        brandColor: brandColor || "blue",
      },
    });

    return NextResponse.json(
      {
        success: true,
        businessId: business.id,
        business,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
