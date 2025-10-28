import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wardrobe = await prisma.wardrobe.findUnique({
      where: {
        id: params.id,
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const existing = await prisma.wardrobe.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Wardrobe not found" },
        { status: 404 }
      );
    }

    const wardrobe = await prisma.wardrobe.update({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.wardrobe.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Wardrobe not found" },
        { status: 404 }
      );
    }

    await prisma.wardrobe.delete({
      where: { id: params.id },
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
