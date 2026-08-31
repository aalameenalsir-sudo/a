# A Solution Storefront Final Visual Rebuild — Design

## Goal
Deliver the final bilingual A Solution Storefront so the visual experience matches the approved A Solution direction instead of a generic commerce template, while preserving the working catalog, cart, checkout, Supabase hydration, account, wishlist, tracking, reviews, and admin features.

## Visual Direction
- Ivory paper background, near-black ink, A Solution coral accent.
- Editorial oversized typography using Space Grotesk/Manrope in English and Alexandria in Arabic.
- Strong geometric A motif, fine construction lines, coral dashed paths, restrained motion, and premium whitespace.
- The home page follows the approved sequence: cinematic hero, Shop by Solutions, black Featured Solutions, Why A Solution Store, final Build CTA.
- Every category and product card uses a real local SVG artwork asset so the experience never depends on stock imagery, external CDNs, or AI-looking photography.
- Arabic is a true RTL composition with equivalent hierarchy and localized copy.

## Functional Direction
- Local catalog renders immediately and remains usable without network access.
- Supabase product hydration happens after the local catalog is visible and must not block rendering.
- Search, category filters, product navigation, wishlist, cart, checkout, and language switching remain functional.
- Direct-file opening remains supported for visual/local catalog testing.
- All local navigation targets explicit HTML files rather than directory indexes.

## Home Page Structure
1. Premium sticky header with wordmark, Store label, primary navigation, language switch, account, wishlist and cart.
2. Hero with `A SOLUTION / STORE`, `DON'T BROWSE SERVICES. FIND YOUR SOLUTION.`, supporting copy, primary CTA, explore control, giant A construction artwork, and capability line.
3. `01 / SHOP BY SOLUTIONS` with seven visual category tiles: Marketing & Advertising, Web & Digital Products, Technology Solutions, Brand & Design Solutions, Events & Experiences, Consulting Solutions, Media & Content Solutions.
4. `02 / FEATURED SOLUTIONS` on black with product artwork, product title, short copy, starting price, product link, wishlist and cart actions.
5. `03 / WHY A SOLUTION STORE?` with Strategic by Design, Results that Move, Secure & Reliable, Fast Delivery.
6. Full catalog/search section that preserves commerce discovery without weakening the approved visual hierarchy.
7. `04 / LET'S BUILD` with the approved problem/solution message and project CTA.

## Reliability Requirements
- No duplicate global JavaScript declarations.
- Missing/failed remote data must fall back to local catalog.
- Every referenced local image, script, stylesheet, and HTML target must exist.
- JavaScript syntax must pass `node --check`.
- Existing and new automated tests must pass.
- ZIP integrity must be verified before delivery.
