function detectCategory(name) {
  const text = name.toLowerCase();

  if (
    text.includes("dress") ||
    text.includes("gown") ||
    text.includes("romper")
  )
    return "Dresses";
  if (
    text.includes("jacket") ||
    text.includes("coat") ||
    text.includes("blazer") ||
    text.includes("parka")
  )
    return "Outerwear";
  if (
    text.includes("pant") ||
    text.includes("jean") ||
    text.includes("skirt") ||
    text.includes("short") ||
    text.includes("legging")
  )
    return "Bottoms";
  if (
    text.includes("shoe") ||
    text.includes("sneaker") ||
    text.includes("boot") ||
    text.includes("sandal") ||
    text.includes("heel")
  )
    return "Shoes";
  if (
    text.includes("bag") ||
    text.includes("belt") ||
    text.includes("hat") ||
    text.includes("scarf")
  )
    return "Accessories";

  return "Tops";
}
document.getElementById("scanBtn").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Scanning page...";
  status.className = "loading";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab.url) {
      const hostname = new URL(tab.url).hostname;
      const UNSUPPORTED_SITES = [
        "google.com",
        "youtube.com",
        "facebook.com",
        "instagram.com",
        "tiktok.com",
        "x.com",
        "twitch.com",
        "pinterest.com",
      ];
      if (UNSUPPORTED_SITES.some((site) => hostname.includes(site))) {
        status.textContent = "This doesn't look like a clothing store!";
        status.className = "error";
        return;
      }
    }
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractProductData,
    });

    const data = results[0].result;

    if (!data || !data.name) {
      status.textContent = "Could not find product details.";
      status.className = "error";
      return;
    }

    document.getElementById("inputName").value = data.name || "";
    document.getElementById("inputBrand").value = data.brand || "";
    document.getElementById("inputPrice").value = data.price || "";
    document.getElementById("inputSize").value = data.size || "";
    document.getElementById("inputLink").value = data.link || "";
    const detectedCat = detectCategory(data.name || "");
    document.getElementById("inputCategory").value = detectedCat;

    const imgPreview = document.getElementById("previewImg");
    if (data.imageUrl) {
      imgPreview.src = data.imageUrl;
      document.getElementById("inputImgUrl").value = data.imageUrl;
      imgPreview.style.display = "block";
    } else {
      imgPreview.style.display = "none";
    }

    document.getElementById("scanView").classList.add("hidden");
    document.getElementById("formView").classList.remove("hidden");
    status.textContent = "";
  } catch (error) {
    console.error(error);
    status.textContent = "Error scanning page.";
    status.className = "error";
  }
});

document.getElementById("saveBtn").addEventListener("click", async () => {
  const status = document.getElementById("status");
  const saveBtn = document.getElementById("saveBtn");

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";
  status.textContent = "";

  const wishlistCheckbox = document.getElementById("inputWishlist");
  const isWishlist = wishlistCheckbox ? wishlistCheckbox.checked : false;

  console.log("Saving Item... Wishlist Mode:", isWishlist);

  const finalData = {
    name: document.getElementById("inputName").value,
    brand: document.getElementById("inputBrand").value,
    price: document.getElementById("inputPrice").value,
    size: document.getElementById("inputSize").value,
    link: document.getElementById("inputLink").value,
    imageUrl: document.getElementById("inputImgUrl").value,
    category: document.getElementById("inputCategory").value,
    status: isWishlist ? "wishlist" : "owned",
    purchaseDate: isWishlist ? null : new Date().toISOString().split("T")[0],
  };
  try {
    const API_URL = "http://vesticloset.vercel.app/api/extension/import";
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(finalData),
    });

    if (response.ok) {
      status.textContent = "Saved to Wardrobe!";
      status.className = "success";
      saveBtn.textContent = "Saved";
      window.open("https://vesticloset.vercel.app/closet", "_blank");

      setTimeout(() => window.close(), 1500);
    } else {
      const err = await response.json();
      status.textContent = "Error: " + (err.message || "Save failed");
      status.className = "error";
      saveBtn.disabled = false;
      saveBtn.textContent = "Add to Wardrobe";
    }
  } catch (error) {
    status.textContent = "Network Error. Check API.";
    status.className = "error";
    saveBtn.disabled = false;
    saveBtn.textContent = "Add to Wardrobe";
  }
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("formView").classList.add("hidden");
  document.getElementById("scanView").classList.remove("hidden");
  document.getElementById("status").textContent = "";
});

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

  const jsonLdScripts = document.querySelectorAll(
    'script[type="application/ld+json"]',
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
      console.error("JSON-LD error:", e);
    }
  });

  // --- 2. Fallback Text Scraping ---
  if (!data.name) {
    data.name = document.querySelector("h1")?.textContent?.trim() || "";
  }
  if (!data.brand) {
    data.brand =
      document.querySelector('meta[property="og:site_name"]')?.content ||
      new URL(window.location.href).hostname.replace("www.", "").split(".")[0];
    if (data.brand)
      data.brand = data.brand.charAt(0).toUpperCase() + data.brand.slice(1);
  }
  if (!data.price) {
    const zaraPrice = document.querySelector("span.money-amount__main");
    data.price =
      zaraPrice?.textContent?.trim() ||
      document.querySelector('[class*="price"]')?.textContent?.trim() ||
      "";
    const match = data.price.match(/[\d,]+\.?\d*/);
    if (match) data.price = match[0].replace(/,/g, "");
  }

  // --- 3. SIZE EXTRACTION ---
  try {
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
      if (key.toLowerCase().endsWith("size") || key === "sz") {
        data.size = decodeURIComponent(value);
        break;
      }
    }
  } catch (e) {}

  if (!data.size) {
    const aritziaText = document.querySelector(
      '[data-testid="siv-select-size-msg"]',
    );
    if (aritziaText) {
      let text = aritziaText.textContent.trim();
      text = text.replace(/^Size\s*/i, "");
      text = text.split("—")[0].trim();
      text = text.split("-")[0].trim();
      data.size = text;
    }
  }

  if (!data.size) {
    const activeSize =
      document.querySelector(".size-selector .active") ||
      document.querySelector('[class*="size"] [aria-checked="true"]') ||
      document.querySelector('input[name="size"]:checked + label') ||
      document.querySelector('.selected[class*="size"]');

    if (activeSize) data.size = activeSize.textContent.trim();
  }

  if (data.size) {
    data.size = data.size
      .replace(/chevron/gi, "")
      .replace(/down/gi, "")
      .trim()
      .replace(/\n/g, " ");
  }

  // --- 4. IMAGE EXTRACTION ---
  const getValidSrc = (img) => {
    if (!img) return null;
    let candidate = img.srcset || img.dataset.srcset;
    if (candidate) {
      const urls = candidate.split(/,\s+/);
      return urls[urls.length - 1].trim().split(" ")[0];
    }
    const src = img.src || img.dataset.src;
    return src && !src.startsWith("data:") ? src : img.dataset.src || null;
  };

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
      const offBodyLink = document.querySelector('a[href*="_off_"]');
      const offBodyImg = document.querySelector('img[src*="_off_"]');
      if (offBodyLink) data.imageUrl = offBodyLink.href;
      else if (offBodyImg) data.imageUrl = offBodyImg.src;
    }
    if (isZara) {
      const allImages = Array.from(document.querySelectorAll("img"));
      const flatLay = allImages.find((img) => {
        const alt = (img.alt || "").toLowerCase();
        const width = img.naturalWidth || img.width || 0;
        return alt.includes("front view") && width > 200;
      });
      if (flatLay) data.imageUrl = flatLay.src;
    }
  }

  if (!data.imageUrl) {
    const activeImage =
      document.querySelector(".product-detail-images__image-container img") ||
      document.querySelector(".media-image__image");
    if (activeImage) data.imageUrl = getValidSrc(activeImage);
  }

  if (!data.imageUrl) {
    const images = Array.from(document.querySelectorAll("img"));
    const largeImages = images.filter((img) => {
      const valid = getValidSrc(img);
      return (img.naturalWidth > 300 || img.width > 300) && valid;
    });
    if (largeImages.length > 0) data.imageUrl = getValidSrc(largeImages[0]);
  }

  if (data.imageUrl) {
    if (data.imageUrl.startsWith("//"))
      data.imageUrl = "https:" + data.imageUrl;
    if (data.imageUrl.includes(" "))
      data.imageUrl = data.imageUrl.split(" ")[0];
  }

  return data;
}
