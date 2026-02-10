"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Button, useDisclosure } from "@heroui/react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { toast } from "sonner";

import ProductCard from "@/components/catalog/ProductCard";
import ProductCardSkeleton from "@/components/catalog/ProductCardSkeleton";
import AddToClosetModal from "@/components/catalog/AddToClosetModal";
import WardrobeHeader, { useSearchHistory } from "@/components/WardrobeHeader";
import type { GlobalProduct } from "@/lib/types/globalproduct";

interface CatalogResponse {
  products: GlobalProduct[];
  total: number;
  limit: number;
  offset: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CatalogPage() {
  const { status } = useSession();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Selected product for modal
  const [selectedProduct, setSelectedProduct] = useState<GlobalProduct | null>(
    null
  );

  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "gallery">("grid");
  const [sortBy, setSortBy] = useState("recent");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const { history, addSearch, clearHistory } = useSearchHistory();

  // Filters State (simplified for catalog)
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products
  const { data, isLoading } = useSWR<CatalogResponse>("/api/catalog", fetcher, {
    revalidateOnFocus: false,
  });

  const products = data?.products || [];

  // Client-side search filtering
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const lowerQuery = searchQuery.toLowerCase();

    return products.filter((product) => {
      if (product.name.toLowerCase().includes(lowerQuery)) return true;
      if (product.brand?.toLowerCase().includes(lowerQuery)) return true;
      if (product.category?.toLowerCase().includes(lowerQuery)) return true;
      return false;
    });
  }, [products, searchQuery]);

  // Sorted products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "price":
        return sorted.sort(
          (a, b) => (b.originalprice || 0) - (a.originalprice || 0)
        );
      case "recent":
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdat || 0).getTime() -
            new Date(a.createdat || 0).getTime()
        );
    }
  }, [filteredProducts, sortBy]);

  // Products grouped by category for gallery view
  const productsByCategory = useMemo(() => {
    const groups: Record<string, GlobalProduct[]> = {};
    sortedProducts.forEach((product) => {
      const cat = product.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(product);
    });
    return Object.entries(groups).sort(
      ([, itemsA], [, itemsB]) => itemsB.length - itemsA.length
    );
  }, [sortedProducts]);

  // Search suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQuery = searchQuery.toLowerCase();
    const terms = new Set<string>();
    filteredProducts.forEach((product) => {
      if (product.name.toLowerCase().includes(lowerQuery))
        terms.add(product.name);
      if (product.brand?.toLowerCase().includes(lowerQuery))
        terms.add(product.brand);
      if (product.category?.toLowerCase().includes(lowerQuery))
        terms.add(product.category);
    });
    return Array.from(terms).slice(0, 5);
  }, [filteredProducts, searchQuery]);

  const handleSearchSubmit = (term: string) => {
    setSearchQuery(term);
    addSearch(term);
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

  return (
    <div className="wardrobe-page-container min-h-screen">
      <WardrobeHeader
        title="Catalog"
        subtitle={
          isLoading ? (
            <div className="h-5 w-32 bg-default-200 animate-pulse rounded" />
          ) : (
            <>{sortedProducts.length} Products</>
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
        onAddNew={() => {}}
        actionLabel=""
      />

      <div className="flex gap-8 relative">
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="wardrobe-grid">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="wardrobe-empty-state">
              <p className="text-xl font-light italic text-default-400 mb-6">
                {products.length === 0
                  ? "No products in the catalog yet."
                  : "No products match your search."}
              </p>
              {searchQuery && (
                <Button
                  variant="light"
                  radius="none"
                  className="uppercase tracking-widest text-xs"
                  onPress={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="wardrobe-grid">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCloset={handleAddToCloset}
                    />
                  ))}
                </div>
              )}

              {/* Gallery View */}
              {viewMode === "gallery" && (
                <div className="space-y-16 pb-20">
                  {productsByCategory.map(([category, items]) => (
                    <div key={category} className="space-y-4">
                      <div className="wardrobe-category-header">
                        <h2 className="wardrobe-category-title capitalize">
                          {category}
                        </h2>
                        <div className="h-[1px] flex-1 bg-default-200"></div>
                        <span className="wardrobe-category-count">
                          {items.length}
                        </span>
                      </div>
                      <div className="wardrobe-gallery-row">
                        {items.map((product) => (
                          <div
                            key={product.id}
                            className="wardrobe-gallery-item"
                          >
                            <ProductCard
                              product={product}
                              onAddToCloset={handleAddToCloset}
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

      {/* Add to Closet Modal */}
      <AddToClosetModal
        isOpen={isOpen}
        onClose={onClose}
        product={selectedProduct}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
