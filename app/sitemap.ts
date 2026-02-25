// app/sitemap.ts
import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

import { siteConfig } from "@/lib/config/site";

const baseUrl = "https://rcapsule.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const navRoutes = siteConfig.navItems.map((item) => ({
    url: `${baseUrl}${item.href}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const baseRoutes = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  // Dynamic public user profile pages
  let profileRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: users } = await supabase
      .from("User")
      .select("username, updatedAt")
      .eq("profilePublic", true)
      .not("username", "is", null);

    profileRoutes = (users || []).map((user: { username: string; updatedAt: string }) => ({
      url: `${baseUrl}/u/${user.username}`,
      lastModified: user.updatedAt || new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // Non-fatal — sitemap still works without profile routes
  }

  return [...baseRoutes, ...navRoutes, ...profileRoutes];
}
