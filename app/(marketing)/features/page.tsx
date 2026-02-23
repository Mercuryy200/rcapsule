"use client";

import { Card, CardBody, Button } from "@heroui/react";
import {
  SparklesIcon,
  TagIcon,
  ChartBarIcon,
  CloudArrowDownIcon,
  SwatchIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const features = [
  {
    title: "Auto-Import",
    desc: "Paste a product link from your favorite store. We scrape the image, brand, and price automatically.",
    icon: CloudArrowDownIcon,
  },
  {
    title: "Smart Taxonomy",
    desc: "Organize by Category, Season, and Occasion. Filter your entire wardrobe in milliseconds.",
    icon: TagIcon,
  },
  {
    title: "Color Analysis",
    desc: "Visualize your color palette. See which shades dominate your style and identify gaps.",
    icon: SwatchIcon,
  },
  {
    title: "Cost Per Wear",
    desc: "Track purchase dates and usage (coming soon) to understand the real value of your investments.",
    icon: ChartBarIcon,
  },
  {
    title: "Digital Styling",
    desc: "Plan outfits from your phone. No more digging through piles of clothes on the floor.",
    icon: DevicePhoneMobileIcon,
  },
  {
    title: "Wishlist Integration",
    desc: "Keep track of items you own vs. items you covet in one unified interface.",
    icon: SparklesIcon,
  },
];

export default function FeaturesPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic mb-2">
          The Operating System <br /> For Your Closet
        </h1>
        <p className="text-default-500 uppercase tracking-widest text-sm">
          Built for the modern collector
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((f, i) => (
          <Card
            key={i}
            className="bg-content1 shadow-sm border border-default-100"
            radius="sm"
          >
            <CardBody className="p-8 gap-4">
              <f.icon className="w-8 h-8 text-foreground stroke-1" />
              <div>
                <h3 className="font-bold uppercase tracking-wider text-sm mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-default-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          as={Link}
          className="bg-foreground text-background font-bold uppercase tracking-widest px-12"
          href="/closet"
          radius="full"
          size="lg"
        >
          Start Digitizing
        </Button>
      </div>
    </div>
  );
}
