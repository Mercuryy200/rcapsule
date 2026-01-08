// app/outfits/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Card, CardBody, Spinner, Chip, Divider } from "@heroui/react";
import Image from "next/image";
import { OutfitCollage } from "@/components/OutfitCollage";

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
  const { data: session, status } = useSession();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCollageGenerator, setShowCollageGenerator] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchOutfit();
    }
  }, [status, params.id]);

  const fetchOutfit = async () => {
    try {
      const response = await fetch(`/api/outfits/${params.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch outfit");
      }

      const data = await response.json();
      setOutfit(data);
    } catch (error) {
      console.error("Error fetching outfit:", error);
      alert("Failed to load outfit");
    } finally {
      setLoading(false);
    }
  };

  const handleCollageGenerated = (imageUrl: string) => {
    // Update local state with new image
    if (outfit) {
      setOutfit({ ...outfit, imageUrl });
    }
    setShowCollageGenerator(false);
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!outfit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-xl">Outfit not found</p>
        <Button onPress={() => router.push("/outfits")}>Back to Outfits</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="light" onPress={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold">{outfit.name}</h1>
          {outfit.isFavorite && (
            <Chip color="warning" variant="flat">
              ⭐ Favorite
            </Chip>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="flat"
            onPress={() => setShowCollageGenerator(!showCollageGenerator)}
          >
            {showCollageGenerator ? "Hide" : "Generate"} Collage
          </Button>
          <Button
            color="primary"
            onPress={() => router.push(`/outfits/${outfit.id}/edit`)}
          >
            Edit Outfit
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Outfit Info */}
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-4">
              {outfit.imageUrl && (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-default-100">
                  <Image
                    src={outfit.imageUrl}
                    alt={outfit.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}

              {outfit.description && (
                <div>
                  <h3 className="text-sm font-semibold text-default-600 mb-1">
                    Description
                  </h3>
                  <p className="text-default-700">{outfit.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {outfit.season && (
                  <Chip variant="flat" color="primary">
                    {outfit.season}
                  </Chip>
                )}
                {outfit.occasion && (
                  <Chip variant="flat" color="secondary">
                    {outfit.occasion}
                  </Chip>
                )}
              </div>

              <Divider />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-default-500">Times Worn</p>
                  <p className="text-lg font-semibold">{outfit.timesWorn}</p>
                </div>
                {outfit.lastWornAt && (
                  <div>
                    <p className="text-default-500">Last Worn</p>
                    <p className="text-lg font-semibold">
                      {new Date(outfit.lastWornAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Clothing Items */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">
                Items in Outfit ({outfit.clothes.length})
              </h3>
              <div className="space-y-3">
                {outfit.clothes.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-default-100 transition cursor-pointer"
                    onClick={() => router.push(`/closet/${item.id}`)}
                  >
                    {item.imageUrl && (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-default-100 flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <div className="flex gap-2 text-xs text-default-500">
                        <span>{item.category}</span>
                        {item.brand && <span>• {item.brand}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Collage Generator */}
        <div>
          {showCollageGenerator && (
            <OutfitCollage
              outfitId={outfit.id}
              outfitName={outfit.name}
              onSave={handleCollageGenerated}
            />
          )}
        </div>
      </div>
    </div>
  );
}
