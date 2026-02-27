// Derived from the shape returned by /api/analytics (calculateAnalytics)

export interface ValueItem {
  id: string;
  name: string;
  brand?: string;
  price: number;
  timesworn: number;
  costPerWear: number;
}

export interface WornItem {
  id: string;
  name: string;
  brand?: string;
  timesworn?: number;
}

export interface NeverWornItem {
  id: string;
  name: string;
  brand?: string;
  price?: number;
}

export interface UnderutilizedItem {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  timesworn: number;
}

export interface CategoryStat {
  name: string;
  count: number;
  value: number;
  wears: number;
  avgPrice: number;
}

export interface ColorStat {
  color: string;
  count: number;
  percentage: number;
}

export interface BrandStat {
  name: string;
  count: number;
  value: number;
}

export interface Insight {
  type: "positive" | "warning" | "tip";
  category: string;
  message: string;
}

export interface Analytics {
  overview: {
    totalItems: number;
    totalOutfits: number;
    totalValue: number;
    avgPrice: number;
    savings: number;
    sustainabilityScore: number;
  };
  wear: {
    totalWears: number;
    avgWearsPerItem: number;
    avgCostPerWear: number;
    mostWornItems: WornItem[];
    neverWorn: number;
    neverWornItems: NeverWornItem[];
  };
  value: {
    bestValueItems: ValueItem[];
    worstValueItems: ValueItem[];
  };
  categories: CategoryStat[];
  colors: ColorStat[];
  brands: BrandStat[];
  underutilized: UnderutilizedItem[];
  seasonDistribution: Record<string, number>;
  styleDistribution: Record<string, number>;
  conditionBreakdown: Record<string, number>;
  purchaseTypeBreakdown: Record<string, number>;
  outfits: {
    total: number;
    avgWears: number;
  };
  insights: Insight[];
}
