import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();

    console.log("Session:", JSON.stringify(session, null, 2));
    console.log("User ID:", session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const clothes = await prisma.clothes.findMany({
      where: {
        userId: session.user.id,
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
      { status: 500 },
    );
  }
}
export async function POST(req: Request) {
  try {
    const session = await auth();

    console.log("Session:", JSON.stringify(session, null, 2));
    console.log("User ID:", session?.user?.id);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.name || !data.category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 },
      );
    }

    const clothing = await prisma.clothes.create({
      data: {
        userId: session.user.id,
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
      { status: 500 },
    );
  }
}
