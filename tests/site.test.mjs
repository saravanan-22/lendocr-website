// Tests for the built site (run `npm run build` first, or `npm test` which builds).
// Checks every page: links, images, SEO tags, structured data, sitemap, privacy, contrast.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;
const SITE = (process.env.SITE_URL ?? "https://lendocr.com").replace(/\/$/, "");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(DIST);
const pages = files.filter((f) => f.endsWith(".html"));
const indexable = pages.filter((f) => !f.endsWith("404.html"));
const urlOf = (file) => "/" + relative(DIST, file).replace(/index\.html$/, "");
const html = Object.fromEntries(pages.map((f) => [urlOf(f), readFileSync(f, "utf8")]));
const exists = (path) => {
  const clean = decodeURI(path.split("#")[0].split("?")[0]);
  const target = join(DIST, clean);
  return existsSync(target) && (statSync(target).isFile() || existsSync(join(target, "index.html")));
};
const attr = (page, re) => [...page.matchAll(re)].map((m) => m[1]);

test("expected pages are built", () => {
  const urls = Object.keys(html);
  for (const url of ["/", "/documents/", "/developers/", "/security/", "/pricing/", "/contact/", "/about/", "/404.html"]) {
    assert.ok(urls.includes(url), `missing ${url}`);
  }
  const docPages = urls.filter((u) => /^\/documents\/.+\/$/.test(u));
  assert.equal(docPages.length, 14, "one page per document type");
});

test("every internal link and image resolves", () => {
  for (const [url, page] of Object.entries(html)) {
    const refs = [
      ...attr(page, /\shref="(\/[^"]*)"/g),
      ...attr(page, /\ssrc="(\/[^"]*)"/g),
    ];
    for (const ref of refs) assert.ok(exists(ref), `${url} -> broken ${ref}`);
    for (const anchor of attr(page, /\shref="#([^"]+)"/g)) {
      assert.match(page, new RegExp(`id="${anchor}"`), `${url} -> missing #${anchor}`);
    }
  }
});

// Outbound links allowed: mail, our own site, and the founder's public profiles.
const ALLOWED_OUT = ["https://www.linkedin.com/in/", "https://github.com/saravanan-22", "https://saravanan-22.github.io/"];

test("external links are only mail or approved profile links (no trackers or scripts)", () => {
  for (const [url, page] of Object.entries(html)) {
    for (const href of attr(page, /\shref="([a-z]+:[^"]*)"/g)) {
      const ok = href.startsWith("mailto:") || href.startsWith(SITE) || ALLOWED_OUT.some((p) => href.startsWith(p));
      assert.ok(ok, `${url} links out to ${href}`);
    }
    for (const tag of page.match(/<a [^>]*target="_blank"[^>]*>/g) ?? []) {
      assert.match(tag, /rel="[^"]*noopener/, `${url} new-tab link without noopener: ${tag}`);
    }
    for (const src of attr(page, /<script[^>]*\ssrc="([^"]+)"/g)) {
      assert.ok(src.startsWith("/"), `${url} loads external script ${src}`);
    }
  }
});

test("each page has SEO basics", () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const file of indexable) {
    const url = urlOf(file);
    const page = html[url];
    const title = page.match(/<title>(.*?)<\/title>/s)?.[1] ?? "";
    const desc = page.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
    assert.ok(title.length >= 30 && title.length <= 70, `${url} title length ${title.length}`);
    assert.ok(desc.length >= 70 && desc.length <= 160, `${url} description length ${desc.length}`);
    assert.ok(!titles.has(title), `${url} duplicate title`);
    assert.ok(!descriptions.has(desc), `${url} duplicate description`);
    titles.add(title);
    descriptions.add(desc);
    assert.equal((page.match(/<h1[\s>]/g) ?? []).length, 1, `${url} must have one h1`);
    assert.match(page, new RegExp(`<link rel="canonical" href="${SITE}${url}"`), `${url} canonical`);
    assert.match(page, /<html lang="en-IN">/, `${url} lang`);
    for (const tag of ["og:title", "og:description", "og:image", "og:url"]) {
      assert.match(page, new RegExp(`property="${tag}"`), `${url} missing ${tag}`);
    }
    assert.match(page, /name="viewport"/, `${url} viewport`);
    assert.doesNotMatch(page, /name="robots" content="noindex"/, `${url} must be indexable`);
  }
  assert.match(html["/404.html"], /name="robots" content="noindex"/, "404 must not be indexed");
});

test("images have alt text and dimensions", () => {
  for (const [url, page] of Object.entries(html)) {
    for (const img of page.match(/<img[^>]*>/g) ?? []) {
      assert.match(img, /\salt="/, `${url} img without alt: ${img}`);
      assert.match(img, /\swidth="\d+"/, `${url} img without width (layout shift): ${img}`);
      assert.match(img, /\sheight="\d+"/, `${url} img without height: ${img}`);
    }
  }
});

test("structured data is valid JSON-LD", () => {
  for (const [url, page] of Object.entries(html)) {
    const blocks = attr(page, /<script type="application\/ld\+json">(.*?)<\/script>/gs);
    assert.ok(blocks.length >= 1, `${url} has no structured data`);
    for (const block of blocks) {
      const data = JSON.parse(block);
      assert.equal(data["@context"], "https://schema.org", `${url} JSON-LD context`);
      assert.ok(data["@type"], `${url} JSON-LD type`);
    }
  }
  const home = attr(html["/"], /<script type="application\/ld\+json">(.*?)<\/script>/gs).map((b) => JSON.parse(b));
  const faq = home.find((d) => d["@type"] === "FAQPage");
  assert.ok(faq && faq.mainEntity.length >= 5, "home has an FAQPage");
});

test("sitemap lists every indexable page and robots.txt points to it", () => {
  const sitemap = readFileSync(join(DIST, "sitemap-0.xml"), "utf8");
  const locs = new Set(attr(sitemap, /<loc>([^<]+)<\/loc>/g));
  for (const file of indexable) assert.ok(locs.has(SITE + urlOf(file)), `sitemap missing ${urlOf(file)}`);
  assert.ok(![...locs].some((l) => l.includes("404")), "404 must not be in the sitemap");
  const robots = readFileSync(join(DIST, "robots.txt"), "utf8");
  assert.match(robots, /Allow: \//);
  assert.match(robots, new RegExp(`Sitemap: ${SITE}/sitemap-index.xml`));
});

test("no personal data or placeholders leak into the site", () => {
  for (const [url, page] of Object.entries(html)) {
    const text = page.replace(/<script[\s\S]*?<\/script>/g, "");
    assert.doesNotMatch(text, /(?<![\dX])[2-9]\d{3}\s?\d{4}\s?\d{4}(?!\d)/, `${url} shows a 12-digit Aadhaar-like number`);
    assert.doesNotMatch(text, /\bTODO\b|lorem ipsum|\bundefined\b|\bNaN\b|\[object Object\]/, `${url} has a placeholder`);
    assert.doesNotMatch(text, /lo_(live|test)_[a-z0-9]{8}_[A-Za-z0-9_-]{20,}/, `${url} shows a real API key`);
  }
});

test("demo shows real responses for every sample", () => {
  const demo = JSON.parse(readFileSync(new URL("../src/data/demo.json", import.meta.url), "utf8"));
  assert.ok(demo.length >= 6);
  for (const sample of demo) {
    assert.ok(Object.keys(sample.response.fields).length >= 3, `${sample.id} has fields`);
    assert.ok(exists("/" + sample.image), `${sample.id} image exists`);
    assert.match(html["/"], new RegExp(`id="panel-${sample.id}"`), `${sample.id} rendered on home`);
  }
  const aadhaar = demo.find((s) => s.id === "aadhaar");
  assert.match(aadhaar.response.fields.aadhaar_number.value, /^XXXX XXXX \d{4}$/, "Aadhaar is masked");
});

test("pages stay small and fast", () => {
  for (const file of pages) {
    assert.ok(statSync(file).size < 80_000, `${urlOf(file)} HTML is ${statSync(file).size} bytes`);
  }
  for (const file of files.filter((f) => /\.(webp|png|svg)$/.test(f))) {
    assert.ok(statSync(file).size < 150_000, `${relative(DIST, file)} is ${statSync(file).size} bytes`);
  }
  const js = files.filter((f) => f.endsWith(".js"));
  const total = js.reduce((n, f) => n + statSync(f).size, 0);
  assert.ok(total < 10_000, `JavaScript total ${total} bytes`);
});

// WCAG contrast of the colour tokens, in light and dark mode.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

test("text colours meet WCAG AA contrast", () => {
  const css = readFileSync(new URL("../src/styles/global.css", import.meta.url), "utf8");
  const dark = css.match(/@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\}/);
  const blocks = [css.match(/:root \{([\s\S]*?)\}/)[1], ...(dark ? [dark[1]] : [])];
  for (const [i, block] of blocks.entries()) {
    const v = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
    const mode = i ? "dark" : "light";
    for (const [fg, bg] of [["text", "bg"], ["muted", "bg"], ["muted", "bg-soft"], ["accent", "bg"], ["accent", "accent-soft"], ["ok", "ok-soft"], ["warn", "warn-soft"], ["code-text", "code-bg"]]) {
      const ratio = contrast(v[fg], v[bg]);
      assert.ok(ratio >= 4.5, `${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1 (needs 4.5)`);
    }
  }
});
