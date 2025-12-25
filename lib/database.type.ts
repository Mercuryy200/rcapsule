export interface Clothes {
  id: string;
  userId: string;
  name: string;
  brand?: string;
  category: string;
  price?: number;
  purchaseDate?: string; 
  colors?: string[];
  season?: string;
  size?: string;
  link?: string;
  imageUrl?: string;
  placesToWear?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Wardrobe {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

// NEW: Junction table types
export interface WardrobeClothes {
  id: string;
  wardrobeId: string;
  clothesId: string;
  addedAt: string;
  notes?: string;
}

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  season?: string;
  occasion?: string;
  imageUrl?: string;
  isFavorite: boolean;
  timesWorn: number;
  lastWornAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WardrobeOutfit {
  id: string;
  wardrobeId: string;
  outfitId: string;
  addedAt: string;
  notes?: string;
}

export interface OutfitClothes {
  id: string;
  outfitId: string;
  clothesId: string;
  layer?: number;
  createdAt: string;
}

export interface OutfitWearLog {
  id: string;
  outfitId: string;
  userId: string;
  wornAt: string;
  location?: string;
  notes?: string;
}

export interface ClothesWithWardrobes extends Clothes {
  wardrobes?: Wardrobe[];
}

export interface WardrobeWithClothes extends Wardrobe {
  clothes?: Clothes[];
}

export interface OutfitWithClothes extends Outfit {
  clothes?: Clothes[];
}

export interface WardrobeWithOutfits extends Wardrobe {
  outfits?: Outfit[];
}