console.log("Wardrobe Import extension loaded");

// ============================================================================
// MESSAGE LISTENER
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_LISTING_PRODUCTS") {
    extractListingProducts().then(sendResponse);
    return true;
  }

  if (request.action === "SCROLL_AND_LOAD_ALL") {
    scrollAndLoadAll().then(sendResponse);
    return true;
  }

  if (request.action === "CHECK_IS_LISTING_PAGE") {
    sendResponse({ isListing: checkIsListingPage() });
    return false;
  }
});

// ============================================================================
// LISTING PAGE DETECTION
// ============================================================================

function checkIsListingPage() {
  if (!window.location.hostname.includes("aritzia")) return false;
  if (window.location.pathname.includes("/product/")) return false;
  const links = document.querySelectorAll('a[href*="/product/"]');
  return links.length > 2;
}

// ============================================================================
// AUTO-SCROLL TO LOAD ALL PRODUCTS
// ============================================================================

async function scrollAndLoadAll() {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let previousHeight = 0;
  let currentHeight = document.body.scrollHeight;
  let noChangeCount = 0;
  const MAX_NO_CHANGE = 3;
  const SCROLL_DELAY = 1500;

  while (noChangeCount < MAX_NO_CHANGE) {
    previousHeight = currentHeight;

    // Try to find and click any "load more" / "show more" button
    // Aritzia uses data-testid attributes, so check those too
    const loadMoreBtn =
      document.querySelector('[data-testid*="load-more"]') ||
      document.querySelector('[data-testid*="show-more"]') ||
      document.querySelector('[data-testid*="loadMore"]') ||
      document.querySelector('[data-testid*="showMore"]') ||
      document.querySelector(".show-more button") ||
      document.querySelector("button.more") ||
      findButtonByText("load more") ||
      findButtonByText("show more");

    if (loadMoreBtn && !loadMoreBtn.disabled) {
      console.log("Clicking load more button");
      loadMoreBtn.click();
      await wait(2500);
    }

    // Scroll to bottom
    window.scrollTo(0, document.body.scrollHeight);
    await wait(SCROLL_DELAY);

    currentHeight = document.body.scrollHeight;

    if (currentHeight === previousHeight) {
      noChangeCount++;
    } else {
      noChangeCount = 0;
    }

    // Count unique products
    const total = countUniqueProducts();
    chrome.runtime
      .sendMessage({
        action: "SCROLL_PROGRESS",
        totalProducts: total,
        scrollComplete: false,
      })
      .catch(() => {});
  }

  window.scrollTo(0, 0);

  return {
    complete: true,
    totalProducts: countUniqueProducts(),
    pageHeight: currentHeight,
  };
}

function findButtonByText(text) {
  const buttons = document.querySelectorAll("button");
  for (const btn of buttons) {
    if (btn.textContent.toLowerCase().trim().includes(text)) return btn;
  }
  return null;
}

function countUniqueProducts() {
  const links = document.querySelectorAll('a[href*="/product/"]');
  const urls = new Set();
  links.forEach((a) => {
    const base = a.href.split("?")[0].replace(/\/$/, "");
    urls.add(base);
  });
  return urls.size;
}

// ============================================================================
// CARD BOUNDARY DETECTION
// ============================================================================

// Walks up from a product link to find the card boundary.
// The card is the deepest ancestor that contains links to ONLY this product.
// Once the parent contains links to OTHER products, we've gone too far.
function findCardBoundary(link) {
  const thisProduct = link.href.split("?")[0].replace(/\/$/, "");
  let el = link;

  while (el.parentElement) {
    const parent = el.parentElement;
    const parentLinks = parent.querySelectorAll('a[href*="/product/"]');
    const hasOtherProducts = Array.from(parentLinks).some((l) => {
      const otherUrl = l.href.split("?")[0].replace(/\/$/, "");
      return otherUrl !== thisProduct;
    });

    if (hasOtherProducts) {
      // Parent contains other products — el is the card boundary
      return el;
    }

    el = parent;
  }

  return el;
}

// ============================================================================
// PRODUCT DATA EXTRACTION FROM CARD
// ============================================================================

function extractNameFromCard(card, productLinks) {
  // Strategy 1: Find a link to this product that has text content (not just an image)
  for (const link of productLinks) {
    const text = link.textContent?.trim();
    if (text && text.length > 2 && !text.match(/^\$/) && !link.querySelector("img")) {
      return text.split("\n")[0].trim();
    }
  }

  // Strategy 2: Find data-testid elements that might be the name
  const testIdEls = card.querySelectorAll("[data-testid]");
  for (const el of testIdEls) {
    const testId = el.getAttribute("data-testid");
    if (
      testId.includes("name") ||
      testId.includes("title") ||
      testId.includes("product-name")
    ) {
      const text = el.textContent?.trim();
      if (text) return text;
    }
  }

  // Strategy 3: Find a text-only link
  for (const link of productLinks) {
    const text = link.textContent?.trim();
    if (text && text.length > 2) {
      // Strip out price-like text
      const cleaned = text.replace(/\$[\d,.]+/g, "").trim();
      if (cleaned.length > 2) return cleaned.split("\n")[0].trim();
    }
  }

  // Strategy 4: Use the alt text from any product image
  const img = card.querySelector("img[alt]");
  if (img?.alt && img.alt.length > 2) return img.alt.trim();

  return "";
}

function extractPriceFromCard(card) {
  // Strategy 1: data-testid with "price" in it
  const testIdEls = card.querySelectorAll("[data-testid]");
  for (const el of testIdEls) {
    const testId = el.getAttribute("data-testid");
    if (testId.includes("price")) {
      const text = el.textContent?.trim();
      const match = text?.match(/\$?([\d,]+\.?\d*)/);
      if (match) return match[1].replace(/,/g, "");
    }
  }

  // Strategy 2: Find any text with a $ sign inside the card
  const allText = card.innerText || card.textContent || "";
  // Find all price-like patterns, prefer the last one (usually the sale/current price)
  const priceMatches = allText.match(/\$\s*([\d,]+\.?\d*)/g);
  if (priceMatches && priceMatches.length > 0) {
    // Use the last price (often the current/sale price)
    const lastPrice = priceMatches[priceMatches.length - 1];
    const match = lastPrice.match(/([\d,]+\.?\d*)/);
    if (match) return match[1].replace(/,/g, "");
  }

  return "";
}

function extractImageFromCard(card, productLinks) {
  // Strategy 1: img inside a product link (the main product image)
  for (const link of productLinks) {
    const img = link.querySelector("img");
    if (img) {
      return getBestImageUrl(img);
    }
  }

  // Strategy 2: Any img with an aritzia src
  const aritziaImg = card.querySelector("img[src*='aritzia']");
  if (aritziaImg) return getBestImageUrl(aritziaImg);

  // Strategy 3: First img in the card
  const anyImg = card.querySelector("img");
  if (anyImg) return getBestImageUrl(anyImg);

  return "";
}

function getBestImageUrl(img) {
  // Prefer srcset for higher resolution
  if (img.srcset) {
    const sources = img.srcset.split(",").map((s) => s.trim().split(" ")[0]);
    const best = sources[sources.length - 1];
    if (best) return normalizeUrl(best);
  }
  const src = img.src || img.dataset.src || "";
  return normalizeUrl(src);
}

function normalizeUrl(url) {
  if (!url) return "";
  if (url.startsWith("//")) url = "https:" + url;
  if (url.startsWith("data:")) return "";
  return url.split(" ")[0];
}

function extractBrandFromCard(card) {
  // Aritzia sub-brands: Wilfred, Babaton, TNA, Sunday Best, Wilfred Free, etc.
  const testIdEls = card.querySelectorAll("[data-testid]");
  for (const el of testIdEls) {
    const testId = el.getAttribute("data-testid");
    if (testId.includes("brand")) {
      return el.textContent?.trim() || "";
    }
  }
  return "";
}

// ============================================================================
// LISTING PAGE PRODUCT EXTRACTION (Pass 1)
// ============================================================================

async function extractListingProducts() {
  const products = [];
  const seenUrls = new Set();

  // Find ALL product links on the page
  const allLinks = Array.from(
    document.querySelectorAll('a[href*="/product/"]'),
  );

  console.log(`Found ${allLinks.length} total product links`);

  // Group links by base product URL (strip query params like ?color=)
  const productGroups = new Map();
  for (const link of allLinks) {
    const baseUrl = link.href.split("?")[0].replace(/\/$/, "");
    if (!productGroups.has(baseUrl)) {
      productGroups.set(baseUrl, []);
    }
    productGroups.get(baseUrl).push(link);
  }

  console.log(`Grouped into ${productGroups.size} unique products`);

  for (const [baseUrl, links] of productGroups) {
    if (seenUrls.has(baseUrl)) continue;
    seenUrls.add(baseUrl);

    try {
      // Find the card boundary by walking up from the first image-bearing link
      const imageLink = links.find((l) => l.querySelector("img"));
      const primaryLink = imageLink || links[0];
      const card = findCardBoundary(primaryLink);

      // Get all links to this product within the card
      const cardProductLinks = Array.from(
        card.querySelectorAll('a[href*="/product/"]'),
      ).filter(
        (l) => l.href.split("?")[0].replace(/\/$/, "") === baseUrl,
      );

      const name = extractNameFromCard(card, cardProductLinks);
      const price = extractPriceFromCard(card);
      const imageUrl = extractImageFromCard(card, cardProductLinks);
      const brand = extractBrandFromCard(card);

      // Use the full URL (with color param) from the first link
      const url = links[0].href;

      products.push({ url, name, price, imageUrl, brand });
    } catch (e) {
      console.warn("Failed to extract product:", baseUrl, e);
    }
  }

  console.log(`Extracted ${products.length} products with data`);

  // Log a sample for debugging
  if (products.length > 0) {
    console.log("Sample product:", JSON.stringify(products[0], null, 2));
  }

  return { products, count: products.length };
}
