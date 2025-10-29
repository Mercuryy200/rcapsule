import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wardrobes = await prisma.wardrobe.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { clothes: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const wardrobesWithCount = wardrobes.map((wardrobe) => ({
      id: wardrobe.id,
      title: wardrobe.title,
      description: wardrobe.description,
      isPublic: wardrobe.isPublic,
      coverImage: wardrobe.coverImage,
      clothesCount: wardrobe._count.clothes,
      createdAt: wardrobe.createdAt,
      updatedAt: wardrobe.updatedAt,
    }));

    return NextResponse.json(wardrobesWithCount);
  } catch (error) {
    console.error("Error fetching wardrobes:", error);

    return NextResponse.json(
      { error: "Failed to fetch wardrobes" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const wardrobe = await prisma.wardrobe.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description || null,
        isPublic: data.isPublic || false,
        coverImage: data.coverImage || null,
      },
    });

    return NextResponse.json(wardrobe, { status: 201 });
  } catch (error) {
    console.error("Error creating wardrobe:", error);

    return NextResponse.json(
      { error: "Failed to create wardrobe" },
      { status: 500 },
    );
  }
}
