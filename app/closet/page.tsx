"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button, Spinner } from "@heroui/react";
import { FunnelIcon, PlusIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import ClothingCard from "@/components/closet/ClothingCard";
import ClothesFilter, {
  FilterOptions,
} from "@/components/closet/ClothesFilter";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price?: number;
  colors: string[];
  season?: string;
  size?: string;
  link?: string;
  imageUrl?: string;
  placesToWear: string[];
  status?: string;
}

export default function ClosetPage() {
  const { status } = useSession();
  const router = useRouter();
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    colors: [],
    seasons: [],
    placesToWear: [],
    priceRange: [0, 500],
    brands: [],
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchClothes();
  }, [status, router]);

  const fetchClothes = async () => {
    try {
      // API ALREADY FILTERS FOR US!
      const response = await fetch("/api/clothes?status=owned");
      if (response.ok) {
        const data = await response.json();
        setClothes(data);
      }
    } catch (error) {
      console.error("Error fetching clothes:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- REMOVED: const ownedClothes = useMemo(...) ---
  // We use 'clothes' directly because we trust the API.

  const availableBrands = useMemo(() => {
    const brands = clothes
      .map((item) => item.brand)
      .filter((brand): brand is string => !!brand);
    return [...new Set(brands)].sort();
  }, [clothes]);

  const filteredClothes = useMemo(() => {
    const activeFilterGroups = [];
    if (filters.categories.length > 0) activeFilterGroups.push("category");
    if (filters.colors.length > 0) activeFilterGroups.push("color");
    if (filters.seasons.length > 0) activeFilterGroups.push("season");
    if (filters.placesToWear.length > 0)
      activeFilterGroups.push("placesToWear");
    if (filters.brands.length > 0) activeFilterGroups.push("brand");

    const isPriceFiltered =
      filters.priceRange[0] > 0 || filters.priceRange[1] < 500;

    if (activeFilterGroups.length === 0 && !isPriceFiltered) return clothes;

    return clothes.filter((item) => {
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(item.category)
      )
        return false;
      if (
        filters.brands.length > 0 &&
        item.brand &&
        !filters.brands.includes(item.brand)
      )
        return false;

      let matchedAtLeastOneFilter = false;
      if (
        filters.colors.length > 0 &&
        item.colors.some((c) => filters.colors.includes(c))
      )
        matchedAtLeastOneFilter = true;
      if (
        filters.seasons.length > 0 &&
        item.season &&
        filters.seasons.includes(item.season)
      )
        matchedAtLeastOneFilter = true;
      if (
        filters.placesToWear.length > 0 &&
        item.placesToWear.some((p) => filters.placesToWear.includes(p))
      )
        matchedAtLeastOneFilter = true;

      if (
        (filters.colors.length > 0 ||
          filters.seasons.length > 0 ||
          filters.placesToWear.length > 0) &&
        !matchedAtLeastOneFilter
      )
        return false;

      if (isPriceFiltered && item.price !== undefined) {
        if (
          item.price < filters.priceRange[0] ||
          item.price > filters.priceRange[1]
        )
          return false;
      }
      return true;
    });
  }, [clothes, filters]);

  const handleItemClick = (itemId: string) => router.push(`/closet/${itemId}`);
  const handleAddNew = () => router.push("/closet/new");

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" color="default" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 border-b border-divider pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Collection
          </h1>
          <p className="text-xs uppercase tracking-widest text-default-500 mt-2">
            {filteredClothes.length} Items / Season 2026
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="bordered"
            radius="none"
            className="border-default-200 font-medium uppercase text-xs tracking-wider"
            startContent={<FunnelIcon className="w-4 h-4" />}
            onPress={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Filter"}
          </Button>
          <Button
            color="primary"
            radius="none"
            className="font-bold uppercase text-xs tracking-wider shadow-lg shadow-primary/20"
            startContent={<PlusIcon className="w-4 h-4" />}
            onPress={handleAddNew}
          >
            Add Piece
          </Button>
        </div>
      </header>

      <div className="flex gap-8 relative">
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-72 flex-shrink-0 sticky top-24 h-fit"
          >
            <ClothesFilter
              onFilterChange={setFilters}
              availableBrands={availableBrands}
            />
          </motion.div>
        )}

        <div className="flex-1">
          {filteredClothes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-default-300">
              <p className="text-lg font-light text-default-500 mb-4">
                {clothes.length === 0
                  ? "Your closet is empty."
                  : "No pieces match your filter."}
              </p>
              <Button variant="flat" onPress={handleAddNew}>
                Curate your first piece
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {filteredClothes.map((item) => (
                <ClothingCard
                  key={item.id}
                  item={item}
                  onClick={handleItemClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
