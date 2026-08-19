import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stellarescrow.market";

  const routes = [
    "",
    "/jobs",
    "/jobs/new",
    "/leaderboard",
    "/profile",
    "/privacy",
    "/terms",
    "/dispute-policy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/jobs" || route === "/leaderboard" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/jobs" || route === "/leaderboard" ? 0.9 : 0.7,
  }));
}
