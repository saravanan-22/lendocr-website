// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// SITE_URL / BASE_PATH let the same site deploy to a custom domain (default) or a
// GitHub Pages sub-path, e.g. SITE_URL=https://user.github.io BASE_PATH=/lendocr-website
export default defineConfig({
  site: process.env.SITE_URL ?? "https://lendocr.com",
  base: process.env.BASE_PATH ?? "/",
  trailingSlash: "always",
  integrations: [sitemap({ filter: (page) => !page.includes("/404"), lastmod: new Date() })],
  build: { inlineStylesheets: "auto" },
});
