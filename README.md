# LendOCR website

The public website for the LendOCR API: what it does, real sample output, a page for every
supported document, developer guide, security, pricing and contact.

## Technology

| Choice | Why |
|---|---|
| **Astro 7** (static output) | Every page is plain pre-built HTML: fastest to load and easiest for Google to index. |
| No UI framework, plain CSS | Under 60 KB per page, no JavaScript except ~15 lines for the demo tabs. |
| System fonts | No font downloads; text appears instantly. Light and dark mode follow the visitor's device. |
| `@astrojs/sitemap` + `robots.txt` | Google finds every page. |
| GitHub Pages or Cloudflare Pages | Free static hosting with HTTPS; no server to run. |

SEO built in: a unique title and description per page (within Google's display limits),
canonical URLs, Open Graph and Twitter cards with a preview image, structured data
(Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList), `lang="en-IN"`,
one `<h1>` per page, alt text on images, and a landing page for each document type,
targeting searches such as "Aadhaar OCR API" or "bank statement analysis API".

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run check      # type check
npm test           # build + HTML validation + site tests (links, SEO, sitemap, privacy, contrast)
```

## Content

- `src/config.ts`: site name, URL, contact email, menu.
- `src/data/documents.ts`: the 14 document types (drives the document pages and grids).
- `src/data/demo.json`: **real API responses** for the demo. Refresh from a running API:

  ```bash
  LENDOCR_API_KEY=lo_... uv run --project ../lendocr python scripts/export-demo.py
  ```

All sample documents are synthetic specimens; never put real customer documents here.

## Launch checklist

1. **Domain:** register `lendocr.com` (about ₹800/year), point it to the host, and set
   `SITE_URL` (see `.github/workflows/deploy.yml`).
2. **Email:** create `hello@lendocr.com` (free with Cloudflare Email Routing to your
   Gmail), or change `email` in `src/config.ts`.
3. **Publish:** push to GitHub; the workflow builds and deploys on every push to `main`.
4. **Google Search Console:** add the domain, verify it, and submit
   `https://lendocr.com/sitemap-index.xml`. Indexing usually starts within days.
5. **Check:** Chrome DevTools -> Lighthouse on the live site.
