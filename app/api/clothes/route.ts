import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const wardrobeId = searchParams.get("wardrobeId");

    const clothes = await prisma.clothes.findMany({
      where: {
        userId: session.user.id,
        ...(wardrobeId && { wardrobeId }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clothes);
  } catch (error) {
    console.error("Error fetching clothes:", error);
    return NextResponse.json(
      { error: "Failed to fetch clothes" },
      { status: 500 }
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

    if (!data.name || !data.category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    // If wardrobeId provided, verify ownership
    if (data.wardrobeId) {
      const wardrobe = await prisma.wardrobe.findUnique({
        where: { id: data.wardrobeId },
      });

      if (!wardrobe || wardrobe.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Invalid wardrobe" },
          { status: 400 }
        );
      }
    }

    const clothing = await prisma.clothes.create({
      data: {
        userId: session.user.id,
        wardrobeId: data.wardrobeId || null,
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

    return NextResponse.json(clothing, { status: 201 });
  } catch (error) {
    console.error("Error creating clothing:", error);
    return NextResponse.json(
      { error: "Failed to create clothing" },
      { status: 500 }
    );
  }
}
