import { NextResponse } from "next/server";

import { getSupabaseServer } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const session = await auth();
    const supabase = getSupabaseServer();

    const { data: user, error: userError } = await supabase
      .from("User")
      .select(
        `
        id,
        username,
        name,
        bio,
        image,
        "coverImage",
        location,
        website,
        "instagramHandle",
        "tiktokHandle",
        "pinterestHandle",
        "styleTags",
        "isVerified",
        "isFeatured",
        "followerCount",
        "followingCount",
        "profilePublic",
        "showClosetValue",
        "showItemPrices",
        "createdAt"
      `,
      )
      .eq("username", username)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isOwnProfile = session?.user?.id === user.id;

    if (!user.profilePublic && !isOwnProfile) {
      return NextResponse.json(
        { error: "Profile is private" },
        { status: 404 },
      );
    }

    // Fetch wardrobes with item counts in a single query via embedded relationship
    const [{ data: wardrobes }, { data: outfits }] = await Promise.all([
      supabase
        .from("Wardrobe")
        .select(
          `
          id,
          title,
          description,
          "coverImage",
          slug,
          "likeCount",
          "viewCount",
          "createdAt",
          clothes:WardrobeClothes(count)
        `,
        )
        .eq("userId", user.id)
        .eq("isPublic", true)
        .order("createdAt", { ascending: false }),
      supabase
        .from("Outfit")
        .select(
          `
          id,
          name,
          "imageUrl",
          slug,
          season,
          occasion,
          "likeCount",
          "viewCount",
          "createdAt"
        `,
        )
        .eq("userId", user.id)
        .eq("isPublic", true)
        .order("createdAt", { ascending: false }),
    ]);

    const wardrobesWithCount = (wardrobes || []).map((wardrobe: any) => ({
      id: wardrobe.id,
      title: wardrobe.title,
      description: wardrobe.description,
      coverImage: wardrobe.coverImage,
      slug: wardrobe.slug,
      likeCount: wardrobe.likeCount,
      viewCount: wardrobe.viewCount,
      createdAt: wardrobe.createdAt,
      itemCount: wardrobe.clothes?.[0]?.count || 0,
    }));

    // Counts come from the already-fetched arrays — no extra queries needed
    const publicWardrobeCount = wardrobesWithCount.length;
    const publicOutfitCount = (outfits || []).length;

    let isFollowing = false;
    let isBlocked = false;

    if (session?.user?.id && session.user.id !== user.id) {
      const { data: followData } = await supabase
        .from("Follow")
        .select("id")
        .eq("followerId", session.user.id)
        .eq("followingId", user.id)
        .single();

      isFollowing = !!followData;

      const { data: blockData } = await supabase
        .from("Block")
        .select("id")
        .eq("blockerId", session.user.id)
        .eq("blockedId", user.id)
        .single();

      isBlocked = !!blockData;
    }

    if (!isOwnProfile) {
      await supabase
        .from("User")
        .update({
          profileViews: (user as any).profileViews
            ? (user as any).profileViews + 1
            : 1,
        })
        .eq("id", user.id);
    }

    const profile = {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      image: user.image,
      coverImage: user.coverImage,
      location: user.location,
      website: user.website,
      instagramHandle: user.instagramHandle,
      tiktokHandle: user.tiktokHandle,
      pinterestHandle: user.pinterestHandle,
      styleTags: user.styleTags || [],
      isVerified: user.isVerified || false,
      isFeatured: user.isFeatured || false,
      followerCount: user.followerCount || 0,
      followingCount: user.followingCount || 0,
      publicOutfitCount: publicOutfitCount || 0,
      publicWardrobeCount: publicWardrobeCount || 0,
      showClosetValue: user.showClosetValue || false,
      showItemPrices: user.showItemPrices || false,
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      profile,
      wardrobes: wardrobesWithCount,
      outfits: outfits || [],
      isFollowing,
      isBlocked,
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);

    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
