"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, Tab, Spinner, Button } from "@heroui/react";

import type { Clothes, Wardrobe, Outfit } from "@/lib/database.type";
import ProfileHeader from "@/components/profile/ProfileHeader";
import WardrobeTab from "@/components/profile/WardrobeTab";
import { useUser } from "@/contexts/UserContext";

interface ExtendedWardrobe extends Wardrobe {
  clothesCount?: number;
}

export default function ProfilePage() {
  const { status } = useSession();
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [wardrobes, setWardrobes] = useState<ExtendedWardrobe[]>([]);
  const [clothes, setClothes] = useState<Clothes[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") fetchProfileData();
  }, [status, router]);

  const fetchProfileData = async () => {
    try {
      const [wardrobesRes, clothesRes, outfitsRes] = await Promise.all([
        fetch("/api/wardrobes"),
        fetch("/api/clothes"),
        fetch("/api/outfits"),
      ]);

      if (wardrobesRes.ok && clothesRes.ok) {
        const wData = await wardrobesRes.json();
        const cData = await clothesRes.json();
        const oData = outfitsRes.ok ? await outfitsRes.json() : [];

        setWardrobes(wData);
        setClothes(cData);
        setOutfits(oData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalValue = clothes.reduce((sum, item) => sum + (item.price || 0), 0);
  const stats = {
    items: clothes.length,
    wardrobes: wardrobes.length,
    outfits: outfits.length,
    totalValue: totalValue,
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <ProfileHeader
        user={user || {}}
        stats={stats}
        onEdit={() => router.push("/settings")}
      />

      <Tabs
        aria-label="Profile Options"
        variant="underlined"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent:
            "group-data-[selected=true]:text-primary text-default-500 uppercase tracking-widest font-bold text-xs",
        }}
      >
        <Tab key="overview" title="Overview">
          <div className="py-8">
            {/* Empty State / Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 1. Recent Adds */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-default-400">
                  Recently Acquired
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {clothes.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="aspect-[3/4] bg-content2 relative"
                    >
                      <img
                        src={item.imageUrl || "/images/placeholder.png"}
                        className="w-full h-full object-cover"
                        alt={item.name}
                      />
                    </div>
                  ))}
                  {clothes.length === 0 && (
                    <div className="text-default-400 text-sm">
                      No items yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-default-400">
                  Top Brands
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set(clothes.map((c) => c.brand).filter(Boolean))
                  )
                    .slice(0, 5)
                    .map((brand) => (
                      <span
                        key={brand}
                        className="px-4 py-2 border border-default-200 text-xs uppercase tracking-wider"
                      >
                        {brand}
                      </span>
                    ))}
                  {clothes.length === 0 && (
                    <div className="text-default-400 text-sm">
                      Add items to see insights.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Tab>

        <Tab key="wardrobes" title="Wardrobes">
          <div className="py-8">
            <WardrobeTab wardrobes={wardrobes} refreshData={fetchProfileData} />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
