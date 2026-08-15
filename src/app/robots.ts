import { SITE_URL } from "@/lib/seo";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/signin", "/account"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
