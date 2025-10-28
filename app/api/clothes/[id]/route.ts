import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const clothing = await prisma.clothes.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!clothing) {
      return NextResponse.json(
        { error: "Clothing not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(clothing);
  } catch (error) {
    console.error("Error fetching clothing:", error);

    return NextResponse.json(
      { error: "Failed to fetch clothing" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const clothing = await prisma.clothes.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name: data.name,
        category: data.category,
        price: data.price ? parseFloat(data.price) : null,
        colors: data.colors || [],
        season: data.season || null,
        size: data.size || null,
        link: data.link || null,
        imageUrl: data.imageUrl || null,
        placesToWear: data.placesToWear || [],
      },
    });

    if (clothing.count === 0) {
      return NextResponse.json(
        { error: "Clothing not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Updated successfully" });
  } catch (error) {
    console.error("Error updating clothing:", error);

    return NextResponse.json(
      { error: "Failed to update clothing" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const clothing = await prisma.clothes.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (clothing.count === 0) {
      return NextResponse.json(
        { error: "Clothing not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting clothing:", error);

    return NextResponse.json(
      { error: "Failed to delete clothing" },
      { status: 500 },
    );
  }
}
