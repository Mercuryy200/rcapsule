import { NextResponse } from "next/server";

import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

// POST - Block a user
export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await params;
    const supabase = getSupabaseServer();

    // Get the user to block
    const { data: targetUser, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("username", username)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Can't block yourself
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot block yourself" },
        { status: 400 },
      );
    }

    // Check if already blocked
    const { data: existingBlock } = await supabase
      .from("Block")
      .select("id")
      .eq("blockerId", session.user.id)
      .eq("blockedId", targetUser.id)
      .single();

    if (existingBlock) {
      return NextResponse.json(
        { error: "User is already blocked" },
        { status: 400 },
      );
    }

    // Create block
    const { data: block, error: blockError } = await supabase
      .from("Block")
      .insert({
        blockerId: session.user.id,
        blockedId: targetUser.id,
      })
      .select()
      .single();

    if (blockError) {
      throw blockError;
    }

    // Also remove any follow relationships
    await supabase
      .from("Follow")
      .delete()
      .or(
        `and(followerId.eq.${session.user.id},followingId.eq.${targetUser.id}),and(followerId.eq.${targetUser.id},followingId.eq.${session.user.id})`,
      );

    return NextResponse.json({ success: true, block });
  } catch (error) {
    console.error("Error blocking user:", error);

    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 },
    );
  }
}

// DELETE - Unblock a user
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await params;
    const supabase = getSupabaseServer();

    // Get the user to unblock
    const { data: targetUser, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("username", username)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete block
    const { error: deleteError } = await supabase
      .from("Block")
      .delete()
      .eq("blockerId", session.user.id)
      .eq("blockedId", targetUser.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unblocking user:", error);

    return NextResponse.json(
      { error: "Failed to unblock user" },
      { status: 500 },
    );
  }
}

// GET - Check if blocked
export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ isBlocked: false });
    }

    const { username } = await params;
    const supabase = getSupabaseServer();

    // Get the target user
    const { data: targetUser } = await supabase
      .from("User")
      .select("id")
      .eq("username", username)
      .single();

    if (!targetUser) {
      return NextResponse.json({ isBlocked: false });
    }

    // Check block status
    const { data: block } = await supabase
      .from("Block")
      .select("id")
      .eq("blockerId", session.user.id)
      .eq("blockedId", targetUser.id)
      .single();

    return NextResponse.json({ isBlocked: !!block });
  } catch (error) {
    console.error("Error checking block status:", error);

    return NextResponse.json({ isBlocked: false });
  }
}
