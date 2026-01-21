"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button, Spinner, ButtonGroup } from "@heroui/react";
import {
  FunnelIcon,
  PlusIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
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
  condition?: string;
  style?: string;
}

export default function ClosetPage() {
  const { status } = useSession();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"grid" | "gallery">("grid");

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
    styles: [],
    conditions: [],
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchClothes();
  }, [status, router]);

  const fetchClothes = async () => {
    try {
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
    if (filters.styles.length > 0) activeFilterGroups.push("style");
    if (filters.conditions.length > 0) activeFilterGroups.push("condition");

    const isPriceFiltered =
      filters.priceRange[0] > 0 || filters.priceRange[1] < 500;

    if (activeFilterGroups.length === 0 && !isPriceFiltered) return clothes;

    return clothes.filter((item) => {
      // Hard filters (must match if specified)
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
      if (
        filters.styles.length > 0 &&
        item.style &&
        !filters.styles.includes(item.style)
      )
        return false;
      if (
        filters.conditions.length > 0 &&
        item.condition &&
        !filters.conditions.includes(item.condition)
      )
        return false;

      // Soft filters (at least one must match if any are specified)
      let matchedAtLeastOneFilter = false;
      if (
        filters.colors.length > 0 &&
        item.colors &&
        item.colors.some((c) => filters.colors.includes(c))
      )
        matchedAtLeastOneFilter = true;
      if (
        filters.seasons.length > 0 &&
        item.season &&
        Array.isArray(item.season) &&
        item.season.some((s) => filters.seasons.includes(s))
      )
        matchedAtLeastOneFilter = true;
      if (
        filters.placesToWear.length > 0 &&
        item.placesToWear &&
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

  const clothesByCategory = useMemo(() => {
    const groups: Record<string, ClothingItem[]> = {};

    filteredClothes.forEach((item) => {
      const cat = item.category || "Uncategorized";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });

    return Object.entries(groups).sort(([, itemsA], [, itemsB]) => {
      return itemsB.length - itemsA.length;
    });
  }, [filteredClothes]);

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
    <div className="wardrobe-page-container">
      <header className="wardrobe-page-header">
        <div>
          <h1 className="wardrobe-page-title">Collection</h1>
          <p className="wardrobe-page-subtitle">
            {filteredClothes.length} Items / Season 2026
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <ButtonGroup variant="flat" className="mr-2">
            <Button
              isIconOnly
              radius="none"
              className={
                viewMode === "grid"
                  ? "bg-default-200 text-black"
                  : "bg-transparent text-default-400"
              }
              onPress={() => setViewMode("grid")}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </Button>
            <Button
              isIconOnly
              radius="none"
              className={
                viewMode === "gallery"
                  ? "bg-default-200 text-black"
                  : "bg-transparent text-default-400"
              }
              onPress={() => setViewMode("gallery")}
            >
              <ViewColumnsIcon className="w-5 h-5" />
            </Button>
          </ButtonGroup>

          <Button
            variant="bordered"
            radius="none"
            className="border-default-200 font-medium uppercase text-xs tracking-wider"
            startContent={<FunnelIcon className="w-4 h-4" />}
            onPress={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide" : "Filter"}
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
            className="wardrobe-filters-sidebar"
          >
            <ClothesFilter
              onFilterChange={setFilters}
              availableBrands={availableBrands}
              maxPrice={500}
            />
          </motion.div>
        )}

        <div className="flex-1 min-w-0">
          {filteredClothes.length === 0 ? (
            <div className="wardrobe-empty-state">
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
            <>
              {viewMode === "grid" && (
                <div className="wardrobe-grid">
                  {filteredClothes.map((item) => (
                    <ClothingCard
                      key={item.id}
                      item={item}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              )}

              {viewMode === "gallery" && (
                <div className="space-y-12 pb-20">
                  {clothesByCategory.map(([category, items]) => (
                    <div key={category} className="space-y-3">
                      <div className="wardrobe-category-header">
                        <h2 className="wardrobe-category-title">{category}</h2>
                        <div className="h-[1px] flex-1 bg-default-200"></div>
                        <span className="wardrobe-category-count">
                          {items.length}
                        </span>
                      </div>

                      <div className="wardrobe-gallery-row">
                        {items.map((item) => (
                          <div key={item.id} className="wardrobe-gallery-item">
                            <div className="h-full w-full">
                              <ClothingCard
                                item={item}
                                onClick={handleItemClick}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
