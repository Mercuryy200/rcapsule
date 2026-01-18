"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Image, Spinner, Chip } from "@heroui/react";
import { PlusIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

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
  const { status } = useSession();
  const router = useRouter();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") fetchOutfits();
  }, [status, router]);

  const fetchOutfits = async () => {
    try {
      const response = await fetch("/api/outfits");
      if (response.ok) {
        const data = await response.json();
        setOutfits(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (
    e: React.MouseEvent,
    outfitId: string,
    currentStatus: boolean
  ) => {
    e.stopPropagation();
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
      console.error(error);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  const filteredOutfits =
    filter === "favorites" ? outfits.filter((o) => o.isFavorite) : outfits;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-divider pb-6">
        <div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-2">
            Lookbook
          </h1>
          <div className="flex gap-6">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs uppercase tracking-widest font-bold transition-colors ${filter === "all" ? "text-foreground border-b-2 border-foreground" : "text-default-400 hover:text-foreground"}`}
            >
              All Looks ({outfits.length})
            </button>
            <button
              onClick={() => setFilter("favorites")}
              className={`text-xs uppercase tracking-widest font-bold transition-colors ${filter === "favorites" ? "text-foreground border-b-2 border-foreground" : "text-default-400 hover:text-foreground"}`}
            >
              Favorites
            </button>
          </div>
        </div>

        <Button
          radius="none"
          color="primary"
          className="uppercase font-bold tracking-widest px-8"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={() => router.push("/outfits/new")}
        >
          Curate New Look
        </Button>
      </div>

      {filteredOutfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-default-300">
          <p className="text-xl font-light italic mb-4">
            {filter === "favorites"
              ? "No favorites yet."
              : "Your collection is empty."}
          </p>
          <Button
            variant="flat"
            radius="none"
            onPress={() => router.push("/outfits/new")}
          >
            Start Styling
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {filteredOutfits.map((outfit) => (
            <div
              key={outfit.id}
              className="group cursor-pointer"
              onClick={() => router.push(`/outfits/${outfit.id}`)}
            >
              <div className="relative aspect-[3/4] bg-content2 mb-4 overflow-hidden">
                {outfit.imageUrl ? (
                  <Image
                    alt={outfit.name}
                    src={outfit.imageUrl}
                    radius="none"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    classNames={{ wrapper: "w-full h-full" }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-default-50 text-default-300">
                    <span className="text-4xl italic font-serif">Capsule</span>
                    <span className="text-[10px] uppercase tracking-widest mt-2">
                      No Visual
                    </span>
                  </div>
                )}

                <button
                  onClick={(e) =>
                    toggleFavorite(e, outfit.id, outfit.isFavorite)
                  }
                  className="absolute top-3 right-3 z-20 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {outfit.isFavorite ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-600 drop-shadow-md" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-white drop-shadow-md hover:scale-110 transition-transform" />
                  )}
                </button>

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold uppercase tracking-tight leading-none">
                    {outfit.name}
                  </h3>
                  {outfit.timesWorn > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">
                      Worn {outfit.timesWorn}x
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-default-500 uppercase tracking-wider">
                  <span>{outfit.itemCount} Items</span>
                  {outfit.occasion && (
                    <>
                      <span>•</span>
                      <span>{outfit.occasion}</span>
                    </>
                  )}
                  {outfit.season && (
                    <>
                      <span>•</span>
                      <span>{outfit.season}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
