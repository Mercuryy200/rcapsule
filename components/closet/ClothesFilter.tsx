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
import * as Sentry from "@sentry/nextjs";

import {
  colors,
  occasions,
  seasons,
  categories,
  colorMap,
  styles,
  conditions,
} from "@/lib/data";

export interface FilterOptions {
  categories: string[];
  colors: string[];
  seasons: string[];
  placesToWear: string[];
  priceRange: [number, number];
  brands: string[];
  styles: string[];
  conditions: string[];
}

interface ClothesFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableBrands?: string[];
  maxPrice?: number;
}

export default function ClothesFilter({
  onFilterChange,
  availableBrands = [],
  maxPrice = 500,
}: ClothesFilterProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);

  const handleApplyFilters = () => {
    Sentry.addBreadcrumb({
      category: "user-action",
      message: "User applied filters",
      level: "info",
      data: {
        filters: {
          categories: selectedCategories,
          colors: selectedColors,
          seasons: selectedSeasons,
          styles: selectedStyles,
          conditions: selectedConditions,
        },
      },
    });

    onFilterChange({
      categories: selectedCategories,
      colors: selectedColors,
      seasons: selectedSeasons,
      placesToWear: selectedOccasions,
      priceRange: priceRange,
      brands: selectedBrands,
      styles: selectedStyles,
      conditions: selectedConditions,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSeasons([]);
    setSelectedOccasions([]);
    setSelectedBrands([]);
    setSelectedStyles([]);
    setSelectedConditions([]);
    setPriceRange([0, maxPrice]);
    onFilterChange({
      categories: [],
      colors: [],
      seasons: [],
      placesToWear: [],
      priceRange: [0, maxPrice],
      brands: [],
      styles: [],
      conditions: [],
    });
  };

  const itemClasses = {
    title: "text-xs font-bold uppercase tracking-widest text-foreground",
    trigger: "py-4",
    content: "pb-4 pl-1",
  };

  return (
    <div className="w-full h-full flex flex-col bg-background border-r border-divider pr-4">
      <div className="flex justify-between items-center mb-6 pt-1">
        <h3 className="text-xl font-black uppercase tracking-tighter italic">
          Refine
        </h3>
        <Button
          className="text-xs uppercase tracking-wider text-default-400 data-[hover=true]:text-foreground"
          radius="none"
          size="sm"
          startContent={<XMarkIcon className="w-3 h-3" />}
          variant="light"
          onPress={handleClearFilters}
        >
          Clear All
        </Button>
      </div>

      <ScrollShadow hideScrollBar className="flex-1 -mr-2 pr-2">
        <Accordion
          defaultExpandedKeys={["price"]}
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
              {categories.map((category) => (
                <Checkbox
                  key={category}
                  classNames={{
                    label: "text-sm text-default-500 capitalize ml-1",
                  }}
                  radius="none"
                  size="sm"
                  value={category}
                >
                  {category}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </AccordionItem>

          <AccordionItem key="price" aria-label="Price" title="Price Range">
            <div className="px-2 pt-2">
              <Slider
                classNames={{
                  thumb: "bg-foreground w-4 h-4 after:bg-foreground",
                  track: "bg-default-200 h-1",
                  filler: "bg-foreground",
                }}
                color="foreground"
                formatOptions={{ style: "currency", currency: "USD" }}
                maxValue={maxPrice}
                minValue={0}
                size="sm"
                step={10}
                value={priceRange}
                onChange={(value) => setPriceRange(value as [number, number])}
              />
              <div className="flex justify-between mt-4 text-xs font-medium text-default-500">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}+</span>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem key="color" aria-label="Color" title="Color">
            <CheckboxGroup
              classNames={{ wrapper: "gap-3 grid grid-cols-2" }}
              orientation="horizontal"
              value={selectedColors}
              onValueChange={setSelectedColors}
            >
              {colors.map((color) => (
                <Checkbox
                  key={color}
                  classNames={{
                    label: "text-small text-default-500 capitalize ml-1",
                  }}
                  radius="none"
                  size="sm"
                  value={color}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 border border-default-200 shadow-sm"
                      style={{ background: colorMap[color] || color }}
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
                classNames={{ wrapper: "gap-3" }}
                value={selectedBrands}
                onValueChange={setSelectedBrands}
              >
                {availableBrands.map((brand) => (
                  <Checkbox
                    key={brand}
                    classNames={{ label: "text-sm text-default-500 ml-1" }}
                    radius="none"
                    size="sm"
                    value={brand}
                  >
                    {brand}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </AccordionItem>
          ) : null}

          <AccordionItem key="style" aria-label="Style" title="Style">
            <CheckboxGroup
              classNames={{ wrapper: "gap-3" }}
              value={selectedStyles}
              onValueChange={setSelectedStyles}
            >
              {styles.map((style) => (
                <Checkbox
                  key={style}
                  classNames={{
                    label: "text-sm text-default-500 capitalize ml-1",
                  }}
                  radius="none"
                  size="sm"
                  value={style}
                >
                  {style}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </AccordionItem>

          <AccordionItem
            key="condition"
            aria-label="Condition"
            title="Condition"
          >
            <CheckboxGroup
              classNames={{ wrapper: "gap-3" }}
              value={selectedConditions}
              onValueChange={setSelectedConditions}
            >
              {conditions.map((condition) => (
                <Checkbox
                  key={condition}
                  classNames={{
                    label: "text-sm text-default-500 capitalize ml-1",
                  }}
                  radius="none"
                  size="sm"
                  value={condition}
                >
                  {condition}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </AccordionItem>

          <AccordionItem key="occasion" aria-label="Occasion" title="Occasion">
            <CheckboxGroup
              classNames={{ wrapper: "gap-3" }}
              value={selectedOccasions}
              onValueChange={setSelectedOccasions}
            >
              {occasions.map((occasion) => (
                <Checkbox
                  key={occasion}
                  classNames={{
                    label: "text-sm text-default-500 capitalize ml-1",
                  }}
                  radius="none"
                  size="sm"
                  value={occasion}
                >
                  {occasion}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </AccordionItem>

          <AccordionItem key="season" aria-label="Season" title="Season">
            <CheckboxGroup
              classNames={{ wrapper: "gap-3" }}
              value={selectedSeasons}
              onValueChange={setSelectedSeasons}
            >
              {seasons.map((season) => (
                <Checkbox
                  key={season}
                  classNames={{
                    label: "text-sm text-default-500 capitalize ml-1",
                  }}
                  radius="none"
                  size="sm"
                  value={season}
                >
                  {season}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </AccordionItem>
        </Accordion>
      </ScrollShadow>

      <div className="pt-6 mt-auto">
        <Button
          fullWidth
          className="font-bold uppercase tracking-widest h-12 text-xs shadow-lg shadow-primary/20"
          color="primary"
          radius="none"
          onPress={handleApplyFilters}
        >
          View Results
        </Button>
      </div>
    </div>
  );
}
