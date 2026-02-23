"use client";
import type { GlobalProduct } from "@/lib/types/globalproduct";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Input, useDisclosure, Image } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { toast } from "sonner";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import ProductCard from "@/components/catalog/ProductCard";
import ProductCardSkeleton from "@/components/catalog/ProductCardSkeleton";
import AddToClosetModal from "@/components/catalog/AddToClosetModal";

interface CatalogResponse {
  products: GlobalProduct[];
  total: number;
  type?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type FilterTab = "all" | "product" | "brand" | "category";

export default function CatalogPage() {
  const { status } = useSession();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);

  // Selected product for modal
  const [selectedProduct, setSelectedProduct] = useState<GlobalProduct | null>(
    null,
  );

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Debounce search query for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch suggestions (top 10 by popularity) while typing
  const { data: suggestionsData, isLoading: suggestionsLoading } =
    useSWR<CatalogResponse>(
      debouncedQuery && !hasSearched
        ? `/api/catalog?q=${encodeURIComponent(debouncedQuery)}&suggestions=true`
        : null,
      fetcher,
    );

  // Fetch full results after search
  const { data: resultsData, isLoading: resultsLoading } =
    useSWR<CatalogResponse>(
      hasSearched && searchQuery
        ? `/api/catalog?q=${encodeURIComponent(searchQuery)}&filter=${activeFilter}`
        : null,
      fetcher,
    );

  const suggestions = suggestionsData?.products || [];
  const results = resultsData?.products || [];

  // Handle search submit
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setHasSearched(true);
      setIsInputFocused(false);
      inputRef.current?.blur();
    }
  }, [searchQuery]);

  // Handle keyboard enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
    if (e.key === "Escape") {
      setIsInputFocused(false);
      inputRef.current?.blur();
    }
  };

  // Handle filter tab change
  const handleFilterChange = (filter: FilterTab) => {
    setActiveFilter(filter);
    if (hasSearched) {
      // Re-trigger search with new filter
      setHasSearched(false);
      setTimeout(() => setHasSearched(true), 10);
    }
  };

  // Clear search and go back to initial state
  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setHasSearched(false);
    setActiveFilter("all");
    inputRef.current?.focus();
  };

  // Handle "Add to Closet" click
  const handleAddToCloset = (product: GlobalProduct) => {
    if (status !== "authenticated") {
      router.push("/login");

      return;
    }
    setSelectedProduct(product);
    onOpen();
  };

  // After successful add
  const handleAddSuccess = () => {
    toast.success("Added to your closet!");
    onClose();
    setSelectedProduct(null);
  };

  // Click on suggestion item
  const handleSuggestionClick = (product: GlobalProduct) => {
    setSearchQuery(product.name);
    setHasSearched(true);
    setIsInputFocused(false);
  };

  const showSuggestions =
    isInputFocused && searchQuery && !hasSearched && suggestions.length > 0;
  const showResults = hasSearched && searchQuery;

  return (
    <div className="min-h-screen">
      {/* Hero Search Section */}
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="search-hero"
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[70vh] px-6"
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Editorial Title */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-extralight tracking-[0.2em] uppercase mb-4">
                Catalog
              </h1>
              <p className="text-sm md:text-base font-light tracking-[0.3em] uppercase text-default-400">
                Discover &bull; Curate &bull; Collect
              </p>
            </motion.div>

            {/* Search Container */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl relative"
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {/* Search Input */}
              <div className="relative">
                <Input
                  ref={inputRef}
                  classNames={{
                    inputWrapper:
                      "h-16 md:h-20 border-default-300 hover:border-default-500 focus-within:border-foreground transition-colors bg-transparent group-data-[focus=true]:border-foreground",
                    input:
                      "text-lg md:text-xl font-light tracking-wide placeholder:text-default-300 placeholder:font-extralight placeholder:tracking-widest",
                  }}
                  endContent={
                    searchQuery && (
                      <Button
                        isIconOnly
                        className="mr-2"
                        radius="none"
                        size="sm"
                        variant="light"
                        onPress={handleClearSearch}
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </Button>
                    )
                  }
                  placeholder="Search products, brands, categories..."
                  radius="none"
                  size="lg"
                  startContent={
                    <MagnifyingGlassIcon className="w-5 h-5 md:w-6 md:h-6 text-default-400 ml-2" />
                  }
                  value={searchQuery}
                  variant="bordered"
                  onFocus={() => setIsInputFocused(true)}
                  onKeyDown={handleKeyDown}
                  onValueChange={setSearchQuery}
                />
              </div>

              {/* Search Button */}
              <motion.div
                animate={{ opacity: searchQuery ? 1 : 0 }}
                className="flex justify-end mt-4"
                initial={{ opacity: 0 }}
              >
                <Button
                  className="uppercase tracking-[0.2em] font-medium px-12"
                  color="primary"
                  isDisabled={!searchQuery.trim()}
                  radius="none"
                  size="lg"
                  onPress={handleSearch}
                >
                  Search
                </Button>
              </motion.div>

              {/* Filter Tabs - Show when typing */}
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center gap-1 mt-6"
                    exit={{ opacity: 0, y: -10 }}
                    initial={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {(
                      ["all", "product", "brand", "category"] as FilterTab[]
                    ).map((filter) => (
                      <Button
                        key={filter}
                        className={`uppercase tracking-[0.15em] text-xs font-medium px-6 ${
                          activeFilter === filter
                            ? ""
                            : "text-default-500 hover:text-foreground"
                        }`}
                        color={activeFilter === filter ? "primary" : "default"}
                        radius="none"
                        size="sm"
                        variant={activeFilter === filter ? "solid" : "light"}
                        onPress={() => handleFilterChange(filter)}
                      >
                        {filter}
                      </Button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-background border border-default-200 shadow-2xl z-50 max-h-[60vh] overflow-y-auto"
                    exit={{ opacity: 0, y: 10 }}
                    initial={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 border-b border-default-100">
                      <div className="flex items-center gap-2 text-default-400">
                        <SparklesIcon className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">
                          Popular in closets
                        </span>
                      </div>
                    </div>

                    {suggestionsLoading ? (
                      <div className="p-8 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-default-300 border-t-foreground rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="divide-y divide-default-100">
                        {suggestions.map((product, index) => (
                          <motion.button
                            key={product.id}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full p-4 flex items-center gap-4 hover:bg-default-50 transition-colors text-left group"
                            initial={{ opacity: 0, x: -10 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleSuggestionClick(product)}
                          >
                            {/* Product Image */}
                            <div className="w-16 h-20 bg-default-100 flex-shrink-0 overflow-hidden">
                              <Image
                                alt={product.name}
                                className="w-full h-full object-contain"
                                radius="none"
                                src={
                                  product.processed_image_url ||
                                  product.imageurl ||
                                  "/images/placeholder.png"
                                }
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] uppercase tracking-[0.15em] text-default-400 mb-1">
                                {product.brand}
                              </p>
                              <p className="text-sm font-light truncate group-hover:text-primary transition-colors">
                                {product.name}
                              </p>
                              <p className="text-xs text-default-400 capitalize mt-1">
                                {product.category}
                              </p>
                            </div>

                            {/* Popularity Badge */}
                            {product.popularityCount &&
                              product.popularityCount > 0 && (
                                <div className="flex-shrink-0 text-right">
                                  <p className="text-xs font-medium">
                                    {product.popularityCount}
                                  </p>
                                  <p className="text-[9px] uppercase tracking-wider text-default-400">
                                    in closets
                                  </p>
                                </div>
                              )}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : (
          /* Results View */
          <motion.div
            key="results"
            animate={{ opacity: 1 }}
            className="wardrobe-page-container"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Results Header */}
            <header className="pt-8 pb-12">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                initial={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.1 }}
              >
                <div>
                  <button
                    className="text-[10px] uppercase tracking-[0.2em] text-default-400 hover:text-foreground transition-colors mb-4 flex items-center gap-2"
                    onClick={handleClearSearch}
                  >
                    <span>&larr;</span>
                    <span>Back to search</span>
                  </button>
                  <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.1em] uppercase">
                    &ldquo;{searchQuery}&rdquo;
                  </h1>
                  <p className="text-sm text-default-400 mt-2 tracking-wide">
                    {resultsLoading
                      ? "Searching..."
                      : `${results.length} results found`}
                  </p>
                </div>

                {/* Filter Tabs in Results View */}
                <div className="flex gap-1">
                  {(["all", "product", "brand", "category"] as FilterTab[]).map(
                    (filter) => (
                      <Button
                        key={filter}
                        className={`uppercase tracking-[0.1em] text-xs ${
                          activeFilter !== filter ? "border-default-200" : ""
                        }`}
                        color={activeFilter === filter ? "primary" : "default"}
                        radius="none"
                        size="sm"
                        variant={activeFilter === filter ? "solid" : "bordered"}
                        onPress={() => handleFilterChange(filter)}
                      >
                        {filter}
                      </Button>
                    ),
                  )}
                </div>
              </motion.div>

              {/* Search Bar in Results */}
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 max-w-xl"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.2 }}
              >
                <Input
                  classNames={{
                    inputWrapper:
                      "border-b border-default-200 hover:border-default-400 after:bg-foreground",
                    input:
                      "text-base font-light placeholder:text-default-300 placeholder:font-extralight",
                  }}
                  endContent={
                    <Button
                      isIconOnly
                      radius="none"
                      size="sm"
                      variant="light"
                      onPress={handleClearSearch}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  }
                  placeholder="Refine your search..."
                  radius="none"
                  startContent={
                    <MagnifyingGlassIcon className="w-4 h-4 text-default-400" />
                  }
                  value={searchQuery}
                  variant="underlined"
                  onKeyDown={handleKeyDown}
                  onValueChange={(val) => {
                    setSearchQuery(val);
                    if (!val) {
                      setHasSearched(false);
                    }
                  }}
                />
              </motion.div>
            </header>

            {/* Results Grid */}
            <motion.div
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              {resultsLoading ? (
                <div className="wardrobe-grid">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ProductCardSkeleton />
                    </motion.div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-32"
                  initial={{ opacity: 0 }}
                >
                  <p className="text-xl font-extralight italic text-default-400 mb-6">
                    No products found for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <Button
                    className="uppercase tracking-[0.15em] text-xs border-default-300"
                    radius="none"
                    variant="bordered"
                    onPress={handleClearSearch}
                  >
                    Try a different search
                  </Button>
                </motion.div>
              ) : (
                <div className="wardrobe-grid pb-20">
                  {results.map((product, index) => (
                    <motion.div
                      key={product.id}
                      animate={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 30 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.4,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCloset={handleAddToCloset}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to Closet Modal */}
      <AddToClosetModal
        isOpen={isOpen}
        product={selectedProduct}
        onClose={onClose}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
