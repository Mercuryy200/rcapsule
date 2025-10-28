import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET current visibility setting
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profilePublic: true },
    });

    return NextResponse.json({ profilePublic: user?.profilePublic || false });
  } catch (error) {
    console.error("Error fetching visibility:", error);
    return NextResponse.json(
      { error: "Failed to fetch visibility" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profilePublic: data.profilePublic || false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating visibility:", error);
    return NextResponse.json(
      { error: "Failed to update visibility" },
      { status: 500 }
    );
  }
}
