import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

// POST - Follow a user
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

    // Get the user to follow
    const { data: targetUser, error: userError } = await supabase
      .from("User")
      .select("id, profilePublic")
      .eq("username", username)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Can't follow yourself
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 },
      );
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from("Follow")
      .select("id")
      .eq("followerId", session.user.id)
      .eq("followingId", targetUser.id)
      .single();

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 },
      );
    }

    // Check if blocked by target user
    const { data: blockedBy } = await supabase
      .from("Block")
      .select("id")
      .eq("blockerId", targetUser.id)
      .eq("blockedId", session.user.id)
      .single();

    if (blockedBy) {
      return NextResponse.json(
        { error: "Cannot follow this user" },
        { status: 403 },
      );
    }

    // Create follow relationship
    const { data: follow, error: followError } = await supabase
      .from("Follow")
      .insert({
        followerId: session.user.id,
        followingId: targetUser.id,
      })
      .select()
      .single();

    if (followError) {
      throw followError;
    }

    // Note: follower counts are updated automatically via trigger

    return NextResponse.json({ success: true, follow });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 },
    );
  }
}

// DELETE - Unfollow a user
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

    // Get the user to unfollow
    const { data: targetUser, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("username", username)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete follow relationship
    const { error: deleteError } = await supabase
      .from("Follow")
      .delete()
      .eq("followerId", session.user.id)
      .eq("followingId", targetUser.id);

    if (deleteError) {
      throw deleteError;
    }

    // Note: follower counts are updated automatically via trigger

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 },
    );
  }
}

// GET - Check if following
export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ isFollowing: false });
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
      return NextResponse.json({ isFollowing: false });
    }

    // Check follow status
    const { data: follow } = await supabase
      .from("Follow")
      .select("id")
      .eq("followerId", session.user.id)
      .eq("followingId", targetUser.id)
      .single();

    return NextResponse.json({ isFollowing: !!follow });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json({ isFollowing: false });
  }
}
