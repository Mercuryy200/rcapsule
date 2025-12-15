"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  Chip,
  Spinner,
} from "@heroui/react";
import { FunnelIcon } from "@heroicons/react/24/outline";
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
}

export default function ClosetPage() {
  const { data: session, status } = useSession();
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
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchClothes();
    }
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

    if (activeFilterGroups.length === 0 && !isPriceFiltered) {
      return clothes;
    }

    return clothes.filter((item) => {
      let passesListFilters = true;

      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(item.category)
      ) {
        return false;
      }

      if (
        filters.brands.length > 0 &&
        item.brand &&
        !filters.brands.includes(item.brand)
      ) {
        return false;
      }

      let matchedAtLeastOneFilter = false;

      if (filters.colors.length > 0) {
        const hasMatchingColor = item.colors.some((color) =>
          filters.colors.includes(color)
        );
        if (hasMatchingColor) matchedAtLeastOneFilter = true;
      }

      if (filters.seasons.length > 0 && item.season) {
        if (filters.seasons.includes(item.season))
          matchedAtLeastOneFilter = true;
      }

      if (filters.placesToWear.length > 0) {
        const hasMatchingPlace = item.placesToWear.some((place) =>
          filters.placesToWear.includes(place)
        );
        if (hasMatchingPlace) matchedAtLeastOneFilter = true;
      }
      if (
        (filters.colors.length > 0 ||
          filters.seasons.length > 0 ||
          filters.placesToWear.length > 0) &&
        !matchedAtLeastOneFilter
      ) {
        return false;
      }

      if (isPriceFiltered && item.price !== null && item.price !== undefined) {
        if (
          item.price < filters.priceRange[0] ||
          item.price > filters.priceRange[1]
        ) {
          return false;
        }
      }

      return passesListFilters;
    });
  }, [clothes, filters]);

  const handleItemClick = (itemId: string) => {
    router.push(`/closet/${itemId}`);
  };

  const handleAddNew = () => {
    router.push("/closet/new");
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Closet</h1>
          <p className="text-gray-500 mt-1">
            {filteredClothes.length}{" "}
            {filteredClothes.length === 1 ? "item" : "items"}
            {filteredClothes.length !== clothes.length &&
              ` (${clothes.length} total)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? "solid" : "solid"}
            color={showFilters ? "primary" : "default"}
            startContent={<FunnelIcon className="w-5 h-5" />}
            onPress={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button color="primary" onPress={handleAddNew}>
            Add New Item
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <ClothesFilter
              onFilterChange={handleFilterChange}
              availableBrands={availableBrands}
            />
          </div>
        )}

        {/* Clothes Grid */}
        <div className="flex-1">
          {filteredClothes.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <p className="text-lg text-gray-500 mb-4">
                  {clothes.length === 0
                    ? "Your closet is empty"
                    : "No items match your filters"}
                </p>
                <Button color="primary" onPress={handleAddNew}>
                  Add Your First Item
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClothes.map((item) => (
                <Card
                  key={item.id}
                  className="w-full cursor-pointer hover:shadow-lg transition-shadow"
                  isPressable
                  onPress={() => handleItemClick(item.id)}
                >
                  <CardBody className="p-0 relative object-cover justify-center bg-white   h-90 w-full overflow-hidden">
                    <Image
                      alt={item.name}
                      src={item.imageUrl || "/images/placeholder.png"}
                    />
                  </CardBody>
                  <CardFooter className="flex flex-col items-start gap-2">
                    <div className="w-full text-left">
                      <p className="font-light text-md truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 capitalize"></p>
                      {item.brand && (
                        <p className="text-sm text-gray-600">
                          {item.brand} - {item.category}
                        </p>
                      )}
                      {item.price && (
                        <p className="text-sm font-light">${item.price}</p>
                      )}
                    </div>
                    {item.colors && item.colors.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.colors.map((color) => (
                          <Chip key={color} size="sm" variant="solid">
                            {color}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
