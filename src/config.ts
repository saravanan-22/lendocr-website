// Site-wide settings. Change these in one place.
export const SITE = {
  name: "LendOCR",
  // The public address. Used for canonical URLs, the sitemap and social previews.
  url: "https://lendocr.com",
  tagline: "OCR API for Indian KYC and loan documents",
  description:
    "Read PAN, Aadhaar, bank statements, cheques, bills, ITR, salary slips and more " +
    "into validated JSON through one API. Built for Indian lenders, NBFCs and fintechs.",
  // TODO: create this mailbox (e.g. free Cloudflare Email Routing to your Gmail) or
  // replace it with the address you want companies to write to.
  email: "hello@lendocr.com",
  apiBase: "https://api.lendocr.com",
};

export const NAV = [
  { href: "documents/", label: "Documents" },
  { href: "developers/", label: "Developers" },
  { href: "security/", label: "Security" },
  { href: "pricing/", label: "Pricing" },
];

// Prefix internal links with the configured base path (works on a custom domain or a
// GitHub Pages sub-path).
export function link(path = ""): string {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return base + path.replace(/^\//, "");
}

export function mailto(subject: string, body = ""): string {
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
