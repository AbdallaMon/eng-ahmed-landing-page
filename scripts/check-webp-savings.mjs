// Reports which converted webp files are NOT smaller than their source,
// so we can keep the original format for those (webp isn't always smaller).
import fs from "node:fs";
import path from "node:path";

const PUB = path.resolve("public");
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
for (const f of walk(path.join(PUB, "projects"))) set.add(f);
for (const f of walk(path.join(PUB, "testmonials"))) set.add(f);
const about = [
  "hero-croped.png", "hero-skitch-croped.png", "hero-bg.png",
  "hero-bg-mobile.png", "hero-pattern.png", "about.png", "about-blur.png",
  "about-lower-right.png", "about-lower-left.png", "about-upper-right.png",
  "about-upper-left.png", "about-gradient-right.png", "about-gradient-left.png",
  "before.png", "before-1.jpg", "after.png", "after-1.png",
  "decor-stores-logo.png", "dream-studio-logo.png", "books.jpg", "courses.jpg",
  "mask-pc.png", "mask-mobile.png", "testmonials-blur.png",
  "testmonials-blur-mobile.png",
];
for (const a of about) {
  const abs = path.join(PUB, a);
  if (fs.existsSync(abs)) set.add(abs);
}

const worse = [];
let better = 0, betterBytes = 0;
for (const src of set) {
  let real = src.replace(/\.(png|jpe?g)$/i, ".webp");
  const m = /[\\/]projects[\\/]project-\d+[\\/]1\.png$/i.exec(src);
  if (m && fs.existsSync(src.replace(/1\.png$/i, "1.jpg")))
    real = src.replace(/1\.png$/i, "cover.webp");
  if (!fs.existsSync(real)) continue;
  const so = fs.statSync(src).size;
  const sw = fs.statSync(real).size;
  if (sw >= so) worse.push([path.relative(PUB, src).replace(/\\/g, "/"), so, sw]);
  else {
    better++;
    betterBytes += so - sw;
  }
}
worse.sort((a, b) => b[2] - b[1] - (a[2] - a[1]));
const KB = (b) => Math.round(b / 1024);
console.log("webp SMALLER (keep webp):", better, "files, saved", (betterBytes / 1048576).toFixed(2), "MB");
console.log("webp NOT smaller (revert to original):", worse.length, "files\n");
worse.forEach(([f, o, w]) => console.log("  +" + KB(w - o) + "KB  " + KB(o) + "->" + KB(w) + "KB  " + f));

// write the revert list (relative-to-public source paths that should stay original)
fs.writeFileSync(
  path.resolve("scripts/webp-not-smaller.txt"),
  worse.map((x) => x[0]).join("\n") + (worse.length ? "\n" : "")
);
