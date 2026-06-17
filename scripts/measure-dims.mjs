import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

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

const set = new Set();
for (const f of walk("public/projects")) set.add(f);
for (const f of walk("public/testmonials")) set.add(f);
const about = [
  "hero-croped.png", "hero-skitch-croped.png", "hero-bg.png", "hero-bg-mobile.png",
  "hero-pattern.png", "about.png", "about-blur.png", "about-lower-right.png",
  "about-lower-left.png", "about-upper-right.png", "about-upper-left.png",
  "about-gradient-right.png", "about-gradient-left.png", "before.png",
  "before-1.jpg", "after.png", "after-1.png", "decor-stores-logo.png",
  "dream-studio-logo.png", "books.jpg", "courses.jpg", "mask-pc.png",
  "mask-mobile.png", "testmonials-blur.png", "testmonials-blur-mobile.png",
];
for (const a of about) {
  const p = "public/" + a;
  if (fs.existsSync(p)) set.add(p);
}

const rows = [];
for (const src of set) {
  try {
    const m = await sharp(src).metadata();
    const longest = Math.max(m.width, m.height);
    rows.push([
      longest, m.width, m.height,
      path.relative("public", src).replace(/\\/g, "/"),
      Math.round(fs.statSync(src).size / 1024),
    ]);
  } catch {}
}
rows.sort((a, b) => b[0] - a[0]);
console.log("TOTAL referenced-scope originals:", rows.length);
for (const c of [2000, 2560, 3000]) {
  console.log(`  longest-edge > ${c}px : ${rows.filter((r) => r[0] > c).length} files`);
}
console.log("\n=== top 28 by longest edge ===");
rows.slice(0, 28).forEach(([L, w, h, f, kb]) =>
  console.log(String(L).padStart(5) + "px  " + (w + "x" + h).padEnd(11) + " " + String(kb).padStart(5) + "KB  " + f)
);
