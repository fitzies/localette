import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user ID from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get business by the authenticated user's ID
    const business = await prisma.business.findFirst({
      where: {
        ownerId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!business) {
      return NextResponse.json(
        { success: false, error: "No business found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        businessName: business.name,
        businessType: business.category,
        description: business.description,
        address: business.address1,
        email: business.email,
        phone: business.phone,
        pickupAvailable: business.pickupAvailable,
        dineInAvailable: business.dineInAvailable,
        brandColor: business.brandColor,
        businessLogo: business.logo,
        bannerImage: business.banner,
        isActive: business.isActive,
        paymentSetup: business.paymentSetup,
        ownerId: business.ownerId,
        createdAt: business.createdAt.toISOString(),
        updatedAt: business.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
