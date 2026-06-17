// Resize ONLY images whose longest edge exceeds CAP (the "crazy dimensions"),
// down to CAP, re-encoded as WebP q82. Everything <= CAP keeps full resolution.
// Non-destructive: originals (png/jpg) are untouched; we (over)write the derived
// .webp. Run from repo root:  node scripts/resize-oversized.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUB = path.resolve("public");
const CAP = 2560;
const QUALITY = 82;

function walk(d) {
  let o = [];
  let es = [];
  try {
    es = fs.readdirSync(d, { withFileTypes: true });
  } catch {
    return o;
  }
  for (const e of es) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === "old") continue;
      o = o.concat(walk(p));
    } else if (/\.(png|jpe?g)$/i.test(e.name)) o.push(p);
  }
  return o;
}

const ABOUT = [
  "hero-croped.png", "hero-skitch-croped.png", "hero-bg.png", "hero-bg-mobile.png",
  "hero-pattern.png", "about.png", "about-blur.png", "about-lower-right.png",
  "about-lower-left.png", "about-upper-right.png", "about-upper-left.png",
  "about-gradient-right.png", "about-gradient-left.png", "before.png",
  "before-1.jpg", "after.png", "after-1.png", "decor-stores-logo.png",
  "dream-studio-logo.png", "books.jpg", "courses.jpg", "mask-pc.png",
  "mask-mobile.png", "testmonials-blur.png", "testmonials-blur-mobile.png",
];

const set = new Set();
for (const f of walk(path.join(PUB, "projects"))) set.add(f);
for (const f of walk(path.join(PUB, "testmonials"))) set.add(f);
for (const a of ABOUT) {
  const abs = path.join(PUB, a);
  if (fs.existsSync(abs)) set.add(abs);
}

const KB = (b) => Math.round(b / 1024);
let resized = 0,
  beforeBytes = 0,
  afterBytes = 0;
const rows = [];

for (const src of set) {
  const meta = await sharp(src).metadata();
  const longest = Math.max(meta.width, meta.height);
  if (longest <= CAP) continue;

  // output webp name (cover-collision guard, same as converter)
  let out = src.replace(/\.(png|jpe?g)$/i, ".webp");
  const m = /[\\/]projects[\\/]project-\d+[\\/]1\.png$/i.exec(src);
  if (m && fs.existsSync(src.replace(/1\.png$/i, "1.jpg")))
    out = src.replace(/1\.png$/i, "cover.webp");

  const before = fs.existsSync(out) ? fs.statSync(out).size : fs.statSync(src).size;
  await sharp(src)
    .resize({ width: CAP, height: CAP, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out + ".tmp");
  fs.renameSync(out + ".tmp", out);
  const after = fs.statSync(out).size;

  resized++;
  beforeBytes += before;
  afterBytes += after;
  const nm = await sharp(out).metadata();
  rows.push([
    path.relative(PUB, out).replace(/\\/g, "/"),
    longest, Math.max(nm.width, nm.height), before, after,
  ]);
}

rows.sort((a, b) => b[3] - b[4] - (a[3] - a[4]));
console.log(`CAP=${CAP}px  resized ${resized} oversized images\n`);
console.log("top 15 savings:");
rows.slice(0, 15).forEach(([f, lo, ln, b, a]) =>
  console.log(`  ${lo}->${ln}px  ${KB(b)}->${KB(a)}KB  ${f}`)
);
console.log(
  `\nserved bytes for resized set: ${(beforeBytes / 1048576).toFixed(2)} MB -> ${(afterBytes / 1048576).toFixed(2)} MB ` +
    `(saved ${((beforeBytes - afterBytes) / 1048576).toFixed(2)} MB)`
);
// flag the two reverted-png backgrounds that now have a smaller resized webp
for (const f of ["hero-bg", "about-blur"]) {
  const png = path.join(PUB, f + ".png");
  const webp = path.join(PUB, f + ".webp");
  if (fs.existsSync(webp))
    console.log(
      `  ${f}: full png ${KB(fs.statSync(png).size)}KB  ->  resized webp ${KB(fs.statSync(webp).size)}KB  (flip ref to .webp)`
    );
}
