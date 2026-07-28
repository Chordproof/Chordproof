import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://chordproof.com";

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/request`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${baseUrl}/profile`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/auth/signin`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.2 },
    { url: `${baseUrl}/cancel`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.1 },
    { url: `${baseUrl}/legal`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/admin`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.1 },
  ];

  // Artist pages (top artists)
  const artists = ["oasis", "radiohead", "led-zeppelin", "the-beatles", "ed-sheeran", "eagles", "metallica", "jeff-buckley", "eric-clapton"];
  const artistPages = artists.map((artist) => ({
    url: `${baseUrl}/artist/${artist}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Tab pages (top songs)
  const tabs = [
    { artist: "oasis", song: "wonderwall" },
    { artist: "oasis", song: "dont-look-back-in-anger" },
    { artist: "oasis", song: "champagne-supernova" },
    { artist: "oasis", song: "live-forever" },
    { artist: "oasis", song: "slide-away" },
    { artist: "oasis", song: "supersonic" },
    { artist: "eagles", song: "hotel-california" },
    { artist: "ed-sheeran", song: "perfect" },
    { artist: "jeff-buckley", song: "hallelujah" },
    { artist: "radiohead", song: "creep" },
    { artist: "led-zeppelin", song: "stairway-to-heaven" },
    { artist: "metallica", song: "nothing-else-matters" },
    { artist: "eric-clapton", song: "tears-in-heaven" },
    { artist: "the-beatles", song: "blackbird" },
  ];
  const tabPages = tabs.map((tab) => ({
    url: `${baseUrl}/tab/${tab.artist}/${tab.song}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...artistPages, ...tabPages];
}
