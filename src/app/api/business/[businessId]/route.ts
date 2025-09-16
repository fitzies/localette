import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

    // Update the business with the provided data
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

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
