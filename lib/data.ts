export const categories = [
  // Tops
  "t-shirt",
  "blouse",
  "shirt",
  "tank top",
  "bodysuit",
  "crop top",
  "corset",
  "vest",
  "tights",

  "sweater",
  "cardigan",
  "hoodie",
  "sweatshirt",

  "jeans",
  "pants",
  "trousers",
  "skirt",
  "shorts",
  "leggings",
  "sweatpants",
  "joggers",

  "dress",
  "jumpsuit",
  "romper",
  "co-ord set",

  "jacket",
  "coat",
  "blazer",
  "trench",
  "puffer",
  "bomber",

  "sneakers",
  "boots",
  "heels",
  "sandals",
  "loafers",
  "flats",
  "slides",

  "bag",
  "belt",
  "hat",
  "scarf",
  "sunglasses",
  "jewelry",

  "underwear",
  "swimwear",
  "activewear",
].sort();

export const colors = [
  // Neutrals
  "black",
  "white",
  "gray",
  "charcoal",
  "cream",
  "beige",
  "tan",
  "brown",
  "navy",
  "olive",

  // Metallics
  "gold",
  "silver",
  "rose gold",

  // Chromatics
  "red",
  "burgundy",
  "blue",
  "light blue",
  "green",
  "emerald",
  "pink",
  "hot pink",
  "yellow",
  "mustard",
  "purple",
  "lilac",
  "orange",
  "teal",
  "multicolor",
  "patterned",
];
// Map your display names to valid CSS values (Hex, RGB, or Gradients)
export const colorMap: Record<string, string> = {
  // Neutrals
  black: "#000000",
  white: "#FFFFFF",
  gray: "#808000", // or #9CA3AF for a nicer tailwind gray
  charcoal: "#36454F",
  cream: "#FFFDD0",
  beige: "#F5F5DC",
  tan: "#D2B48C",
  brown: "#8B4513",
  navy: "#000080",
  olive: "#808000",

  // Metallics
  gold: "#FFD700",
  silver: "#C0C0C0",
  "rose gold": "#B76E79",

  // Chromatics
  red: "#FF0000",
  burgundy: "#800020",
  blue: "#0000FF",
  "light blue": "#ADD8E6",
  green: "#008000",
  emerald: "#50C878",
  pink: "#FFC0CB",
  "hot pink": "#FF69B4",
  yellow: "#FFFF00",
  mustard: "#FFDB58",
  purple: "#800080",
  lilac: "#C8A2C8",
  orange: "#FFA500",
  teal: "#008080",

  // Patterns - You can use CSS Gradients here!
  multicolor:
    "linear-gradient(to right, red, orange, yellow, green, blue, purple)",
  patterned:
    "repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px)",
};

export const seasons = [
  "spring",
  "summer",
  "fall",
  "winter",
  "all-season",
  "transitional",
  "resort",
];

export const occasions = [
  "casual",
  "business casual",
  "work",
  "formal",
  "black tie",
  "date night",
  "party",
  "clubbing",
  "loungewear",
  "active/gym",
  "vacation",
  "school",
  "rain/snow",
];
