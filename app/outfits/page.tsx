"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  Spinner,
  Chip,
} from "@heroui/react";
import { PlusIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface Outfit {
  id: string;
  name: string;
  description?: string;
  season?: string;
  occasion?: string;
  imageUrl?: string;
  isFavorite: boolean;
  timesWorn: number;
  itemCount: number;
  createdAt: string;
}

export default function OutfitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchOutfits();
    }
  }, [status, router]);

  const fetchOutfits = async () => {
    try {
      const response = await fetch("/api/outfits");
      if (response.ok) {
        const data = await response.json();
        setOutfits(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching outfits:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (outfitId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/outfits/${outfitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !currentStatus }),
      });

      if (response.ok) {
        setOutfits((prev) =>
          prev.map((outfit) =>
            outfit.id === outfitId
              ? { ...outfit, isFavorite: !currentStatus }
              : outfit
          )
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredOutfits =
    filter === "favorites" ? outfits.filter((o) => o.isFavorite) : outfits;

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-light tracking-wide mb-2">
            Your Outfits
          </h1>
          <p className="text-gray-500 text-sm">
            {outfits.length} {outfits.length === 1 ? "outfit" : "outfits"} in
            your collection
          </p>
        </div>
        <Button
          as={Link}
          href="/outfits/new"
          color="primary"
          size="lg"
          className="font-light"
          startContent={<PlusIcon className="w-5 h-5" />}
        >
          Create Outfit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-8">
        <Button
          variant={filter === "all" ? "solid" : "bordered"}
          onPress={() => setFilter("all")}
          className="font-light"
        >
          All Outfits
        </Button>
        <Button
          variant={filter === "favorites" ? "solid" : "bordered"}
          onPress={() => setFilter("favorites")}
          className="font-light"
          startContent={<HeartSolidIcon className="w-4 h-4" />}
        >
          Favorites
        </Button>
      </div>

      {/* Outfits Grid */}
      {filteredOutfits.length === 0 ? (
        <Card className="p-16 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <p className="text-xl text-gray-400 font-light mb-6">
              {filter === "favorites"
                ? "No favorite outfits yet"
                : "Your outfit collection is empty"}
            </p>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              Create your first outfit by combining your favorite pieces
              together
            </p>
            <Button
              as={Link}
              href="/outfits/new"
              color="primary"
              size="lg"
              className="font-light"
            >
              Create Your First Outfit
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOutfits.map((outfit) => (
            <Card
              key={outfit.id}
              className="group relative overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              isPressable
              onPress={() => router.push(`/outfits/${outfit.id}`)}
            >
              <CardBody className="p-0">
                <div className="relative w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200">
                  {outfit.imageUrl ? (
                    <Image
                      alt={outfit.name}
                      className="w-full h-full object-cover"
                      classNames={{ img: "w-full h-full object-cover" }}
                      src={outfit.imageUrl}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <p className="text-6xl mb-2">👔</p>
                        <p className="text-sm font-light">No image</p>
                      </div>
                    </div>
                  )}

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(outfit.id, outfit.isFavorite);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleFavorite(outfit.id, outfit.isFavorite);
                      }
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200 z-10 cursor-pointer"
                  >
                    {outfit.isFavorite ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </CardBody>
              <CardFooter className="flex flex-col items-start gap-3 p-5 bg-white">
                <div className="w-full">
                  <h3 className="font-light text-xl tracking-wide mb-1">
                    {outfit.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{outfit.itemCount} items</span>
                    {outfit.occasion && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{outfit.occasion}</span>
                      </>
                    )}
                  </div>
                </div>

                {(outfit.season || outfit.timesWorn > 0) && (
                  <div className="flex gap-2 flex-wrap">
                    {outfit.season && (
                      <Chip
                        size="sm"
                        variant="flat"
                        className="font-light text-xs"
                      >
                        {outfit.season}
                      </Chip>
                    )}
                    {outfit.timesWorn > 0 && (
                      <Chip
                        size="sm"
                        variant="flat"
                        className="font-light text-xs"
                      >
                        Worn {outfit.timesWorn}x
                      </Chip>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
