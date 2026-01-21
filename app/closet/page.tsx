"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  Button,
  ButtonGroup,
  Input,
  Select,
  SelectItem,
  Listbox,
  ListboxItem,
  Chip,
} from "@heroui/react";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import ClothingCard from "@/components/closet/ClothingCard";
import ClothesFilter, {
  FilterOptions,
} from "@/components/closet/ClothesFilter";
import * as Sentry from "@sentry/nextjs";
import { ClothingCardSkeleton } from "@/components/closet/ClothingCardSkeleton";

// --- Types ---
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

// --- Hook: Recent Searches ---
function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("closet_search_history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const addSearch = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...history.filter((h) => h !== term)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("closet_search_history", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("closet_search_history");
  };

  return { history, addSearch, clearHistory };
}

export default function ClosetPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [viewMode, setViewMode] = useState<"grid" | "gallery">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "price" | "worn">(
    "recent",
  );

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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

  // --- Effects ---
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchClothes();
  }, [status, router]);

  // Click outside listener to close autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Filter Logic
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
      // Hard Filters
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

      // Soft Filters
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

  // Full-Text Search Logic
  const searchedClothes = useMemo(() => {
    if (!searchQuery) return filteredClothes;
    const lowerQuery = searchQuery.toLowerCase();

    return filteredClothes.filter((item) => {
      // Search Score Strategy:
      // 1. Check Name
      if (item.name.toLowerCase().includes(lowerQuery)) return true;
      // 2. Check Brand
      if (item.brand?.toLowerCase().includes(lowerQuery)) return true;
      // 3. Check Category
      if (item.category.toLowerCase().includes(lowerQuery)) return true;
      // 4. Check Tags
      if (item.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)))
        return true;
      // 5. Check Colors (Optional, users might type "Red dress")
      if (item.colors.some((c) => c.toLowerCase().includes(lowerQuery)))
        return true;

      return false;
    });
  }, [filteredClothes, searchQuery]);

  // Autocomplete Suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQuery = searchQuery.toLowerCase();

    // Gather all unique terms from the filtered set
    const terms = new Set<string>();

    // Only suggest terms that actually exist in the currently filtered view
    filteredClothes.forEach((item) => {
      if (item.name.toLowerCase().includes(lowerQuery)) terms.add(item.name);
      if (item.brand?.toLowerCase().includes(lowerQuery)) terms.add(item.brand);
      if (item.category.toLowerCase().includes(lowerQuery))
        terms.add(item.category);
    });

    return Array.from(terms).slice(0, 5); // Limit to top 5 suggestions
  }, [filteredClothes, searchQuery]);

  // Sorting
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

  // Grouping
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

  // --- Handlers ---
  const handleItemClick = (itemId: string) => {
    router.push(`/closet/${itemId}`);
  };

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    addSearch(term);
    setIsSearchFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit(searchQuery);
    }
  };

  const handleAddNew = () => router.push("/closet/new");

  if (status === "loading" || loading) {
    return (
      <div className="wardrobe-page-container">
        <div className="wardrobe-grid">
          {[...Array(8)].map((_, i) => (
            <ClothingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="wardrobe-page-container min-h-screen"
      onClick={() => setIsSearchFocused(false)}
    >
      {/* Header Section */}
      <header
        className="wardrobe-page-header relative z-30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Group */}
        <div>
          <h1 className="wardrobe-page-title">Collection</h1>
          <p className="wardrobe-page-subtitle">
            {sortedClothes.length} Pieces &bull; S/S 2026
          </p>
        </div>

        {/* Controls Group */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-4 w-full md:w-auto relative">
          {/* SEARCH COMPONENT with Autocomplete */}
          <div className="relative w-full sm:w-64" ref={searchContainerRef}>
            <Input
              variant="underlined"
              radius="none"
              classNames={{
                inputWrapper:
                  "border-b border-default-200 shadow-none px-0 h-10 hover:border-default-400 after:bg-black dark:after:bg-white",
                input:
                  "text-sm font-light placeholder:text-default-400 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]",
              }}
              placeholder="Search Collection"
              startContent={
                <MagnifyingGlassIcon className="w-4 h-4 text-default-400" />
              }
              value={searchQuery}
              onValueChange={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleKeyDown}
              isClearable
              onClear={() => setSearchQuery("")}
            />

            {/* Autocomplete / Recent Searches Dropdown */}
            <AnimatePresence>
              {isSearchFocused &&
                (searchQuery.length > 0 || history.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-black border border-default-200 shadow-xl z-50 p-2"
                  >
                    {/* CASE 1: Typing - Show Autocomplete Suggestions */}
                    {searchQuery.length > 0 && suggestions.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[10px] uppercase tracking-widest text-default-400 mb-2 px-2">
                          Suggestions
                        </p>
                        {suggestions.map((term, i) => (
                          <button
                            key={i}
                            className="w-full text-left px-2 py-2 text-sm font-light hover:bg-default-100 dark:hover:bg-default-200 transition-colors flex items-center justify-between group"
                            onClick={() => handleSearchSubmit(term)}
                          >
                            <span>{term}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-default-400 uppercase">
                              Select
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* CASE 2: Show Recent Searches (only if history exists) */}
                    {history.length > 0 && (
                      <div>
                        {/* Only show header if we are also showing suggestions, or just generally if specific styling needed */}
                        <div className="flex justify-between items-center mb-2 px-2 mt-2">
                          <p className="text-[10px] uppercase tracking-widest text-default-400">
                            Recent
                          </p>
                          <button
                            onClick={clearHistory}
                            className="text-[10px] text-default-400 hover:text-red-500 uppercase tracking-wide"
                          >
                            Clear
                          </button>
                        </div>
                        {history.map((term, i) => (
                          <button
                            key={`hist-${i}`}
                            className="w-full text-left px-2 py-2 text-sm font-light text-default-600 hover:bg-default-100 dark:hover:bg-default-800 transition-colors flex items-center gap-2"
                            onClick={() => handleSearchSubmit(term)}
                          >
                            <ClockIcon className="w-3 h-3 text-default-400" />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Empty State for Dropdown */}
                    {searchQuery && suggestions.length === 0 && (
                      <div className="p-4 text-center text-default-400 text-xs italic">
                        No matching items found.
                      </div>
                    )}
                  </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Sort Select */}
          <Select
            variant="underlined"
            radius="none"
            aria-label="Sort by"
            placeholder="SORT BY"
            selectedKeys={[sortBy]}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full sm:w-40"
            classNames={{
              trigger:
                "border-b border-default-200 shadow-none px-0 h-10 min-h-10 hover:border-default-400 after:bg-black dark:after:bg-white",
              value: "text-sm font-light uppercase tracking-widest",
              selectorIcon: "text-default-400",
            }}
          >
            <SelectItem
              key="recent"
              classNames={{
                title: "font-light uppercase tracking-wider text-xs",
              }}
            >
              Most Recent
            </SelectItem>
            <SelectItem
              key="name"
              classNames={{
                title: "font-light uppercase tracking-wider text-xs",
              }}
            >
              Name (A-Z)
            </SelectItem>
            <SelectItem
              key="price"
              classNames={{
                title: "font-light uppercase tracking-wider text-xs",
              }}
            >
              Price (High-Low)
            </SelectItem>
            <SelectItem
              key="worn"
              classNames={{
                title: "font-light uppercase tracking-wider text-xs",
              }}
            >
              Most Worn
            </SelectItem>
          </Select>

          {/* Buttons Group */}
          <div className="flex gap-3 items-center mt-2 sm:mt-0 ml-auto sm:ml-0">
            <ButtonGroup
              variant="flat"
              className="bg-transparent border border-default-200"
              radius="none"
            >
              <Button
                isIconOnly
                radius="none"
                className={`w-10 h-10 bg-transparent ${viewMode === "grid" ? "text-primary" : "text-default-300"}`}
                onPress={() => setViewMode("grid")}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </Button>
              <Button
                isIconOnly
                radius="none"
                className={`w-10 h-10 bg-transparent ${viewMode === "gallery" ? "text-primary" : "text-default-300"}`}
                onPress={() => setViewMode("gallery")}
              >
                <ViewColumnsIcon className="w-4 h-4" />
              </Button>
            </ButtonGroup>

            <Button
              variant="bordered"
              radius="none"
              className="border-default-200 font-medium uppercase text-[10px] tracking-[0.15em] h-10 px-4 min-w-[80px] hover:border-primary transition-colors"
              startContent={<FunnelIcon className="w-3 h-3" />}
              onPress={() => setShowFilters(!showFilters)}
            >
              Filter
            </Button>

            <Button
              color="primary"
              radius="none"
              className="font-medium uppercase text-[10px] tracking-[0.15em] h-10 px-6 shadow-none rounded-none"
              startContent={<PlusIcon className="w-3 h-3" />}
              onPress={handleAddNew}
            >
              Add Item
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
          {sortedClothes.length === 0 ? (
            <div className="wardrobe-empty-state">
              <p className="text-xl font-light italic text-default-400 mb-6">
                {clothes.length === 0
                  ? "The collection is currently empty."
                  : "No pieces found matching your criteria."}
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
                onPress={handleAddNew}
              >
                Curate Item
              </Button>
            </div>
          ) : (
            <>
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
