# QA report: Mocha Reign spec site (28 Sep 2026)

Run locally with `python3 -m http.server` and Playwright Chromium.

## Visual review
- Full-page screenshots of all 7 pages at 390x844 and 1440x900 were captured and reviewed by eye, then iterated:
  - moved the hero's vertical address line off the photo; covered the hero photo's TikTok watermark with the rating badge
  - swapped every inner-page hero and several section images to watermark-free photos; top-cropped two others
  - fixed the map pin overlapping the map card heading; fixed the product photo crop (landscape radius, bottles only)
  - fixed service card numbers hidden under photos; stacked price lines consistently
  - removed the cream strip under the footer on mobile; fixed the clipped descender in the footer wordmark
  - arch frames only on portrait gallery tiles; about-page loc strand positioning; utility spacing overrides
- Mid-animation captures confirmed the brush wipe and the scroll-scrubbed loc strand render as intended.

## Automated checks (all passing)
| Check | Result |
| --- | --- |
| Console errors / page errors / failed requests, every page, 390 and 1440 | 0 |
| Same pages served with the production CSP (`default-src 'self'`, no inline script or style) | 0 violations |
| Horizontal overflow at 320px and 390px, every page | 0px |
| External requests at runtime (fonts, CDNs, maps) | none |
| Internal links, assets, srcset entries, lightbox sources, in-page anchors | all resolve |
| JSON-LD blocks (HairSalon, WebSite, BreadcrumbList, FAQPage) | 16 blocks, all parse with `json.loads` |
| Exactly one `<h1>` per page | yes, 7/7 |
| Every `<img>` has alt, width, height | yes (70 images) |
| Emoji scan (all site files except vendored libraries) | none |
| Titles <= 60 chars, descriptions <= 158 chars | yes |
| External links limited to Booksy, Instagram, Google Maps, couturehouse.co | yes |
| Tap targets under 44px (excluding inline text links) | none |
| Reduced-motion emulation: no clipped elements, Lenis off, strokes fully drawn | yes, every page |
| JavaScript disabled: all content visible | yes |
| Mobile menu: opens, focus moves in, Escape closes and returns focus, aria-expanded updates | yes |
| Gallery: filters update count; lightbox opens by keyboard, arrow keys navigate, focus trapped, Escape returns focus | yes |
| Forms on localhost show the local-preview message instead of submitting | yes |

## Not verified here
- Lighthouse scores (no Lighthouse runner in this environment). Built to budget: no external requests, self-hosted fonts with the display face preloaded, hero image preloaded with `fetchpriority="high"`, lazy-loaded below-the-fold images with explicit dimensions, all scripts deferred.
- Netlify Forms submission and headers (need a live deploy).
