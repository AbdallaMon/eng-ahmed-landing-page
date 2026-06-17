// Generates CARTOON placeholder avatars (DiceBear "avataaars") for the 12
// testimonials that have no source image — gender-matched hair, solid colored
// circular backgrounds (cropped to a circle by the MUI <Avatar>), saved as webp
// to match the existing maha/fahd/ali cartoon avatars.
// Falls back to a brand-colored initials avatar if a download fails.
// Run: node scripts/add-placeholder-avatars.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/testmonials");
const STYLE = "avataaars";
const API = `https://api.dicebear.com/9.x/${STYLE}/png`;

// DiceBear v9 avataaars "top" values (prefixes were dropped in v9)
const MEN_TOPS = "shortFlat,shortRound,shortWaved,sides,theCaesar,dreads01";
const WOMEN_TOPS = "straight01,straight02,bob,curly,bigHair,miaWallace,longButNotTooLong";

// name -> gender + a soft solid background color (hex, no #) + fallback initial
const AVATARS = [
  { name: "abdullah", g: "men", bg: "f87171", letter: "A" },
  { name: "ahmed", g: "men", bg: "93c5fd", letter: "A" },
  { name: "badr", g: "men", bg: "374151", letter: "B" },
  { name: "khalid", g: "men", bg: "6ee7b7", letter: "K" },
  { name: "mohammed", g: "men", bg: "fdba74", letter: "M" },
  { name: "saeed", g: "men", bg: "818cf8", letter: "S" },
  { name: "yousef", g: "men", bg: "f59e0b", letter: "Y" },
  { name: "hend", g: "women", bg: "f9a8d4", letter: "H" },
  { name: "layan", g: "women", bg: "c4b5fd", letter: "L" },
  { name: "noura", g: "women", bg: "5eead4", letter: "N" },
  { name: "reem", g: "women", bg: "fda4af", letter: "R" },
  { name: "sara", g: "women", bg: "fcd34d", letter: "S" },
];

function urlFor(a) {
  const tops = a.g === "men" ? MEN_TOPS : WOMEN_TOPS;
  const facial = a.g === "men" ? 40 : 0;
  const p = new URLSearchParams({
    seed: a.name,
    size: "256",
    backgroundColor: a.bg,
    backgroundType: "solid",
    top: tops,
    facialHairProbability: String(facial),
    accessoriesProbability: "45",
    // positive, professional look (testimonials) — avoid sad/screaming faces
    // and the skull "graphicShirt"
    mouth: "smile,twinkle,default",
    eyes: "default,happy,wink",
    eyebrows: "default,defaultNatural,raisedExcited,flatNatural",
    clothing: "blazerAndShirt,collarAndSweater,shirtCrewNeck,blazerAndSweater,hoodie",
  });
  return `${API}?${p.toString()}`;
}

function initialsAvatar(letter, bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
    <rect width="256" height="256" fill="#${bg}"/>
    <text x="50%" y="50%" dy=".35em" text-anchor="middle"
      font-family="Arial, sans-serif" font-size="120" fill="#ffffff">${letter}</text>
  </svg>`;
  return sharp(Buffer.from(svg));
}

let ok = 0, fell = 0, failed = 0;
for (const a of AVATARS) {
  const out = path.join(DIR, a.name + ".webp");
  try {
    const res = await fetch(urlFor(a));
    if (!res.ok) throw new Error("HTTP " + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).webp({ quality: 82 }).toFile(out + ".tmp");
    fs.renameSync(out + ".tmp", out);
    ok++;
    console.log("  cartoon", a.name, "(" + a.g + ", #" + a.bg + ")");
  } catch (e) {
    try {
      await initialsAvatar(a.letter, a.bg).webp({ quality: 82 }).toFile(out);
      fell++;
      console.log("  fallback initials for", a.name, "(" + e.message + ")");
    } catch (e2) {
      failed++;
      console.error("  FAILED", a.name, e2.message);
    }
  }
}
console.log(`\ncartoon: ${ok}  fallback-initials: ${fell}  failed: ${failed}`);
