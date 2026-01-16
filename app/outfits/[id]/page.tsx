"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Spinner, Chip, Image, Divider } from "@heroui/react";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  SparklesIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// Types...
interface Outfit {
  id: string;
  name: string;
  description?: string;
  season?: string;
  occasion?: string;
  imageUrl?: string;
  isFavorite: boolean;
  timesWorn: number;
  lastWornAt?: string;
  clothes: Array<{
    id: string;
    name: string;
    imageUrl?: string;
    category: string;
    brand?: string;
  }>;
}

export default function OutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") fetchOutfit();
  }, [status, params.id]);

  const fetchOutfit = async () => {
    try {
      const response = await fetch(`/api/outfits/${params.id}`);
      if (response.ok) setOutfit(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this look?")) return;
    try {
      const response = await fetch(`/api/outfits/${params.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push("/outfits");
      } else {
        alert("Failed to delete outfit");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !outfit)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <Button
          variant="light"
          startContent={<ArrowLeftIcon className="w-4 h-4" />}
          className="uppercase tracking-widest text-xs font-bold pl-0"
          onPress={() => router.back()}
        >
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        <div className="relative bg-content2 flex items-center justify-center p-8 lg:p-20 order-2 lg:order-1">
          <div className="relative w-full aspect-[3/4] shadow-2xl">
            <Image
              src={outfit.imageUrl || "/images/placeholder.png"}
              alt={outfit.name}
              radius="none"
              className="w-full h-full object-cover"
              classNames={{ wrapper: "w-full h-full" }}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-12 lg:px-24 order-1 lg:order-2">
          <div className="mb-2 flex gap-2">
            {outfit.season && (
              <Chip
                size="sm"
                variant="bordered"
                radius="none"
                className="uppercase text-[10px]"
              >
                {outfit.season}
              </Chip>
            )}
            {outfit.occasion && (
              <Chip
                size="sm"
                variant="bordered"
                radius="none"
                className="uppercase text-[10px]"
              >
                {outfit.occasion}
              </Chip>
            )}
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-6 leading-none">
            {outfit.name}
          </h1>
          {outfit.description && (
            <p className="text-default-500 font-light text-lg mb-8 border-l-2 border-foreground pl-4 italic">
              "{outfit.description}"
            </p>
          )}
          <div className="flex items-center gap-8 mb-12 border-y border-divider py-4">
            <div>
              <span className="block text-3xl font-light">
                {outfit.timesWorn}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-default-400">
                Times Worn
              </span>
            </div>
            {outfit.lastWornAt && (
              <div>
                <span className="block text-xl font-light mt-1.5">
                  {new Date(outfit.lastWornAt).toLocaleDateString()}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-default-400">
                  Last Outing
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6">
              Deconstructed Look
            </h3>
            <div className="space-y-4">
              {outfit.clothes.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-center group cursor-pointer"
                  onClick={() => router.push(`/closet/${item.id}`)}
                >
                  <div className="w-16 h-16 bg-default-50 border border-default-200">
                    <Image
                      src={item.imageUrl || ""}
                      radius="none"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-default-400">
                      {item.brand || item.category}
                    </p>
                    <p className="font-medium uppercase tracking-tight group-hover:underline">
                      {item.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 flex gap-4">
            <Button
              variant="solid"
              color="primary"
              radius="none"
              fullWidth
              className="uppercase font-bold tracking-widest h-12"
              startContent={<PencilSquareIcon className="w-4 h-4" />}
              onPress={() => router.push(`/outfits/${outfit.id}/edit`)} // LINKS TO EDIT PAGE
            >
              Edit Look
            </Button>
            <Button
              variant="bordered"
              color="danger"
              radius="none"
              className="uppercase font-bold tracking-widest h-12 min-w-[100px]"
              startContent={<TrashIcon className="w-4 h-4" />}
              onPress={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
