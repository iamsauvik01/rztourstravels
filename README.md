# R&Z Tours and Travels — Website

A static, production-ready tourism website for **R&Z Tours and Travels**, a travel agency in Shillong, Meghalaya.
It is built with plain HTML5, CSS3 and jQuery 3.7.1. There is no build step, no framework and no npm.

---

## 1. How to run

**Option A: open the file directly.** Double-click `index.html`. Everything works over `file://`, including page transitions, galleries, filters and the package preselect on the contact form.

**Option B: run a local server** (closer to how the site behaves when hosted):

```bash
# from the project folder
python -m http.server 8000        # or: python3 -m http.server 8000
# or
npx serve .
```

Then visit <http://localhost:8000>.

**To deploy**, upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, cPanel, S3, etc.). No server-side code is needed.

> An internet connection is needed for Google Fonts, jQuery (code.jquery.com, pinned with an SRI hash) and the Google Map embed. All photographs are stored locally.

---

## 2. File structure

```
/index.html                 Home: hero slideshow, counters, featured packages, destinations, testimonials, gallery
/about.html                 Story, mission & values, timeline, team
/packages.html              Filterable grid of all 7 packages
/reviews.html               Rating summary + 12 review cards (placeholders)
/contact.html               Enquiry form (Formspree), contact cards, map, FAQ
/packages/
  shillong-city-escape.html
  sohra-waterfalls-trail.html
  dawki-mawlynnong.html
  living-root-bridges-trek.html
  laitlum-mawphlang-offbeat.html
  meghalaya-grand-tour.html
  honeymoon-in-the-clouds.html
/assets/css/style.css       The one shared stylesheet (design tokens at the top)
/assets/js/main.js          The one shared script (modules run only if their markup exists)
/assets/images/             42 locally stored photographs (see credits below)
/README.md
```

The header and footer are written directly into every page so the site works without a server.
**If you change the header or footer, make the same change on all 12 pages.** Package pages sit one folder down, so their links start with `../`.

---

## 3. Editing content

### Editing a package
Each package has its own page in `/packages/`. Inside a package page:

| What | Where to look |
|---|---|
| Name, tagline, duration chips | `<section class="page-hero">` at the top of `<main>` |
| Quick facts (duration, season, difficulty, group size, price) | `<div class="facts">` |
| Overview text + booking card price | `<!-- ===== OVERVIEW ===== -->` |
| Day-by-day itinerary | `<div class="accordion" id="itinerary">`. Each day is one `.acc-item`. Copy one to add a day and update the `day-N` ids. |
| Highlights | `<ul class="highlights">` |
| Inclusions / exclusions | `.incl__col--yes` and `.incl__col--no` lists |
| Gallery | `<div class="masonry" data-gallery>`. Each `<a>`'s `href` is the large image the lightbox opens. |
| Related packages | `<!-- ===== RELATED ===== -->` |

A package's **card** appears in several places. If you change its price, name or teaser, update it in each of these:
`index.html` (featured, 6 cards), `packages.html` (all 7), and the "You may also like" section of other package pages.
Search the project for the package slug (e.g. `dawki-mawlynnong`) to find every occurrence.

### Adding a new package
1. Duplicate an existing file in `/packages/` and rename it, e.g. `/packages/garo-hills-explorer.html`.
2. Update its content, `<title>`, meta description and the `?package=` value in its "Book" links.
3. Add a card to `packages.html`. Set `data-category` to any of `short adventure leisure honeymoon`; the filter buttons pick it up automatically.
4. Add an `<option value="garo-hills-explorer">` to the package dropdown in `contact.html`.
5. Add it to the footer "Packages" list on every page.

### Filters
Filter buttons live in `packages.html` (`data-filter="short"`, etc.). A card matches a filter when its `data-category` contains that word.
You can deep-link to a filter: `packages.html#honeymoon`.

### Colours, fonts and spacing
All design tokens are CSS custom properties at the top of `assets/css/style.css`: `--pine-*`, `--fog-*`, `--cream`, `--gold`, the type scale `--fs-*`, spacing `--space-*`, radii and shadows.

---

## 4. Contact form (Formspree)

The form in `contact.html` posts to Formspree:

```html
<form id="enquiry-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" novalidate>
```

1. Create a free account at <https://formspree.io> and add a new form.
2. Copy your form ID (the part after `/f/`, e.g. `xyzabcd`).
3. In `contact.html`, replace `YOUR_FORM_ID` with your ID.
4. Submit a test enquiry and confirm the email in Formspree.

**Demo mode:** while the action still contains `YOUR_FORM_ID`, `main.js` validates the form and shows the success state without sending anything. Once you add a real ID, submissions are sent with AJAX (`Accept: application/json`). If sending fails, an inline error appears.
The form includes a `_gotcha` honeypot field for spam and a `_subject` line for the notification email.

**Package preselect:** every "Book This Package" button links to `contact.html?package=<slug>`. `main.js` reads the parameter and selects the matching option in the dropdown. The `value`s in the dropdown must match the page slugs.

---

## 5. Placeholder checklist (replace before launch)

Search the project for each placeholder below. Most are also marked in the HTML with `PLACEHOLDER` comments.

- [ ] **Phone**: `+91 XXXXX XXXXX` (shown as `+91&nbsp;XXXXX&nbsp;XXXXX`) and `tel:+91XXXXXXXXXX`. Appears in the header mobile menu, footer and contact page on all 12 pages, and in the JSON-LD on `index.html`.
- [ ] **WhatsApp**: `https://wa.me/91XXXXXXXXXX`. Floating button, footer, CTAs and booking cards.
- [ ] **Email**: `hello@rztours.example`.
- [ ] **Address**: `Shop No. XX, Placeholder Building, Police Bazaar, Shillong, Meghalaya 793001` (footer, contact page, JSON-LD). The map embed already points to Police Bazaar; update its `q=` parameter if needed.
- [ ] **Office hours**: footer, contact page and JSON-LD `openingHoursSpecification`.
- [ ] **Prices**: every price has a `<!-- PLACEHOLDER PRICE — update before launch -->` comment next to it (cards, facts bar and booking card).
- [ ] **Reviews**: `reviews.html` (marked `PLACEHOLDER REVIEWS`) and the home page testimonial carousel (marked `PLACEHOLDER TESTIMONIALS`). These are sample texts; replace them with real, permission-granted reviews. Update the average rating and breakdown to match.
- [ ] **Stats**: home page counters (4,800+ travellers, 1,250+ tours, 12 years, 40+ destinations), marked `PLACEHOLDER STATS`.
- [ ] **Team**: names, roles and bios on `about.html` (marked `PLACEHOLDER TEAM`). The portraits are monogram placeholders. Swap the `.member__photo` div for an `<img>` when real photos are available. The founder name also appears in the home page intro signature.
- [ ] **Milestones**: `about.html` timeline (marked `PLACEHOLDER MILESTONES`). The founding year 2014 also appears in the home page intro.
- [ ] **Social links**: footer icons currently point to generic Instagram, Facebook and YouTube home pages, and to the JSON-LD `sameAs`.
- [ ] **Domain**: `https://www.rztours.example` in Open Graph tags (`og:url`, `og:image`) and JSON-LD. Replace it with your live domain so social previews work.
- [ ] **Formspree form ID**: see section 4.
- [ ] Policies quoted in the FAQ and booking card (advance payment, "free changes up to 14 days") should match your real terms.

---

## 6. Features & behaviour notes

- **Preloader** shows once per browser session (`sessionStorage`), then a curtain transition plays between pages. The back/forward cache is handled with `pageshow`, so the curtain never gets stuck.
- **Failsafe:** if jQuery or `main.js` fails to load, a tiny inline script reveals the page after 4 seconds.
- **Reduced motion:** with `prefers-reduced-motion`, parallax, Ken Burns, word reveals and scroll animations are disabled, and transitions become instant fades.
- **Touch devices / small screens:** parallax is off, animations are shorter, the destination strip and carousels use native swipe, and the lightbox supports swipe (swipe down closes it).
- **Accessibility:** skip link, a single `h1` per page, keyboard-operable menu (focus trap, Esc), accordions (arrow/Home/End keys), carousel (arrow keys, pause on hover/focus), lightbox (Esc, arrows, focus trap, focus return), a pause button on the hero slideshow, and visible focus rings.
- **SEO:** unique titles and descriptions, Open Graph and Twitter tags, an inline SVG favicon, and `TravelAgency` JSON-LD on `index.html`.

---

## 7. Image credits

All photographs come from **Wikimedia Commons**. They were verified (HTTP 200, `image/jpeg`), downloaded and resized (1280 px for cards and galleries, 1920 px `-hero` versions for full-width heroes). No other edits were made.
Photographs under CC BY / CC BY-SA require attribution. That is provided in the **"Photo credits"** panel in every page footer, and the author and licence also appear in the lightbox caption for gallery images. CC0 images need no attribution but are credited anyway. If you add or replace a photo, update both this table and the footer credits.

| File(s) | Subject | Author | Licence | Source |
|---|---|---|---|---|
| `arwah-cave.jpg` | Arwah Cave, Sohra | Wann Majaw | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Arwah_Cave.jpg) |
| `balancing-rock.jpg` | Balancing Rock, Mawlynnong | Nirbangogoi | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Balancing_Rock,Mawllynong.jpg) |
| `dainthlen-falls-sunset.jpg` | Dainthlen Falls at sunset | Wann Majaw | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Dainthlen_Falls_Sunset.jpg) |
| `dawki-suspension-bridge.jpg` | Dawki bridge over the Umngot | ANKAN | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Dawki_Bridge_and_Umngot_River.jpg) |
| `double-decker-root-bridge.jpg`, `double-decker-root-bridge-hero.jpg` | Double Decker Root Bridge, Nongriat | Chiranjeeb Baul | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Double_decker_living_root_bridge_01.jpg) |
| `double-decker-root-bridge-river.jpg` | Double Decker Root Bridge | Arup619pal | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Double_decker_living_root_bridge_at_Meghalaya.jpg) |
| `elephant-falls.jpg` | Elephant Falls, Shillong | Sudip2104 | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Elephant_Falls_Shillong_long_exposure.jpg) |
| `khasi-hills-dawn.jpg`, `khasi-hills-dawn-hero.jpg` | West Khasi Hills at dawn | Timothy A. Gonsalves | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Dawn_West_Khasi_Hills_Mawphanlur_Oct24_A7CR_04276.jpg) |
| `khasi-hills-dusk.jpg` | Khasi Hills at dusk | Timothy A. Gonsalves | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Dusk_West_Khasi_Hills_Mawphanlur_Oct24_A7CR_04274.jpg) |
| `krang-suri-falls.jpg` | Krang Suri Falls, Jaintia Hills | Abhimanyu Pathak | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Krang_Suri_Falls.jpg) |
| `krang-suri-falls-aerial.jpg` | Krang Suri Falls from above | ANKAN | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Krang_Suri_Waterfall.jpg) |
| `laitlum-canyons.jpg`, `laitlum-canyons-hero.jpg` | Laitlum Canyons, East Khasi Hills | ANKAN | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Laitlum_Canyon_(4).jpg) |
| `laitlum-grasslands.jpg` | Grasslands at Laitlum | Medhi jyoti | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Laitlum_Canyon,_Meghalaya.jpg) |
| `laitlum-viewpoint-clouds.jpg` | Above the clouds, Laitlum | JyotiPN | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Laitlum_in_monsoon_season.jpg) |
| `living-root-bridge-roots.jpg` | Roots of a living bridge | Ashwin Kumar | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Double_Decker_Living_Root_Bridge3.jpg) |
| `mawlynnong-village-lane.jpg` | A lane in Mawlynnong | Sai Avinash | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Street_in_Mawlynnong.jpg) |
| `mawlynnong-village-square.jpg` | Mawlynnong village | Madhumita Das | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Mawlynnong_-_Cleanest_village_of_Asia_in_Meghalaya.jpg) |
| `mawphlang-river-gorge.jpg` | River gorge near Mawphlang | Prida Ariani | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Khasi_Hills,_Mawphlang.jpg) |
| `mawphlang-sacred-forest.jpg` | Mawphlang Sacred Forest | Daniel Romanson | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Trees_of_Mawphlang_Sacred_Forest_Meghalaya.jpg) |
| `mawsmai-cave.jpg` | Inside Mawsmai Cave | Wann Majaw | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Mawsmai_cave.jpg) |
| `nohkalikai-falls-cascade.jpg` | Nohkalikai Falls in the monsoon | Photos Worldwide | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Powerful_Nohkalikai_Waterfall.jpg) |
| `nohkalikai-falls-clouds.jpg`, `nohkalikai-falls-clouds-hero.jpg` | Nohkalikai Falls, Sohra | JakilDedhia | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Cherrapunji_Waterfalls_Over_the_clouds.jpg) |
| `nohkalikai-falls-plunge-pool.jpg` | Nohkalikai Falls and its plunge pool | Vikramjit Kakati | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:NohKaLikai_Falls_V2_Wiki.jpg) |
| `nohkalikai-falls-rainbow.jpg` | Rainbow at Nohkalikai Falls | Jyotishkardey | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Nohkalikai_Falls_of_Cherrapunji_in_summer.jpg) |
| `nongriat-root-bridges.jpg` | Root bridges of Nongriat | PJeganathan | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Living_root_bridges_of_Nongriat_village_in_East_Khasi_Hills_district,_Meghalaya_JEG7387.jpg) |
| `rainbow-falls-nongriat.jpg` | Rainbow Falls, Nongriat | Saurabhsawantphoto | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:SaurabhSawant_RainbowFalls_Nongriat_MG_2913.jpg) |
| `rainbow-falls-pool.jpg` | The blue pool at Rainbow Falls | Rajesh Rane | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Rainbow_Waterfall_Meghalaya.jpg) |
| `riwai-living-root-bridge.jpg` | Living Root Bridge, Riwai | Keshuseeker | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Root_Bridge,_Mawlynnong...jpg) |
| `root-bridge-natural-pool.jpg` | Double Decker Root Bridge and pool | Jayesh minde | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:The_double_decker_living_root_bridge.jpg) |
| `seven-sisters-falls-valley.jpg`, `seven-sisters-falls-valley-hero.jpg` | Seven Sisters Falls, Sohra | Trideep Dutta Photography | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Seven_Sisters_Falls.jpg) |
| `shillong-festive-night.jpg` | Shillong at Christmas | Ganesh Mohan T | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Shillong_during_night_01.jpg) |
| `shillong-peak-view.jpg` | Shillong from Shillong Peak | Rachit | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:View_from_Shillong_Peak.jpg) |
| `shillong-pine-hills.jpg` | Pine hills above Shillong | Aadri | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Shillong_from_Shillong_Peak.jpg) |
| `shillong-pine-sunset.jpg`, `shillong-pine-sunset-hero.jpg` | Sunset over the pines, Shillong | Akynehu | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Sunset_in_Shillong,_East_Khasi_Hills,_Meghalaya.jpg) |
| `sohra-cliffs-green.jpg` | The cliffs of Sohra | ANKAN | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Seven_Sisters_Waterfalls_(4).jpg) |
| `sohra-misty-valley.jpg`, `sohra-misty-valley-hero.jpg` | Mawkdok Dympep Valley, Sohra | BroKholi94 | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:View_from_Mawkdok_Dympep_Valley_View_Point,_Cherrapunji,_Meghalaya,_India_in_April_2017.jpg) |
| `umiam-lake-aerial.jpg`, `umiam-lake-aerial-hero.jpg` | Umiam Lake, Ri-Bhoi | Prof. Vikramjit Kakati | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Umiam_Lake,_Shillong,_Meghalaya.jpg) |
| `umiam-lake-island.jpg` | Morning on Umiam Lake | Ganesh Mohan T | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Umiam_lake_01.jpg) |
| `umiam-lake-pines.jpg` | Umiam Lake | ANKAN | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Umiam_Lake_from_View_Point.jpg) |
| `umiam-lake-sunset-sails.jpg`, `umiam-lake-sunset-sails-hero.jpg` | Sails at sunset, Umiam Lake | Gargi Gore | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Umiam_Lake.jpg) |
| `umngot-river-clear-water.jpg` | The clear Umngot River, Dawki | ANKAN | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Clear_Water_of_Umngot_River.jpg) |
| `umngot-river-gorge.jpg`, `umngot-river-gorge-hero.jpg` | Umngot River, Dawki | ANKAN | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Umngot_River_View.jpg) |

Licence texts: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)

Icons are hand-drawn inline SVGs. The fonts are [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) and [Manrope](https://fonts.google.com/specimen/Manrope), both under the SIL Open Font License, served by Google Fonts.
