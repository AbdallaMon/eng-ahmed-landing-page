// One-off image optimizer: converts about-page + projects raster images to WebP.
// - Quality 82, NO resize (pixel-identical dimensions) — per owner choice.
// - Non-destructive: writes <name>.webp next to the original; originals are kept.
// - Skips files that don't exist or already have an up-to-date .webp.
// Run from repo root:  node scripts/convert-images.mjs
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.resolve("public");
const QUALITY = 82;

// --- About-page content images (explicit, relative to public/) ---------------
const ABOUT = [
  // hero
  "hero-croped.png",
  "hero-skitch-croped.png",
  "hero-bg.png",
  "hero-bg-mobile.png",
  "hero-pattern.png",
  // about section
  "about.png",
  "about-blur.png",
  "about-lower-right.png",
  "about-lower-left.png",
  "about-upper-right.png",
  "about-upper-left.png",
  "about-gradient-right.png",
  "about-gradient-left.png",
  // before & after
  "before.png",
  "before-1.jpg",
  "after.png",
  "after-1.png",
  // companies
  "decor-stores-logo.png",
  "dream-studio-logo.png",
  // books & courses
  "books.jpg",
  "courses.jpg",
  // translating ideas
  "mask-pc.png",
  "mask-mobile.png",
  // testimonials blur backdrops
  "testmonials-blur.png",
  "testmonials-blur-mobile.png",
];

const isRaster = (f) => /\.(png|jpe?g)$/i.test(f);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const out = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (/[\\/]old$/i.test(p) || e.name === "old") continue; // skip projects/old
      out.push(...(await walk(p)));
    } else if (isRaster(e.name)) {
      out.push(p);
    }
  }
  return out;
}

async function collect() {
  const set = new Set();
  // projects: every real raster except projects/old
  for (const f of await walk(path.join(PUBLIC, "projects"))) set.add(f);
  // also testimonials avatars folder (about)
  for (const f of await walk(path.join(PUBLIC, "testmonials"))) set.add(f);
  // explicit about files
  for (const rel of ABOUT) {
    const abs = path.join(PUBLIC, rel);
    if (await exists(abs)) set.add(abs);
    else console.warn("  (missing, skipped)", rel);
  }
  return [...set];
}

async function main() {
  const files = await collect();
  let converted = 0,
    skipped = 0,
    failed = 0,
    srcBytes = 0,
    outBytes = 0;
  const manifest = [];

  for (const src of files) {
    // Collision guard: in a project folder, `1.png` is the COVER and `1.jpg`
    // is gallery image #1 — two different images that would both map to
    // `1.webp`. Give the cover its own name so neither is overwritten.
    let out = src.replace(/\.(png|jpe?g)$/i, ".webp");
    const m = /([\\/]projects[\\/]project-\d+[\\/])1\.png$/i.exec(src);
    if (m) {
      const siblingJpg = src.replace(/1\.png$/i, "1.jpg");
      if (await exists(siblingJpg)) out = src.replace(/1\.png$/i, "cover.webp");
    }
    try {
      const sStat = await fs.stat(src);
      // skip if webp exists and is newer than source
      if (await exists(out)) {
        const oStat = await fs.stat(out);
        if (oStat.mtimeMs >= sStat.mtimeMs) {
          skipped++;
          srcBytes += sStat.size;
          outBytes += oStat.size;
          manifest.push(path.relative(PUBLIC, out).replace(/\\/g, "/"));
          continue;
        }
      }
      await sharp(src).webp({ quality: QUALITY }).toFile(out);
      const oStat = await fs.stat(out);
      converted++;
      srcBytes += sStat.size;
      outBytes += oStat.size;
      manifest.push(path.relative(PUBLIC, out).replace(/\\/g, "/"));
    } catch (err) {
      failed++;
      console.error("  FAIL", path.relative(PUBLIC, src), err.message);
    }
  }

  manifest.sort();
  await fs.writeFile(
    path.resolve("scripts/converted-webp.manifest.txt"),
    manifest.join("\n") + "\n"
  );

  const MB = (b) => (b / 1048576).toFixed(2) + " MB";
  console.log("\n==== conversion summary ====");
  console.log("candidates :", files.length);
  console.log("converted  :", converted);
  console.log("skipped    :", skipped, "(webp already up to date)");
  console.log("failed     :", failed);
  console.log("source     :", MB(srcBytes), "(originals, kept)");
  console.log("webp       :", MB(outBytes));
  console.log(
    "saved      :",
    MB(srcBytes - outBytes),
    `(${(((srcBytes - outBytes) / srcBytes) * 100).toFixed(1)}% smaller)`
  );
  console.log("manifest   : scripts/converted-webp.manifest.txt");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
