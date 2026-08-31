# A Solution Storefront Final Visual Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the bilingual storefront home experience to the approved A Solution visual direction while preserving reliable commerce behavior.

**Architecture:** Keep the existing static HTML/CSS/classic-JavaScript architecture and Supabase REST integration. Replace only the storefront presentation layer and card rendering contracts, add local SVG visual assets, and keep product/catalog data and commerce flows backward-compatible.

**Tech Stack:** HTML5, CSS3, classic JavaScript, local SVG assets, Supabase REST/Edge Functions, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-01-storefront-final-visual-rebuild-design.md`

## Global Constraints
- English storefront remains `store/` and Arabic storefront remains `ar/store/`.
- Direct-file opening must render the local catalog without requiring a web server.
- No service-role key may appear in browser files.
- Visual identity remains ivory, black, coral, editorial typography, geometric A construction language.
- Arabic must be true RTL with Alexandria typography.

---

### Task 1: Visual Contract Regression Test
**Files:** Create `tests/storefront-visual-contract.test.mjs`.
**Interfaces:** Consumes the two storefront HTML files and shared CSS; produces a regression contract for approved sections, asset references, bilingual direction and artwork files.
- [ ] Write a failing Node test that expects the approved section labels, seven category cards, featured section, why section, final CTA, and local visual asset files.
- [ ] Run it and confirm it fails against v7.
- [ ] Keep the test as a permanent regression test.

### Task 2: Local Artwork System
**Files:** Create `store/assets/visuals/*.svg` for seven categories and six product families.
**Interfaces:** Produces local image paths consumed by homepage HTML and `store-app.js`.
- [ ] Create SVG artwork using the A Solution geometric language with ivory/black/coral, grid lines, abstract letterforms and solution-specific symbols.
- [ ] Avoid embedded scripts, external references and fonts inside SVGs.
- [ ] Verify all assets parse as XML and are referenced by the storefront.

### Task 3: English and Arabic Homepage Rebuild
**Files:** Modify `store/index.html`, `ar/store/index.html`.
**Interfaces:** Produces stable DOM hooks `#catalog`, `#filters`, `#cart-drawer`, category anchors and commerce data attributes used by `store-app.js`.
- [ ] Replace the v7 simplified layout with approved hero, seven category tiles, featured black section, why section, catalog discovery section and final CTA.
- [ ] Preserve explicit HTML navigation targets and bilingual reciprocal links.
- [ ] Keep existing JS hook IDs/data attributes intact.

### Task 4: Premium Shared CSS and Motion
**Files:** Modify `store/store.css`.
**Interfaces:** Styles all storefront/account/product/checkout pages while retaining admin utility classes already used elsewhere.
- [ ] Add premium header, hero construction system, category artwork cards, black featured section, why cards, catalog cards, CTA and responsive rules.
- [ ] Add restrained reveal/hover motion and `prefers-reduced-motion` handling.
- [ ] Preserve checkout/account/admin utility styling contracts.

### Task 5: Product Rendering Integration
**Files:** Modify `store/store-app.js`.
**Interfaces:** Adds `visualForProduct(id)` and renders featured products into `#featured-catalog` plus full catalog into `#catalog`; existing cart/wishlist functions remain unchanged.
- [ ] Update product card markup to include local SVG artwork and premium metadata layout.
- [ ] Render featured products independently while maintaining full catalog filtering/search.
- [ ] Ensure remote hydration updates both featured and full catalog and cannot block local render.

### Task 6: Verification and Final Package
**Files:** Create `FINAL-DELIVERY-NOTES.txt`; package all files into final ZIP.
**Interfaces:** Delivers a single replace-all package.
- [ ] Run full Node test suite and require zero failures.
- [ ] Run `node --check` on every storefront/admin JavaScript file.
- [ ] Verify every local href/src target referenced by storefront HTML exists.
- [ ] Parse every SVG as XML.
- [ ] Create final ZIP and run ZIP integrity test.
