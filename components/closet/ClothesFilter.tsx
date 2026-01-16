"use client";
import { useState } from "react";
import {
  Checkbox,
  CheckboxGroup,
  Slider,
  Button,
  Accordion,
  AccordionItem,
  ScrollShadow,
} from "@heroui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { colors, occasions, seasons, categories } from "@/lib/data";

// Re-exporting this interface so it can be used by the parent page
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

  // Helper to style the accordion titles
  const itemClasses = {
    title: "text-xs font-bold uppercase tracking-widest text-foreground",
    trigger: "py-4",
    content: "pb-4 pl-1",
  };

  return (
    <div className="w-full h-full flex flex-col bg-background border-r border-divider pr-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 pt-1">
        <h3 className="text-xl font-black uppercase tracking-tighter italic">
          Refine
        </h3>
        <Button
          onPress={handleClearFilters}
          variant="light"
          size="sm"
          radius="none"
          className="text-xs uppercase tracking-wider text-default-400 data-[hover=true]:text-foreground"
          startContent={<XMarkIcon className="w-3 h-3" />}
        >
          Clear All
        </Button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <ScrollShadow hideScrollBar className="flex-1 -mr-2 pr-2">
        <Accordion
          selectionMode="multiple"
          defaultExpandedKeys={["category", "price"]}
          itemClasses={itemClasses}
          showDivider={false}
        >
          {/* CATEGORY */}
          <AccordionItem key="category" aria-label="Category" title="Category">
            <CheckboxGroup
              value={selectedCategories}
              onValueChange={setSelectedCategories}
              classNames={{ wrapper: "gap-3" }}
            >
              {categories.map((category) => (
                <Checkbox
                  key={category}
                  value={category}
                  size="sm"
                  radius="none" // Square checkboxes look more high-fashion
                  classNames={{
                    label: "text-sm text-default-500 capitalize ml-1",
                  }}
                >
                  {category}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </AccordionItem>

          {/* PRICE */}
          <AccordionItem key="price" aria-label="Price" title="Price Range">
            <div className="px-2 pt-2">
              <Slider
                step={10}
                maxValue={500}
                minValue={0}
                value={priceRange}
                formatOptions={{ style: "currency", currency: "USD" }}
                onChange={(value) => setPriceRange(value as [number, number])}
                size="sm"
                color="foreground"
                classNames={{
                  thumb: "bg-foreground w-4 h-4 after:bg-foreground",
                  track: "bg-default-200 h-1",
                  filler: "bg-foreground",
                }}
              />
              <div className="flex justify-between mt-4 text-xs font-medium text-default-500">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}+</span>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem key="color" aria-label="Color" title="Color">
            <CheckboxGroup
              value={selectedColors}
              onValueChange={setSelectedColors}
              orientation="horizontal"
              classNames={{ wrapper: "gap-3 grid grid-cols-2" }}
            >
              {colors.map((color) => (
                <Checkbox
                  key={color}
                  value={color}
                  size="sm"
                  radius="none"
                  classNames={{
                    label: "text-small text-default-500 capitalize ml-1",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 border border-default-200 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    {color}
                  </div>
                </Checkbox>
              ))}
            </CheckboxGroup>
          </AccordionItem>

          {availableBrands.length > 0 ? (
            <AccordionItem key="brand" aria-label="Brand" title="Brand">
              <CheckboxGroup
                value={selectedBrands}
                onValueChange={setSelectedBrands}
                classNames={{ wrapper: "gap-3" }}
              >
                {availableBrands.map((brand) => (
                  <Checkbox
                    key={brand}
                    value={brand}
                    size="sm"
                    radius="none"
                    classNames={{ label: "text-sm text-default-500 ml-1" }}
                  >
                    {brand}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </AccordionItem>
          ) : null}

          <AccordionItem key="occasion" aria-label="Occasion" title="Occasion">
            <CheckboxGroup
              value={selectedOccasions}
              onValueChange={setSelectedOccasions}
              classNames={{ wrapper: "gap-3" }}
            >
              {occasions.map((occasion) => (
                <Checkbox
                  key={occasion}
                  value={occasion}
                  size="sm"
                  radius="none"
                  classNames={{
                    label: "text-sm text-default-500 capitalize ml-1",
                  }}
                >
                  {occasion}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </AccordionItem>

          <AccordionItem key="season" aria-label="Season" title="Season">
            <CheckboxGroup
              value={selectedSeasons}
              onValueChange={setSelectedSeasons}
              classNames={{ wrapper: "gap-3" }}
            >
              {seasons.map((season) => (
                <Checkbox
                  key={season}
                  value={season}
                  size="sm"
                  radius="none"
                  classNames={{
                    label: "text-sm text-default-500 capitalize ml-1",
                  }}
                >
                  {season}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </AccordionItem>
        </Accordion>
      </ScrollShadow>

      {/* FOOTER ACTIONS */}
      <div className="pt-6 mt-auto">
        <Button
          fullWidth
          color="primary"
          radius="none"
          className="font-bold uppercase tracking-widest h-12 text-xs shadow-lg shadow-primary/20"
          onPress={handleApplyFilters}
        >
          View Results
        </Button>
      </div>
    </div>
  );
}
