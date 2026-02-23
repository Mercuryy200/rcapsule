// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/settings",
        "/dashboard",
        "/profile",
        "/closet",
        "/outfits",
        "/wishlist",
        "/calendar",
        "/collections",
      ],
    },
    sitemap: "https://rcapsule.com/sitemap.xml",
  };
}
