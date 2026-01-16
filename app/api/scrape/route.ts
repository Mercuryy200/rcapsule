import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// List of sites known to block scrapers
const PROTECTED_SITES = [
  "ssense.com",
  "aritzia.com",
  "farfetch.com",
  "net-a-porter.com",
  "mrporter.com",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    console.log(`[Scraper] Starting: ${url}`);

    // Check if this is a known protected site
    const isProtectedSite = PROTECTED_SITES.some((site) => url.includes(site));

    if (isProtectedSite) {
      console.log(`[Scraper] Known protected site detected`);
    }

    // Enhanced headers to bypass basic bot detection
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
        "sec-ch-ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
      },
    });

    if (!response.ok) {
      console.error(`[Scraper] Blocked by site. Status: ${response.status}`);

      // Extract basic info from URL for pre-filling
      let suggestedBrand = "";
      try {
        const hostname = new URL(url).hostname.replace("www.", "");
        const rawBrand = hostname.split(".")[0];
        suggestedBrand = rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1);
      } catch (e) {}

      // Return blocked status with prefill data
      return NextResponse.json(
        {
          blocked: true,
          status: response.status,
          message:
            "This site has anti-bot protection and cannot be scraped automatically.",
          suggestion: "Please enter the product details manually.",
          prefill: {
            link: url,
            brand: suggestedBrand,
          },
        },
        { status: 403 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let data = {
      name: "",
      brand: "",
      imageUrl: "",
      price: "",
      description: "",
    };

    // --- STRATEGY 1: JSON-LD (Most reliable) ---
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const jsonText = $(el).html();
        if (!jsonText) return;
        const json = JSON.parse(jsonText);

        const objects = Array.isArray(json) ? json : [json];
        const product = objects.find((o) => o["@type"] === "Product");
        if (product) {
          if (product.name) data.name = product.name;

          if (product.image) {
            const img: any = Array.isArray(product.image)
              ? product.image[0]
              : product.image;

            if (typeof img === "string") {
              data.imageUrl = img;
            } else if (img && typeof img === "object" && img.url) {
              data.imageUrl = img.url;
            }
          }
          if (product.brand) {
            const b: any = product.brand;
            data.brand = typeof b === "object" ? b.name : b;
          }

          if (product.offers) {
            const offer = Array.isArray(product.offers)
              ? product.offers[0]
              : product.offers;
            if (offer && offer.price) data.price = String(offer.price);
          }

          if (product.description) data.description = product.description;
        }
      } catch (e) {
        console.error("[Scraper] JSON-LD parse error:", e);
      }
    });

    // --- STRATEGY 2: Open Graph Meta Tags ---
    if (!data.name) {
      data.name =
        $('meta[property="og:title"]').attr("content") ||
        $('meta[name="twitter:title"]').attr("content") ||
        $("title").text();
    }
    if (!data.imageUrl) {
      data.imageUrl =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        "";
    }
    if (!data.description) {
      data.description =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        "";
    }
    if (!data.brand) {
      data.brand = $('meta[property="og:site_name"]').attr("content") || "";
    }

    // --- STRATEGY 3: Common HTML Patterns ---
    if (!data.name) {
      data.name =
        $("h1").first().text().trim() ||
        $('[class*="product-name"]').first().text().trim() ||
        $('[class*="product-title"]').first().text().trim();
    }

    if (!data.price) {
      // Try multiple price selectors
      const priceSelectors = [
        // Uniqlo specific
        'p[class*="fr-ec-price-text"]',
        'span[class*="fr-ec-price-text"]',
        // Garage specific
        'p[class*="SalePrice"]',
        'p[class*="RegularPrice"]',
        // General selectors
        '[class*="price"]:not([class*="original"]):not([class*="was"]):not([class*="compare"])',
        '[data-testid*="price"]',
        '[itemprop="price"]',
        ".price",
        "#price",
        '[class*="Price"]',
        'span[class*="sale"]',
        'span[class*="current"]',
        "[data-price]",
      ];

      for (const selector of priceSelectors) {
        const priceText =
          $(selector).first().text().trim() ||
          $(selector).first().attr("content") ||
          $(selector).first().attr("data-price") ||
          "";

        if (priceText && /[\d.,]+/.test(priceText)) {
          data.price = priceText;
          break;
        }
      }

      // Special handling for meta tags
      if (!data.price) {
        data.price =
          $('meta[property="product:price:amount"]').attr("content") ||
          $('meta[property="og:price:amount"]').attr("content") ||
          "";
      }
    }

    if (!data.imageUrl) {
      const firstImg =
        $('img[class*="product"]').first().attr("src") ||
        $('img[itemprop="image"]').first().attr("src") ||
        $("main img").first().attr("src") ||
        "";
      data.imageUrl = firstImg;
    }

    // --- STRATEGY 4: Cleanup & Normalize ---
    if (data.name && data.name.includes("|")) {
      data.name = data.name.split("|")[0].trim();
    }

    if (data.name && data.name.includes(" - ")) {
      const parts = data.name.split(" - ");
      if (parts.length > 1 && !data.brand) {
        data.brand = parts[0].trim();
        data.name = parts.slice(1).join(" - ").trim();
      }
    }

    if (data.imageUrl && data.imageUrl.startsWith("//")) {
      data.imageUrl = "https:" + data.imageUrl;
    }

    if (data.imageUrl && data.imageUrl.startsWith("/")) {
      try {
        const urlObj = new URL(url);
        data.imageUrl = `${urlObj.protocol}//${urlObj.host}${data.imageUrl}`;
      } catch (e) {}
    }

    if (!data.brand) {
      try {
        const hostname = new URL(url).hostname.replace("www.", "");
        const rawBrand = hostname.split(".")[0];
        data.brand = rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1);
      } catch (e) {}
    }

    // Clean price - extract numeric value with decimal
    if (data.price) {
      // Match price patterns like $99.99, CA $ 59.90, 99,99, 99.99, etc.
      const priceMatch = data.price.match(/[\d,]+\.?\d*/);
      if (priceMatch) {
        data.price = priceMatch[0].replace(/,/g, "");
      } else {
        data.price = data.price
          .replace(/[^0-9.,]/g, "")
          .replace(/,/g, "")
          .trim();
      }

      // Remove if it's not a valid number
      if (isNaN(parseFloat(data.price))) {
        data.price = "";
      } else {
        // Ensure consistent decimal format
        data.price = parseFloat(data.price).toString();
      }
    }

    console.log("[Scraper] Success:", data);

    return NextResponse.json({
      blocked: false,
      name: data.name || "",
      brand: data.brand || "",
      imageUrl: data.imageUrl || "",
      price: data.price || "",
      description: data.description || "",
      link: url,
    });
  } catch (error) {
    console.error("[Scraper] Server Error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
