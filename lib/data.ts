export const categories = [
  //tops
  "t-shirt",
  "blouse",
  "shirt",
  "tank top",
  "bodysuit",
  "crop top",
  "corset",
  "vest",
  "tights",
  "tube top",

  //sweaters
  "sweater",
  "cardigan",
  "hoodie",
  "sweatshirt",

  //bottoms
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
  "beanie",
  "cap",

  "underwear",
  "swimwear",
  "activewear",
].sort();

export const colors = [
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

  "gold",
  "silver",
  "rose gold",

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
export const colorMap: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  gray: "#808080",
  charcoal: "#36454F",
  cream: "#FFFDD0",
  beige: "#F5F5DC",
  tan: "#D2B48C",
  brown: "#8B4513",
  navy: "#000080",
  olive: "#808000",

  gold: "#FFD700",
  silver: "#C0C0C0",
  "rose gold": "#B76E79",

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

export const materials = [
  "cotton",
  "polyester",
  "wool",
  "silk",
  "linen",
  "denim",
  "leather",
  "suede",
  "cashmere",
  "velvet",
  "satin",
  "chiffon",
  "nylon",
  "spandex",
  "rayon",
  "acrylic",
  "modal",
  "bamboo",
  "hemp",
  "fleece",
  "tweed",
  "corduroy",
  "canvas",
  "jersey",
  "mesh",
  "lace",
  "faux leather",
  "faux fur",
  "synthetic blend",
].sort();

export const conditions = ["new", "excellent", "good", "fair", "poor"] as const;

export const purchaseTypes = [
  "retail",
  "thrift",
  "vintage",
  "gift",
  "secondhand",
];

export const silhouettes = [
  "Fitted",
  "Relaxed",
  "Oversized",
  "Tailored",
  "Slim",
  "Regular",
  "Loose",
  "A-Line",
  "Bodycon",
  "Straight",
];

export const styles = [
  "Casual",
  "Formal",
  "Business",
  "Streetwear",
  "Minimalist",
  "Vintage",
  "Bohemian",
  "Preppy",
  "Athletic",
  "Grunge",
  "Classic",
  "Trendy",
];

export const necklines = [
  "Crew",
  "V-Neck",
  "Scoop",
  "Boat",
  "Turtleneck",
  "Cowl",
  "Off-Shoulder",
  "Halter",
  "Square",
  "Sweetheart",
];

export const patterns = [
  "Solid",
  "Striped",
  "Plaid",
  "Floral",
  "Polka Dot",
  "Animal Print",
  "Geometric",
  "Abstract",
  "Checkered",
  "Paisley",
];

export const lengths = [
  "Cropped",
  "Regular",
  "Long",
  "Mini",
  "Midi",
  "Maxi",
  "Knee-Length",
  "Ankle-Length",
  "Floor-Length",
];

export const fits = [
  "Tight",
  "Fitted",
  "Regular",
  "Relaxed",
  "Loose",
  "Oversized",
];

export const currencies = ["CAD", "USD", "EUR", "GBP"];
