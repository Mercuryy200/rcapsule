import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name || null,
        image: data.image || null,
      },
    });

    return NextResponse.json({
      name: user.name,
      image: user.image,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
