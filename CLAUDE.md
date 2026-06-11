# CLAUDE.md — eng-ahmed

Marketing / portfolio site for engineer Ahmed Almobayd. Bilingual (Arabic default / English), image-heavy, with a single live lead form.

> NOTE: There is a sibling project `../ahmed-almobyd` in the same parent folder. It is a **separate** project — do not touch it when working here.

## Stack
- **Next.js 16** (App Router) + **React 19**
- **MUI 7** (Material-UI) for UI + theming — no Tailwind
- **i18next** (`react-i18next`) for i18n, cookie + `?lng=` query param based
- **Emotion** + `stylis-plugin-rtl` for RTL
- **gsap** (hero animations) + **swiper** (testimonials carousel)
- JavaScript / JSX only — **no TypeScript**
- Dev port: `next dev` (3000) · Prod: `next start -p 3005`

## Scripts
```bash
npm run dev      # local dev
npm run build    # next build
npm run start    # next start -p 3005
npm run lint     # eslint
```

## Environment variables
Client-side only (`NEXT_PUBLIC_*`), set in `.env` (gitignored — not committed):
- `NEXT_PUBLIC_URL` — backend base URL; booking form POSTs to `${NEXT_PUBLIC_URL}/client/new-lead/register?lng=`
- `NEXT_PUBLIC_SITE_URL` — canonical site URL for SEO/JSON-LD (defaults to `https://ahmadmobayed.com`)
- `NEXT_PUBLIC_REGISTER_URL` — (currently defined twice in `.env`; second wins)

## Architecture map

### Routing (`src/app`)
- `layout.js` — root layout: providers (MUI, Toast, Cookies), Navbar/Footer, JSON-LD (Person + Organization), sets `<html lang/dir>` from `i18next` cookie (default `ar`).
- `page.js` — home; renders `MainPage` (grid of cards).
- `about/` — composes ~13 sections from `src/app/sections/*`.
- `booking/` — video + `BookingForm`.
- `projects/` and `projects/[id]/` — list + dynamic detail (gallery lightbox, related projects, Article JSON-LD).
- `privacy/`, `terms/` — static legal pages from i18n data.
- Per-route `generateMetadata()` for SEO; JSON-LD helpers in `seo/jsonLdHelpers.js`.

### Components (`src/app/component`)
Organized by domain: `buttons/`, `cards/`, `form/` (+ `inputs/`), `navigations/`, `pages/`, `projects/`, `image-containers/`, `feedback/loaders/`. PascalCase names. **No barrel/index files.** Client components carry `"use client"` (often `*Client.jsx` suffix).

### Sections (`src/app/sections`)
13 server components composing the About/home pages (Hero, About, Stages, Companies, OurNumbers, FAQ, Testimonials, etc.).

### Data layer (`src/app/data/*.js`)
**All content is hardcoded**, bilingual via `arXxx` / `enXxx` exports. No DB, no API routes. Largest: `projects.js` (~475 lines), `meta.js` (~426). `constants.js` holds colors, social links, WhatsApp number.

### i18n (`src/app/i18n`)
- `index.js` — server `getTranslation(lng, ns="translation")`, lazy-loads `locales/{lng}/{ns}.js`.
- `client.js` — client `useTranslation` hook (cookie sync, LanguageDetector).
- `settings.js` — `fallbackLng="ar"`, `languages=["ar","en"]`, cookie `i18next`.
- `locales/{ar,en}/translation.js` — re-export the `data/*` objects.
- Language flows through `?lng=` query param everywhere.

### Providers (`src/app/providers`)
- `MUIProvider.jsx` — central theme (palette brown #594534 / taupe / highlight, Rubik font, component overrides). **Root RTL CacheProvider is commented out.**
- `ToastLoadingProvider.jsx` — react-toastify + global loading context (`useToastContext`).
- `LanguageCacheProvider.jsx` — Emotion RTL cache (currently used only inside form + lightbox).

### Forms
`form/BookingForm.jsx` — manual `useState` (no react-hook-form), client-only validation, phone via `mui-tel-input`. Submits through `utility/handleSubmit.js` → external backend.

### Styling
MUI `sx` prop + theme. Minimal `globals.css` (project-card hover, scrollbar) + one CSS module for the loader. Theme lives in `MUIProvider.jsx`.

## Conventions
- Server components do data + i18n; `"use client"` only where interactive.
- Read content from i18n `t(...)` / `data/*`; colors from `data/constants`.
- Add new pages with a `layout.jsx` exporting `generateMetadata()`.
- Project images live at `public/projects/project-{id}/{n}.jpg`.

## Fixed (June 2026 cleanup pass)
- ✅ Removed dead deps `framer-motion` + `react-slick` (zero imports) and the stray `// react-slick` comment.
- ✅ Deleted dead file `projects/[id]/OldPage.jsx`.
- ✅ `projects/[id]/page.jsx`: added `notFound()` for missing project, null-safe `relatedIds`, guarded `otherLngProject`, removed debug `console.log`, gave the page a real `<h1>`.
- ✅ `BookingForm.jsx`: fixed the list-`key` (now `<Fragment key>`), wired proper `onSubmit` + `type="submit"` (Enter-to-submit). RTL left untouched.
- ✅ Removed `console.log` in `PhoneInput.jsx` and `// return;` debug in `booking/page.jsx`.
- ✅ SEO: replaced the duplicated static `sitemap.xml` files with a dynamic `app/sitemap.js` (enumerates project ids), added `app/robots.js`, added `metadataBase` in the root layout.
- Verified: `npm run build` passes; `/sitemap.xml` and `/robots.txt` are served.

## Known issues / gotchas still open
- **Images**: most use raw `<img>` (`Box component="img"`) instead of `next/image`. **Intentionally deferred** — will decide later. Don't migrate without asking.
- **RTL**: theme `direction` is commented out and RTL cache only wraps form/lightbox. **The owner considers RTL correct — do NOT touch any RTL/direction code.**
- **i18n**: ~108 inline `lng === "ar" ? ... : ...` ternaries instead of `t(...)`. Left as-is by owner preference.
- **Lint**: pre-existing `react-hooks/set-state-in-effect` error in `component/feedback/loaders/DotsLoader.jsx` (does not block build).
- **README** is essentially empty.
- Internal navigation sometimes uses `<a>` / `Box component="a"` instead of `next/link`.
- Inconsistent file-name typos: `privcay.js`, `Testmonail*`, `SuccessJournay*`, `SolcialMediaIcons`.
