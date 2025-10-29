import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const wardrobe = await prisma.wardrobe.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        clothes: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!wardrobe) {
      return NextResponse.json(
        { error: "Wardrobe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(wardrobe);
  } catch (error) {
    console.error("Error fetching wardrobe:", error);

    return NextResponse.json(
      { error: "Failed to fetch wardrobe" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const existing = await prisma.wardrobe.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Wardrobe not found" },
        { status: 404 }
      );
    }

    const wardrobe = await prisma.wardrobe.update({
      where: { id },
      data: {
        title: data.title || existing.title,
        description:
          data.description !== undefined
            ? data.description
            : existing.description,
        isPublic:
          data.isPublic !== undefined ? data.isPublic : existing.isPublic,
        coverImage:
          data.coverImage !== undefined ? data.coverImage : existing.coverImage,
      },
    });

    return NextResponse.json(wardrobe);
  } catch (error) {
    console.error("Error updating wardrobe:", error);

    return NextResponse.json(
      { error: "Failed to update wardrobe" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Await params

    const existing = await prisma.wardrobe.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Wardrobe not found" },
        { status: 404 }
      );
    }

    await prisma.wardrobe.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting wardrobe:", error);

    return NextResponse.json(
      { error: "Failed to delete wardrobe" },
      { status: 500 }
    );
  }
}
