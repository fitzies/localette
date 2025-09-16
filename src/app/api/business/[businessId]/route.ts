import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { userId } = await auth();
    const { businessId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const data = await request.json();

    // Verify the business belongs to the authenticated user
    const existingBusiness = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!existingBusiness) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (existingBusiness.ownerId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to update this business" },
        { status: 403 }
      );
    }

    // Validate delivery methods
    if (
      (data.pickupAvailable === false && data.dineInAvailable === false) ||
      (data.pickupAvailable === false &&
        existingBusiness.dineInAvailable === false &&
        data.dineInAvailable === undefined) ||
      (data.dineInAvailable === false &&
        existingBusiness.pickupAvailable === false &&
        data.pickupAvailable === undefined)
    ) {
      return NextResponse.json(
        { error: "At least one delivery method must be available" },
        { status: 400 }
      );
    }

    // Update the business with the provided data
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Invalidate cache for business data
    revalidateTag(`business-${businessId}`);
    revalidatePath(`/admin/${businessId}/branding`);
    revalidatePath(`/admin/${businessId}`);
    revalidatePath(`/admin/${businessId}/settings`);

    return NextResponse.json({
      success: true,
      message: "Business updated successfully",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
