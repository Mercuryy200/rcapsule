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
        fetch("/api/clothes?status=owned"),
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
                  Top Designers
                </h3>
                <div className="flex flex-col gap-2">
                  {/* Logic: Count -> Sort -> Slice Top 3 */}
                  {Object.entries(
                    clothes.reduce(
                      (acc, item) => {
                        if (item.brand) {
                          acc[item.brand] = (acc[item.brand] || 0) + 1;
                        }
                        return acc;
                      },
                      {} as Record<string, number>,
                    ),
                  )
                    .sort(([, countA], [, countB]) => countB - countA) // Sort Descending
                    .slice(0, 3) // Take Top 3
                    .map(([brand, count], index) => (
                      <div
                        key={brand}
                        className="flex justify-between items-center py-3 border-b border-default-100 group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-default-300">
                            0{index + 1}
                          </span>
                          <span className="text-lg font-black uppercase italic tracking-tighter text-foreground group-hover:translate-x-2 transition-transform duration-300">
                            {brand}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-content2 px-2 py-1 text-default-500">
                          {count} {count === 1 ? "Item" : "Items"}
                        </span>
                      </div>
                    ))}

                  {clothes.filter((c) => c.brand).length === 0 && (
                    <div className="py-6 text-center border border-dashed border-default-200">
                      <p className="text-xs uppercase tracking-widest text-default-400">
                        No brand data available
                      </p>
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
