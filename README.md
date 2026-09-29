# Mocha Reign Natural Hair Studio & Boutique: website

A launch-ready spec website for **Mocha Reign Natural Hair Studio & Boutique** (Booksy: "Mocha Reign Studios"), the loc studio owned by Tia "MochaReign" Simmons at 1533-4 South Monroe Street, Tallahassee, FL. Built by Couture House Co. (hello@couturehouse.co).

Design direction: "Loc Artistry Atelier". Light, editorial, art-studio. Palette and type come from the MochaReign logo (chocolate brown, magenta, warm cream; Fraunces + Manrope).

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home: hero, proof strip, art-studio story with the loc strand, signature services, gallery band, how booking works, reviews, hair care waitlist form, FAQ, visit, quick facts |
| `services.html` | Complete Booksy menu grouped into 10 categories, sticky category chips, policies, pricing FAQ |
| `gallery.html` | Filterable gallery (All / Locs / Updos & Styles / Micro Locs / Men / Color) with an accessible lightbox |
| `about.html` | The studio: Tia, the studio's approach, the team, hair care in development, quick facts |
| `events.html` | Weddings, bridal showers and homecoming: how to book, what to bring, event inquiry form |
| `book.html` | Book and visit: steps, policies, hours, directions, booking FAQ |
| `404.html` | Branded not-found page (root-absolute asset paths so it works at any URL) |

Every "Book" button goes to the live Booksy page:
https://booksy.com/en-us/86539_mocha-reign-studios_hair-salon_15826_tallahassee

## Stack

Static HTML, one stylesheet, one script. No build step, no external requests.

- `assets/css/site.css`: design tokens, layout, components, custom scrollbar, reduced-motion rules
- `assets/js/js-flag.js`: adds the `js` class to `<html>` (external so the CSP needs no inline script)
- `assets/js/site.js`: menu, gallery filters and lightbox, forms, service chips, today's hours, and the motion
- `assets/vendor/`: GSAP 3.15 (ScrollTrigger, SplitText, DrawSVGPlugin) and Lenis 1.3, self-hosted
- `assets/fonts/`: Fraunces (variable, normal + italic) and Manrope (variable), self-hosted
- `assets/img/`: responsive WebP photos (`NAME.webp` + `NAME-800.webp`), logos, favicon set, `share.jpg`

### Signature motion ("the brushstroke")
- Images and section headings reveal with an organic paint-brush wipe (an animated, ragged clip-path edge) as they scroll into view.
- Brush underlines draw beneath emphasised words (DrawSVG).
- A twisted "loc strand" (two intertwined strands) draws itself down the story section, scrubbed to scroll.
- The home headline letters rise on load with SplitText, after first paint. Lenis provides smooth scrolling.
- `prefers-reduced-motion: reduce` turns all of it off (no Lenis, no hidden states). Nothing is hidden if JavaScript fails: initial hidden states are set by the script itself, and only for elements below the fold.

## Preview locally

```
npx serve .
# or
python -m http.server 8000
```
Then open http://localhost:8000. Forms show a friendly "local preview" message instead of submitting.

## Deploy (Netlify)

1. Drag this folder onto https://app.netlify.com/drop, or connect the repo with publish directory `.` (no build command).
2. Name the site `mocha-reign-natural-hair-studio` so the preview URL matches the canonical tags.
3. In Netlify > Forms, enable form detection. Two forms are included: `product-waitlist` and `event-inquiry`. Add the studio's email under Forms > Notifications.
4. `netlify.toml` sets security headers (strict CSP: `default-src 'self'`, no inline scripts or styles), long caching for `/assets/*`, pretty URLs (`/services`, `/gallery`, `/about`, `/events`, `/book`) and the 404.

## Connecting the studio's own domain

The canonical base URL everywhere is `https://mocha-reign-natural-hair-studio.netlify.app/`. When the real domain is connected (see LAUNCH-NOTES.md), find and replace that string across:
- all `*.html` files (canonical, Open Graph, Twitter, JSON-LD)
- `sitemap.xml`, `robots.txt`, `llms.txt`

Then set the domain as primary in Netlify and update the Google Business Profile website field.

## Files for the team (not served)

`LAUNCH-NOTES.md` (everything to confirm with the owner), `QA-REPORT.md`, this README. Netlify returns 404 for these.
