import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if business exists for this user
    const business = await prisma.business.findFirst({
      where: {
        ownerId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      hasBusiness: !!business,
      business: business || null,
    });
  } catch (error) {
    console.error("Error checking business:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
