"use client";
import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Slider,
  Button,
  Divider,
  Chip,
  CardFooter,
} from "@heroui/react";

import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { colors, occasions, seasons, categories } from "@/lib/data";

export interface FilterOptions {
  categories: string[];
  colors: string[];
  seasons: string[];
  placesToWear: string[];
  priceRange: [number, number];
  brands: string[];
}

interface ClothesFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableBrands?: string[];
}

export default function ClothesFilter({
  onFilterChange,
  availableBrands = [],
}: ClothesFilterProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  const handleApplyFilters = () => {
    onFilterChange({
      categories: selectedCategories,
      colors: selectedColors,
      seasons: selectedSeasons,
      placesToWear: selectedOccasions,
      priceRange: priceRange,
      brands: selectedBrands,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSeasons([]);
    setSelectedOccasions([]);
    setSelectedBrands([]);
    setPriceRange([0, 500]);
    onFilterChange({
      categories: [],
      colors: [],
      seasons: [],
      placesToWear: [],
      priceRange: [0, 500],
      brands: [],
    });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedColors.length > 0 ||
    selectedSeasons.length > 0 ||
    selectedOccasions.length > 0 ||
    selectedBrands.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 500;

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Chip color="primary" size="sm" variant="flat">
              Active
            </Chip>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            color="danger"
            onPress={handleClearFilters}
            startContent={<XMarkIcon className="w-4 h-4" />}
            size="sm"
            variant="light"
          >
            Clear
          </Button>
        )}
      </CardHeader>
      <Divider />
      <CardBody className="gap-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Categories */}
        <div>
          <h4 className="font-semibold mb-3">Category</h4>
          <CheckboxGroup
            value={selectedCategories}
            onValueChange={setSelectedCategories}
          >
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <Checkbox key={category} value={category}>
                  <span className="capitalize">{category}</span>
                </Checkbox>
              ))}
            </div>
          </CheckboxGroup>
        </div>
        <Divider />
        {/* Colors */}
        <div>
          <h4 className="font-semibold mb-3">Color</h4>
          <CheckboxGroup
            value={selectedColors}
            onValueChange={setSelectedColors}
          >
            <div className="flex flex-col gap-2">
              {colors.map((color) => (
                <Checkbox key={color} value={color}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    <span className="capitalize">{color}</span>
                  </div>
                </Checkbox>
              ))}
            </div>
          </CheckboxGroup>
        </div>
        <Divider />
        {/* Price Range */}
        <div>
          <h4 className="font-semibold mb-3">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </h4>
          <Slider
            step={10}
            maxValue={500}
            minValue={0}
            value={priceRange}
            className="max-w-md"
            formatOptions={{ style: "currency", currency: "USD" }}
            onChange={(value) => setPriceRange(value as [number, number])}
          />
        </div>
        <Divider />
        {/* Seasons */}
        <div>
          <h4 className="font-semibold mb-3">Season</h4>
          <CheckboxGroup
            value={selectedSeasons}
            onValueChange={setSelectedSeasons}
          >
            <div className="flex flex-col gap-2">
              {seasons.map((season) => (
                <Checkbox key={season} value={season}>
                  <span className="capitalize">{season}</span>
                </Checkbox>
              ))}
            </div>
          </CheckboxGroup>
        </div>
        <Divider />
        {/* Places to Wear */}
        <div>
          <h4 className="font-semibold mb-3">Places to Wear</h4>
          <CheckboxGroup
            value={selectedOccasions}
            onValueChange={setSelectedOccasions}
          >
            <div className="flex flex-col gap-2">
              {occasions.map((occasion) => (
                <Checkbox key={occasion} value={occasion}>
                  <span className="capitalize">{occasion}</span>
                </Checkbox>
              ))}
            </div>
          </CheckboxGroup>
        </div>
        {/* Brands - only show if there are brands */}
        {availableBrands.length > 0 && (
          <>
            <Divider />
            <div>
              <h4 className="font-semibold mb-3">Brand</h4>
              <CheckboxGroup
                value={selectedBrands}
                onValueChange={setSelectedBrands}
              >
                <div className="flex flex-col gap-2">
                  {availableBrands.map((brand) => (
                    <Checkbox key={brand} value={brand}>
                      {brand}
                    </Checkbox>
                  ))}
                </div>
              </CheckboxGroup>
            </div>
          </>
        )}
      </CardBody>
      <CardFooter>
        {/* Apply Button */}
        <Button color="primary" className="w-full" onPress={handleApplyFilters}>
          Apply Filters
        </Button>
      </CardFooter>
    </Card>
  );
}
