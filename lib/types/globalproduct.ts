export interface GlobalProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description?: string;
  slug?: string;
  sku?: string;
  retaillink?: string;
  imageurl?: string;
  processed_image_url?: string;
  colors?: string[];
  materials?: string;
  sustainability?: string;
  originalprice?: number;
  currency?: string;
  sizes?: string[];
  inStock?: boolean;
  source?: string;
  externalId?: string;
  createdat: string;
  updatedat: string;
  lastScrapedAt?: string;
  scrapingStatus?: "active" | "discontinued" | "error";
}
