"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Avatar,
  Button,
  Chip,
  Spinner,
  Image,
  Tabs,
  Tab,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  CheckBadgeIcon,
  MapPinIcon,
  LinkIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  FlagIcon,
  NoSymbolIcon,
  UserPlusIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

// Instagram & TikTok icons (simple SVG components)
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0a12 12 0 00-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.96s-.37-.74-.37-1.82c0-1.7 1-2.97 2.24-2.97 1.06 0 1.57.8 1.57 1.75 0 1.06-.68 2.66-1.03 4.14-.3 1.24.62 2.26 1.84 2.26 2.22 0 3.93-2.34 3.93-5.7 0-2.98-2.14-5.07-5.2-5.07-3.55 0-5.63 2.66-5.63 5.42 0 1.07.42 2.23.93 2.85a.37.37 0 01.1.36l-.35 1.43c-.06.23-.18.28-.42.17-1.56-.73-2.54-3-2.54-4.83 0-3.93 2.86-7.54 8.24-7.54 4.33 0 7.7 3.08 7.7 7.2 0 4.3-2.7 7.76-6.46 7.76-1.26 0-2.45-.66-2.86-1.43l-.78 2.96c-.28 1.08-1.04 2.44-1.55 3.27A12 12 0 1012 0z" />
  </svg>
);

interface PublicProfile {
  id: string;
  username: string;
  name?: string;
  bio?: string;
  image?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  pinterestHandle?: string;
  styleTags: string[];
  isVerified: boolean;
  isFeatured: boolean;
  followerCount: number;
  followingCount: number;
  publicOutfitCount: number;
  publicWardrobeCount: number;
  showClosetValue: boolean;
  showItemPrices: boolean;
  createdAt: string;
}

interface PublicWardrobe {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  slug?: string;
  likeCount: number;
  viewCount: number;
  itemCount?: number;
  createdAt: string;
}

interface PublicOutfit {
  id: string;
  name: string;
  imageUrl?: string;
  slug?: string;
  season?: string;
  occasion?: string;
  likeCount: number;
  viewCount: number;
  createdAt: string;
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const username = params.username as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [wardrobes, setWardrobes] = useState<PublicWardrobe[]>([]);
  const [outfits, setOutfits] = useState<PublicOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("outfits");

  // Interaction states
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = session?.user?.id === profile?.id;

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${username}`);

      if (response.status === 404) {
        setNotFound(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data.profile);
      setWardrobes(data.wardrobes || []);
      setOutfits(data.outfits || []);
      setIsFollowing(data.isFollowing || false);
      setIsBlocked(data.isBlocked || false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setFollowLoading(true);
    try {
      const response = await fetch(`/api/users/${username}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followerCount: prev.followerCount + (isFollowing ? -1 : 1),
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name || profile?.username}'s Wardrobe`,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Profile link copied to clipboard!");
    }
  };

  const handleReport = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    // TODO: Open report modal
    alert("Report functionality coming soon");
  };

  const handleBlock = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/users/${username}/block`, {
        method: isBlocked ? "DELETE" : "POST",
      });

      if (response.ok) {
        setIsBlocked(!isBlocked);
      }
    } catch (error) {
      console.error("Error toggling block:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">
          Profile Not Found
        </h1>
        <p className="text-default-500">
          The user @{username} doesn't exist or their profile is private.
        </p>
        <Button
          variant="flat"
          radius="none"
          onPress={() => router.push("/explore")}
        >
          Explore Profiles
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-default-200 to-default-100">
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt="Cover"
            removeWrapper
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative -mt-16 md:-mt-20 pb-6 border-b border-divider">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <Avatar
              src={profile.image || undefined}
              className="w-28 h-28 md:w-36 md:h-36 text-large shrink-0 ring-4 ring-background"
              isBordered
              radius="none"
              name={profile.name || profile.username}
            />

            {/* Info */}
            <div className="flex-1 pt-2 md:pt-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Name & Username */}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
                      {profile.name || profile.username}
                    </h1>
                    {profile.isVerified && (
                      <Tooltip content="Verified">
                        <CheckBadgeIcon className="w-6 h-6 text-primary" />
                      </Tooltip>
                    )}
                    {profile.isFeatured && (
                      <Chip
                        size="sm"
                        color="warning"
                        variant="flat"
                        classNames={{
                          base: "rounded-none",
                          content:
                            "text-[10px] font-bold uppercase tracking-widest",
                        }}
                      >
                        Featured
                      </Chip>
                    )}
                  </div>
                  <p className="text-default-400 text-sm">
                    @{profile.username}
                  </p>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="mt-3 text-default-600 max-w-lg">
                      {profile.bio}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-default-500">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        {profile.location}
                      </span>
                    )}
                    {profile.website && (
                      <a
                        href={
                          profile.website.startsWith("http")
                            ? profile.website
                            : `https://${profile.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <LinkIcon className="w-4 h-4" />
                        {profile.website.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center gap-3 mt-3">
                    {profile.instagramHandle && (
                      <a
                        href={`https://instagram.com/${profile.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-default-500 hover:text-foreground transition-colors"
                      >
                        <InstagramIcon className="w-5 h-5" />
                      </a>
                    )}
                    {profile.tiktokHandle && (
                      <a
                        href={`https://tiktok.com/@${profile.tiktokHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-default-500 hover:text-foreground transition-colors"
                      >
                        <TikTokIcon className="w-5 h-5" />
                      </a>
                    )}
                    {profile.pinterestHandle && (
                      <a
                        href={`https://pinterest.com/${profile.pinterestHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-default-500 hover:text-foreground transition-colors"
                      >
                        <PinterestIcon className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                  {/* Style Tags */}
                  {profile.styleTags && profile.styleTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {profile.styleTags.map((tag) => (
                        <Chip
                          key={tag}
                          size="sm"
                          variant="flat"
                          classNames={{
                            base: "rounded-none bg-default-100",
                            content: "text-[10px] uppercase tracking-widest",
                          }}
                        >
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <Button
                      variant="bordered"
                      radius="none"
                      className="uppercase tracking-widest text-xs font-bold"
                      onPress={() => router.push("/settings")}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        color={isFollowing ? "default" : "primary"}
                        variant={isFollowing ? "bordered" : "solid"}
                        radius="none"
                        className="uppercase tracking-widest text-xs font-bold"
                        startContent={
                          isFollowing ? (
                            <UserMinusIcon className="w-4 h-4" />
                          ) : (
                            <UserPlusIcon className="w-4 h-4" />
                          )
                        }
                        isLoading={followLoading}
                        onPress={handleFollow}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Button>

                      <Tooltip content="Share Profile">
                        <Button
                          isIconOnly
                          variant="flat"
                          radius="none"
                          onPress={handleShare}
                        >
                          <ShareIcon className="w-5 h-5" />
                        </Button>
                      </Tooltip>

                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly variant="flat" radius="none">
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile actions">
                          <DropdownItem
                            key="report"
                            startContent={<FlagIcon className="w-4 h-4" />}
                            onPress={handleReport}
                          >
                            Report User
                          </DropdownItem>
                          <DropdownItem
                            key="block"
                            startContent={<NoSymbolIcon className="w-4 h-4" />}
                            className="text-danger"
                            color="danger"
                            onPress={handleBlock}
                          >
                            {isBlocked ? "Unblock User" : "Block User"}
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 md:gap-8 mt-6">
                <div className="text-center md:text-left">
                  <p className="text-2xl font-light">{profile.followerCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
                    Followers
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-light">
                    {profile.followingCount}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
                    Following
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-light">
                    {profile.publicOutfitCount}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
                    Looks
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-light">
                    {profile.publicWardrobeCount}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
                    Collections
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="py-6">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: "gap-6",
              tab: "uppercase tracking-widest text-xs font-bold px-0",
              cursor: "bg-foreground",
            }}
          >
            <Tab key="outfits" title={`Looks (${outfits.length})`} />
            <Tab
              key="collections"
              title={`Collections (${wardrobes.length})`}
            />
          </Tabs>

          {/* Outfits Grid */}
          {activeTab === "outfits" && (
            <div className="mt-8">
              {outfits.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-default-400 italic">No public looks yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {outfits.map((outfit) => (
                    <Link
                      key={outfit.id}
                      href={`/u/${username}/looks/${outfit.slug || outfit.id}`}
                      className="group"
                    >
                      <div className="relative aspect-[3/4] bg-content2 overflow-hidden">
                        {outfit.imageUrl ? (
                          <Image
                            src={outfit.imageUrl}
                            alt={outfit.name}
                            removeWrapper
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-default-100">
                            <span className="text-default-300 text-sm italic">
                              No Image
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                          <p className="text-white text-sm font-bold uppercase tracking-tight truncate">
                            {outfit.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-white/80 text-xs">
                            <span className="flex items-center gap-1">
                              <HeartIcon className="w-3 h-3" />
                              {outfit.likeCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Collections Grid */}
          {activeTab === "collections" && (
            <div className="mt-8">
              {wardrobes.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-default-400 italic">
                    No public collections yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wardrobes.map((wardrobe) => (
                    <Link
                      key={wardrobe.id}
                      href={`/u/${username}/collections/${wardrobe.slug || wardrobe.id}`}
                      className="group"
                    >
                      <div className="relative aspect-[4/3] bg-content2 overflow-hidden">
                        {wardrobe.coverImage ? (
                          <Image
                            src={wardrobe.coverImage}
                            alt={wardrobe.title}
                            removeWrapper
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-default-100">
                            <span className="text-4xl italic font-serif text-default-300">
                              Capsule
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white text-lg font-bold uppercase tracking-tight">
                            {wardrobe.title}
                          </p>
                          {wardrobe.description && (
                            <p className="text-white/70 text-sm mt-1 line-clamp-2">
                              {wardrobe.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-white/80 text-xs">
                            <span className="flex items-center gap-1">
                              <HeartIcon className="w-3 h-3" />
                              {wardrobe.likeCount}
                            </span>
                            {wardrobe.itemCount !== undefined && (
                              <span>{wardrobe.itemCount} items</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
