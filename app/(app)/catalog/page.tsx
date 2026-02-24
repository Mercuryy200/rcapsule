"use client";
import type { GlobalProduct } from "@/lib/types/globalproduct";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Button,
  Input,
  useDisclosure,
  Select,
  SelectItem,
  Accordion,
  AccordionItem,
  CheckboxGroup,
  Checkbox,
  Switch,
  ScrollShadow,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { toast } from "sonner";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

import ProductCard from "@/components/catalog/ProductCard";
import ProductCardSkeleton from "@/components/catalog/ProductCardSkeleton";
import AddToClosetModal from "@/components/catalog/AddToClosetModal";

interface CatalogResponse {
  products: GlobalProduct[];
  total: number;
  limit: number;
  offset: number;
  availableBrands?: string[];
  availableCategories?: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type SortOption = "popularity" | "newest" | "price-asc" | "price-desc" | "name";

const sortOptions: { key: SortOption; label: string }[] = [
  { key: "popularity", label: "Most Popular" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: Low → High" },
  { key: "price-desc", label: "Price: High → Low" },
  { key: "name", label: "Name A–Z" },
];

const LIMIT = 24;

export default function CatalogPage() {
  const { status } = useSession();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);

  // Selected product for modal
  const [selectedProduct, setSelectedProduct] = useState<GlobalProduct | null>(
    null,
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Sort state
  const [sort, setSort] = useState<SortOption>("popularity");

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Pagination state
  const [offset, setOffset] = useState(0);
  const [products, setProducts] = useState<GlobalProduct[]>([]);
  const [total, setTotal] = useState(0);

  // Filter metadata from API
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Mobile filter toggle
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset offset when filters/sort/search change
  useEffect(() => {
    setOffset(0);
    setProducts([]);
  }, [debouncedQuery, sort, selectedCategories, selectedBrands, inStockOnly]);

  // Build API URL
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (debouncedQuery) params.set("q", debouncedQuery);
    params.set("sort", sort);
    params.set("limit", String(LIMIT));
    params.set("offset", String(offset));
    if (selectedCategories.length > 0)
      params.set("category", selectedCategories.join(","));
    if (selectedBrands.length > 0)
      params.set("brand", selectedBrands.join(","));
    if (inStockOnly) params.set("inStock", "true");

    return `/api/catalog?${params.toString()}`;
  }, [
    debouncedQuery,
    sort,
    offset,
    selectedCategories,
    selectedBrands,
    inStockOnly,
  ]);

  // Fetch data
  const { data, isLoading } = useSWR<CatalogResponse>(apiUrl, fetcher, {
    keepPreviousData: true,
  });

  // Update products when data arrives
  useEffect(() => {
    if (!data) return;

    if (data.offset === 0) {
      setProducts(data.products);
    } else {
      setProducts((prev) => [...prev, ...data.products]);
    }

    setTotal(data.total);

    // Store metadata from first page
    if (data.availableBrands) setAvailableBrands(data.availableBrands);
    if (data.availableCategories)
      setAvailableCategories(data.availableCategories);
  }, [data]);

  // Handlers
  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + LIMIT);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    inputRef.current?.focus();
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setInStockOnly(false);
  };

  const handleAddToCloset = (product: GlobalProduct) => {
    if (status !== "authenticated") {
      router.push("/login");

      return;
    }
    setSelectedProduct(product);
    onOpen();
  };

  const handleAddSuccess = () => {
    toast.success("Added to your closet!");
    onClose();
    setSelectedProduct(null);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedBrands.length > 0 || inStockOnly;

  const allLoaded = products.length >= total;
  const isLoadingMore = isLoading && offset > 0;
  const isInitialLoading = isLoading && offset === 0 && products.length === 0;

  const itemClasses = {
    title: "text-xs font-bold uppercase tracking-widest text-foreground",
    trigger: "py-4",
    content: "pb-4 pl-1",
  };

  // Filter sidebar content (shared between desktop and mobile)
  const filterContent = (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest">Filters</h3>
        {hasActiveFilters && (
          <Button
            className="text-xs uppercase tracking-wider text-default-400 data-[hover=true]:text-foreground"
            radius="none"
            size="sm"
            startContent={<XMarkIcon className="w-3 h-3" />}
            variant="light"
            onPress={handleClearFilters}
          >
            Clear
          </Button>
        )}
      </div>

      <ScrollShadow hideScrollBar className="flex-1 -mr-2 pr-2">
        <Accordion
          defaultExpandedKeys={["category", "brand"]}
          itemClasses={itemClasses}
          selectionMode="multiple"
          showDivider={false}
        >
          <AccordionItem key="category" aria-label="Category" title="Category">
            <CheckboxGroup
              classNames={{ wrapper: "gap-3" }}
              value={selectedCategories}
              onValueChange={setSelectedCategories}
            >
              {availableCategories.map((cat) => (
                <Checkbox
                  key={cat}
                  classNames={{
                    label: "text-sm text-default-500 capitalize ml-1",
                  }}
                  radius="none"
                  size="sm"
                  value={cat}
                >
                  {cat}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </AccordionItem>

          <AccordionItem key="brand" aria-label="Brand" title="Brand">
            <CheckboxGroup
              classNames={{ wrapper: "gap-3" }}
              value={selectedBrands}
              onValueChange={setSelectedBrands}
            >
              {availableBrands.map((brand) => (
                <Checkbox
                  key={brand}
                  classNames={{
                    label: "text-sm text-default-500 ml-1",
                  }}
                  radius="none"
                  size="sm"
                  value={brand}
                >
                  {brand}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </AccordionItem>

          <AccordionItem
            key="stock"
            aria-label="Availability"
            title="Availability"
          >
            <div className="flex items-center gap-3">
              <Switch
                isSelected={inStockOnly}
                size="sm"
                onValueChange={setInStockOnly}
              />
              <span className="text-sm text-default-500">In Stock Only</span>
            </div>
          </AccordionItem>
        </Accordion>
      </ScrollShadow>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="wardrobe-page-container">
        {/* Page Header */}
        <header className="pt-8 pb-6">
          <div className="flex flex-col gap-6">
            {/* Title Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.15em] uppercase">
                  Catalog
                </h1>
                <p className="text-sm text-default-400 mt-1 tracking-wide">
                  {isInitialLoading
                    ? "Loading..."
                    : `${total} product${total !== 1 ? "s" : ""}`}
                </p>
              </div>

              {/* Search + Sort Row */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Search Input */}
                <div className="relative flex-1 md:w-72">
                  <Input
                    ref={inputRef}
                    classNames={{
                      inputWrapper:
                        "h-10 border-default-200 hover:border-default-400 bg-transparent group-data-[focus=true]:border-foreground",
                      input:
                        "text-sm font-light placeholder:text-default-300 placeholder:font-extralight",
                    }}
                    endContent={
                      searchQuery ? (
                        <button
                          className="text-default-400 hover:text-foreground transition-colors"
                          onClick={handleClearSearch}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      ) : null
                    }
                    placeholder="Search..."
                    radius="none"
                    size="sm"
                    startContent={
                      <MagnifyingGlassIcon className="w-4 h-4 text-default-400" />
                    }
                    value={searchQuery}
                    variant="bordered"
                    onValueChange={setSearchQuery}
                  />
                </div>

                {/* Sort Dropdown */}
                <Select
                  aria-label="Sort by"
                  classNames={{
                    trigger:
                      "h-10 min-h-10 border-default-200 bg-transparent data-[hover=true]:border-default-400",
                    value: "text-xs uppercase tracking-wider font-medium",
                    selectorIcon: "text-default-400",
                  }}
                  radius="none"
                  selectedKeys={new Set([sort])}
                  size="sm"
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as SortOption;

                    if (selected) setSort(selected);
                  }}
                >
                  {sortOptions.map((option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>

                {/* Mobile Filter Toggle */}
                <Button
                  isIconOnly
                  className="md:hidden border-default-200"
                  radius="none"
                  size="sm"
                  variant="bordered"
                  onPress={() => setShowFilters(!showFilters)}
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content: Filters + Grid */}
        <div className="flex gap-8 pb-20">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0 border-r border-divider pr-6">
            {filterContent}
          </aside>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 md:hidden"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowFilters(false)}
                />

                {/* Panel */}
                <motion.div
                  animate={{ x: 0 }}
                  className="absolute left-0 top-0 bottom-0 w-72 bg-background p-6 shadow-2xl overflow-y-auto"
                  exit={{ x: -288 }}
                  initial={{ x: -288 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold uppercase tracking-wider">
                      Filters
                    </h2>
                    <Button
                      isIconOnly
                      radius="none"
                      size="sm"
                      variant="light"
                      onPress={() => setShowFilters(false)}
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </Button>
                  </div>
                  {filterContent}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {isInitialLoading ? (
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
            ) : products.length === 0 ? (
              <motion.div
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32"
                initial={{ opacity: 0 }}
              >
                <p className="text-xl font-extralight italic text-default-400 mb-6">
                  No products found
                </p>
                {(debouncedQuery || hasActiveFilters) && (
                  <Button
                    className="uppercase tracking-[0.15em] text-xs border-default-300"
                    radius="none"
                    variant="bordered"
                    onPress={() => {
                      handleClearSearch();
                      handleClearFilters();
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <>
                <div className="wardrobe-grid">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      animate={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 30 }}
                      transition={{
                        delay: Math.min(index, 8) * 0.05,
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

                {/* Load More */}
                <div className="flex flex-col items-center gap-3 mt-12">
                  {!allLoaded && (
                    <Button
                      className="uppercase tracking-[0.2em] font-medium px-12"
                      isDisabled={isLoadingMore}
                      isLoading={isLoadingMore}
                      radius="none"
                      size="lg"
                      variant="bordered"
                      onPress={handleLoadMore}
                    >
                      Load More
                    </Button>
                  )}
                  <p className="text-xs text-default-400 tracking-wide">
                    {products.length} of {total} products
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

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
