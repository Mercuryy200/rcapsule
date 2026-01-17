"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button, Spinner } from "@heroui/react";
import { FunnelIcon, PlusIcon, HeartIcon } from "@heroicons/react/24/outline"; // Added HeartIcon
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
  status?: string; // Important
}

export default function WishlistPage() {
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
    priceRange: [0, 5000], // Increased range for wishlist dreams
    brands: [],
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchClothes();
  }, [status, router]);

  const fetchClothes = async () => {
    try {
      const response = await fetch("/api/clothes");
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

  // --- 1. HARD FILTER: Get only Wishlist items ---
  const wishlistItems = useMemo(() => {
    return clothes.filter((item) => item.status === "wishlist");
  }, [clothes]);

  // --- 2. Calculate Brands based on Wishlist ---
  const availableBrands = useMemo(() => {
    const brands = wishlistItems
      .map((item) => item.brand)
      .filter((brand): brand is string => !!brand);
    return [...new Set(brands)].sort();
  }, [wishlistItems]);

  // --- 3. Apply UI Filters ---
  const filteredClothes = useMemo(() => {
    const activeFilterGroups = [];
    if (filters.categories.length > 0) activeFilterGroups.push("category");
    if (filters.colors.length > 0) activeFilterGroups.push("color");
    if (filters.seasons.length > 0) activeFilterGroups.push("season");
    if (filters.placesToWear.length > 0)
      activeFilterGroups.push("placesToWear");
    if (filters.brands.length > 0) activeFilterGroups.push("brand");

    const isPriceFiltered =
      filters.priceRange[0] > 0 || filters.priceRange[1] < 5000;

    // Default return
    if (activeFilterGroups.length === 0 && !isPriceFiltered)
      return wishlistItems;

    return wishlistItems.filter((item) => {
      // Category Filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(item.category)
      )
        return false;

      // Brand Filter
      if (
        filters.brands.length > 0 &&
        item.brand &&
        !filters.brands.includes(item.brand)
      )
        return false;

      // OR Logic for attributes
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

      // Price Filter
      if (isPriceFiltered && item.price !== undefined) {
        if (
          item.price < filters.priceRange[0] ||
          item.price > filters.priceRange[1]
        )
          return false;
      }
      return true;
    });
  }, [wishlistItems, filters]);

  const handleItemClick = (itemId: string) => router.push(`/closet/${itemId}`);
  const handleAddNew = () => router.push("/closet/new"); // Or a specific wishlist add page

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" color="default" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      {/* HEADER SECTION - Customized for Wishlist */}
      <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 border-b border-divider pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              Wishlist
            </h1>
            <HeartIcon className="w-8 h-8 text-danger" />
          </div>

          <p className="text-xs uppercase tracking-widest text-default-500 mt-2">
            {filteredClothes.length} Items / Future Buys
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
            color="danger" // Changed to Danger (Red) for visual distinction
            radius="none"
            className="font-bold uppercase text-xs tracking-wider shadow-lg shadow-danger/20"
            startContent={<PlusIcon className="w-4 h-4" />}
            onPress={handleAddNew}
          >
            Add Wish
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
              <HeartIcon className="w-12 h-12 text-default-300 mb-4" />
              <p className="text-lg font-light text-default-500 mb-4">
                {wishlistItems.length === 0
                  ? "Your wishlist is empty."
                  : "No items match your filter."}
              </p>
              <Button variant="flat" onPress={handleAddNew}>
                Start wishing
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {filteredClothes.map((item) => (
                <ClothingCard
                  key={item.id}
                  item={item}
                  onClick={handleItemClick}
                  // Optional: Pass a flag if you want styling changes
                  // isWishlist={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
