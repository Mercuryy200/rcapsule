"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import ClothingCard from "@/components/closet/ClothingCard";
import ClothesFilter, {
  FilterOptions,
} from "@/components/closet/ClothesFilter";
import WardrobeHeader, { useSearchHistory } from "@/components/WardrobeHeader";
import * as Sentry from "@sentry/nextjs";
import { ClothingCardSkeleton } from "@/components/closet/ClothingCardSkeleton";

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
  tags?: string[];
  timesworn?: number;
  createdAt?: string;
}

export default function ClosetPage() {
  const { status } = useSession();
  const router = useRouter();

  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "gallery">("grid");
  const [sortBy, setSortBy] = useState("recent");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const { history, addSearch, clearHistory } = useSearchHistory();

  // Data State
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

  // --- Logic: Derived Data ---
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

  const searchedClothes = useMemo(() => {
    if (!searchQuery) return filteredClothes;
    const lowerQuery = searchQuery.toLowerCase();

    return filteredClothes.filter((item) => {
      if (item.name.toLowerCase().includes(lowerQuery)) return true;
      if (item.brand?.toLowerCase().includes(lowerQuery)) return true;
      if (item.category.toLowerCase().includes(lowerQuery)) return true;
      if (item.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)))
        return true;
      return false;
    });
  }, [filteredClothes, searchQuery]);

  const sortedClothes = useMemo(() => {
    const sorted = [...searchedClothes];
    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "price":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "worn":
        return sorted.sort((a, b) => (b.timesworn || 0) - (a.timesworn || 0));
      case "recent":
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
    }
  }, [searchedClothes, sortBy]);

  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQuery = searchQuery.toLowerCase();
    const terms = new Set<string>();
    filteredClothes.forEach((item) => {
      if (item.name.toLowerCase().includes(lowerQuery)) terms.add(item.name);
      if (item.brand?.toLowerCase().includes(lowerQuery)) terms.add(item.brand);
      if (item.category.toLowerCase().includes(lowerQuery))
        terms.add(item.category);
    });
    return Array.from(terms).slice(0, 5);
  }, [filteredClothes, searchQuery]);

  const clothesByCategory = useMemo(() => {
    const groups: Record<string, ClothingItem[]> = {};
    sortedClothes.forEach((item) => {
      const cat = item.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return Object.entries(groups).sort(
      ([, itemsA], [, itemsB]) => itemsB.length - itemsA.length,
    );
  }, [sortedClothes]);

  const handleItemClick = (itemId: string) => {
    Sentry.addBreadcrumb({
      category: "navigation",
      message: "Navigated to item detail",
      level: "info",
      data: { itemId },
    });
    router.push(`/closet/${itemId}`);
  };

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    addSearch(term);
  };

  const isLoading = status === "loading" || loading;

  return (
    <div className="wardrobe-page-container min-h-screen">
      <WardrobeHeader
        title="Collection"
        subtitle={
          isLoading ? (
            <div className="h-5 w-32 bg-default-200 animate-pulse rounded" />
          ) : (
            <>{sortedClothes.length} Items &bull; S/S 2026</>
          )
        }
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        suggestions={suggestions}
        history={history}
        onClearHistory={clearHistory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onAddNew={() => router.push("/closet/new")}
        actionLabel="Add Piece"
      />

      <div className="flex gap-8 relative">
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
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
          {isLoading ? (
            <div className="wardrobe-grid">
              {[...Array(8)].map((_, i) => (
                <ClothingCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedClothes.length === 0 ? (
            <div className="wardrobe-empty-state">
              <p className="text-xl font-light italic text-default-400 mb-6">
                {clothes.length === 0
                  ? "Your closet is empty."
                  : "No pieces match your search or filter."}
              </p>
              {searchQuery && (
                <Button
                  variant="light"
                  radius="none"
                  className="uppercase tracking-widest text-xs mb-4"
                  onPress={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
              <Button
                variant="flat"
                radius="none"
                className="uppercase tracking-widest text-xs"
                onPress={() => router.push("/closet/new")}
              >
                Curate your first piece
              </Button>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="wardrobe-grid">
                  {sortedClothes.map((item) => (
                    <ClothingCard
                      key={item.id}
                      item={item}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              )}

              {/* Gallery View */}
              {viewMode === "gallery" && (
                <div className="space-y-16 pb-20">
                  {clothesByCategory.map(([category, items]) => (
                    <div key={category} className="space-y-4">
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
                            <ClothingCard
                              item={item}
                              onClick={handleItemClick}
                            />
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
