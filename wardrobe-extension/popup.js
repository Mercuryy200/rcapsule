document.getElementById("importBtn").addEventListener("click", async () => {
  const button = document.getElementById("importBtn");
  const status = document.getElementById("status");

  button.disabled = true;
  status.textContent = "Extracting data...";
  status.className = "loading";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractProductData,
    });

    const productData = results[0].result;

    if (!productData || !productData.name) {
      status.textContent = "Could not extract product data";
      status.className = "error";
      button.disabled = false;
      return;
    }

    status.textContent = "Sending to wardrobe...";

    const PRODUCTION_URL =
      "https://vesticloset.vercel.app/api/extension/import";

    const response = await fetch(PRODUCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(productData),
    });

    if (response.ok) {
      status.textContent = "Successfully imported!";
      status.className = "success";
      setTimeout(() => window.close(), 1500);
    } else {
      const error = await response.json();
      status.textContent = error.message || "Import failed";
      status.className = "error";
      button.disabled = false;
    }
  } catch (error) {
    console.error("Import error:", error);
    status.textContent = "Error: " + error.message;
    status.className = "error";
    button.disabled = false;
  }
});

/**
 * This function runs INSIDE the web page context.
 * It cannot access variables from the popup scope.
 */
function extractProductData() {
  const data = {
    name: "",
    brand: "",
    price: "",
    imageUrl: "",
    link: window.location.href,
    description: "",
    size: "",
  };

  // --- 1. JSON-LD Extraction (Structured Data) ---
  const jsonLdScripts = document.querySelectorAll(
    'script[type="application/ld+json"]'
  );
  jsonLdScripts.forEach((script) => {
    try {
      const json = JSON.parse(script.textContent);
      const products = Array.isArray(json) ? json : [json];
      const product = products.find((p) => p["@type"] === "Product");

      if (product) {
        if (product.name) data.name = product.name;
        if (product.brand) {
          data.brand =
            typeof product.brand === "object"
              ? product.brand.name
              : product.brand;
        }
        if (product.offers) {
          const offer = Array.isArray(product.offers)
            ? product.offers[0]
            : product.offers;
          if (offer?.price) data.price = String(offer.price);
        }
        if (product.description) data.description = product.description;
      }
    } catch (e) {
      console.error("JSON-LD parse error:", e);
    }
  });

  // --- 2. Fallback Text Scraping ---
  if (!data.name) {
    data.name =
      document.querySelector('h1[class*="product"]')?.textContent?.trim() ||
      document.querySelector("h1")?.textContent?.trim() ||
      document.querySelector("#pdpProductNameText")?.textContent?.trim() ||
      "";
  }

  if (!data.brand) {
    data.brand =
      document.querySelector("#pdpBrandNameText")?.textContent?.trim() ||
      document.querySelector('meta[property="og:site_name"]')?.content ||
      new URL(window.location.href).hostname.replace("www.", "").split(".")[0];

    // Formatting: Capitalize first letter
    if (data.brand) {
      data.brand = data.brand.charAt(0).toUpperCase() + data.brand.slice(1);
    }
  }

  if (!data.price) {
    const zaraPrice = document.querySelector("span.money-amount__main");
    data.price =
      zaraPrice?.textContent?.trim() ||
      document.querySelector('[id*="pdpPrice"]')?.textContent?.trim() ||
      document.querySelector('[class*="price"]')?.textContent?.trim() ||
      "";

    // Clean price (remove symbols)
    const match = data.price.match(/[\d,]+\.?\d*/);
    if (match) data.price = match[0].replace(/,/g, "");
  }

  // --- 3. SIZE EXTRACTION ---

  // Strategy A: URL Parameters (Garage, Revolve, Uniqlo)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
      if (key.toLowerCase().endsWith("size") || key === "sz") {
        data.size = decodeURIComponent(value);
        break;
      }
    }
  } catch (e) {}

  // Strategy B: Aritzia Specific (FIXED)
  if (!data.size) {
    // Target the inner message element (contains "Size 2XS")
    // instead of the button (which contains "chevron" and "Shorts")
    const aritziaText = document.querySelector(
      '[data-testid="siv-select-size-msg"]'
    );

    if (aritziaText) {
      let text = aritziaText.textContent.trim();
      // Clean up: "Size 2XS — Sold Out" -> "2XS"
      text = text.replace(/^Size\s*/i, "");
      text = text.split("—")[0].trim();
      text = text.split("-")[0].trim();
      data.size = text;
    }
  }

  // Strategy C: Generic Active Selection
  if (!data.size) {
    const activeSize =
      document.querySelector(".size-selector .active") ||
      document.querySelector('[class*="size"] [aria-checked="true"]') ||
      document.querySelector('input[name="size"]:checked + label') ||
      document.querySelector('.selected[class*="size"]');

    if (activeSize) {
      data.size = activeSize.textContent.trim();
    }
  }

  // Final Size Cleanup (Global Safety Net)
  if (data.size) {
    // Remove common icon text if it snuck in
    data.size = data.size
      .replace(/chevron/gi, "")
      .replace(/down/gi, "")
      .trim();
    // Remove newlines
    data.size = data.size.replace(/\n/g, " ");
  }

  // --- 4. IMAGE EXTRACTION ---

  // Helper: Extract valid URL, ignoring base64 placeholders
  const getValidSrc = (img) => {
    if (!img) return null;

    // Check srcset first (highest quality)
    let candidate = img.srcset || img.dataset.srcset;
    if (candidate) {
      // Split by ", " to handle URLs with internal commas safely
      const urls = candidate.split(/,\s+/);
      const lastEntry = urls[urls.length - 1].trim();
      return lastEntry.split(" ")[0]; // Remove width descriptor
    }

    // Check src, ignore data:image placeholders
    const src = img.src || img.dataset.src;
    if (src && !src.startsWith("data:")) return src;

    return img.dataset.src || null;
  };

  // STRATEGY 0: Brand-Specific Logic
  if (!data.imageUrl) {
    const isAritzia = window.location.hostname.includes("aritzia");
    const isZara = window.location.hostname.includes("zara");
    const isSsense = window.location.hostname.includes("ssense");

    if (isSsense) {
      const ssenseImg =
        document.querySelector("img.product-detail-new") ||
        document.querySelector('img[data-test="product-image"]');
      if (ssenseImg) data.imageUrl = getValidSrc(ssenseImg);
    }

    if (isAritzia) {
      // Prioritize the <a> tag href which has the high-res zoom image
      const offBodyLink = document.querySelector('a[href*="_off_"]');
      const offBodyImg = document.querySelector('img[src*="_off_"]');
      if (offBodyLink) data.imageUrl = offBodyLink.href;
      else if (offBodyImg) data.imageUrl = offBodyImg.src;
    }

    if (isZara) {
      // Find "Front view" image that is NOT a tiny thumbnail
      const allImages = Array.from(document.querySelectorAll("img"));
      const flatLay = allImages.find((img) => {
        const alt = (img.alt || "").toLowerCase();
        const width = img.naturalWidth || img.width || 0;
        return alt.includes("front view") && width > 200;
      });
      if (flatLay) data.imageUrl = flatLay.src;
    }
  }

  // STRATEGY 1: Active/Visible Image (Fallback)
  if (!data.imageUrl) {
    const activeImage =
      document.querySelector(".product-detail-images__image-container img") ||
      document.querySelector(".media-image__image") ||
      document.querySelector('[aria-hidden="false"] img[class*="product"]');

    if (activeImage) data.imageUrl = getValidSrc(activeImage);
  }

  // STRATEGY 2: Largest Visible Image (Last Resort)
  if (!data.imageUrl) {
    const images = Array.from(document.querySelectorAll("img"));
    const largeImages = images.filter((img) => {
      const valid = getValidSrc(img);
      return (img.naturalWidth > 300 || img.width > 300) && valid;
    });

    if (largeImages.length > 0) {
      data.imageUrl = getValidSrc(largeImages[0]);
    }
  }

  // Final Cleanup
  if (data.imageUrl) {
    if (data.imageUrl.startsWith("//"))
      data.imageUrl = "https:" + data.imageUrl;
    // Remove query params if they contain spaces or are just messy
    if (data.imageUrl.includes(" "))
      data.imageUrl = data.imageUrl.split(" ")[0];
  }

  return data;
}
