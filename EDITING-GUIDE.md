# Canopy website: editing guide

This guide is for anyone who updates the website: products, categories, blog posts, photos and SEO.
You do not need to know how to code.

There are two ways to edit. Both change the same files, so use whichever you like.

| | **A. Online editor (CMS)** | **B. Code editor (VS Code etc.)** |
|---|---|---|
| Where | `https://canopyfurniture.com.bd/admin/` | The project folder on your computer |
| Login | GitHub account with access to the repo | None |
| Publishing | Automatic: every "Publish" goes live in about 1–2 minutes | Commit and push to GitHub, then it goes live in about 1–2 minutes |
| Best for | Daily updates, adding products, uploading photos | Bulk changes, many files at once |

---

## 1. Where everything lives

```
content/
  site.json          phone, WhatsApp, email, address, social links, homepage texts (hero, promo bar)
  categories.json    the menu: rooms (Living, Bedroom...) and their categories (Sofas, Beds...)
  sections.json      Home, Blog, Our Works and Areas landing pages (title, subtitle, SEO)
  products/          one .md file per product
  blog/              one .md file per blog post
  works/             one .md file per project ("Our Works")
  areas/             one .md file per local area page (local SEO, e.g. Halishahar)
  testimonials/      one .md file per customer review (shown on the homepage)
  pages/             About, Contact and other plain pages
static/images/       all photos
```

The **file name is the page address.** `content/products/nolan-3-seater-sofa.md` becomes
`/product/nolan-3-seater-sofa/` in English and `/bn/product/nolan-3-seater-sofa/` in Bangla.
Use lower-case letters, numbers and dashes only, with no spaces.

---

## 2. Page controls (on every product, category, blog post and page)

Every product, category, sub-category, blog post, work, area page, page and landing page has these fields.
Leave a field **empty** to use the automatic value.

| Field | What it does | Example |
|---|---|---|
| `draft` | `true` means the page is **not published** at all. It is also removed from menus and lists. | `draft: true` |
| `index` | `false` means the page is published but **Google is asked not to index it**, and it is left out of `sitemap.xml`. | `index: false` |
| `date` | The date in `YYYY-MM-DD` format. Shown on blog posts. Used as "last updated" in the sitemap. | `date: 2026-11-07` |
| `canonical` / `canonical_bn` | Tells Google that **another URL** is the main version of this page. Use it only for duplicate pages. | `canonical: /category/sofas/` |
| `seo_title` / `seo_title_bn` | The title in the browser tab and on Google. **Used exactly as written.** Aim for under 60 characters. | `seo_title: Sofa Price in Chattogram \| Canopy` |
| `subtitle` / `subtitle_bn` | A line shown under the page heading | `subtitle: Solid wood, made in Chattogram` |
| `summary` / `summary_bn` | The meta description (the text under the title on Google). Aim for about 150 characters. | |
| `title` / `title_bn` | The page heading (H1). For categories these are called `en` / `bn`. | |

Fields ending in `_bn` are for the Bangla page (`/bn/...`).
If a Bangla title or subtitle is empty, nothing is shown on the Bangla page.
A Bangla summary falls back to the English one.

> **Draft vs. index:** use `draft: true` to hide something completely, for example a product that is out of stock.
> Use `index: false` when people should still be able to open the page but Google should not list it,
> for example a thank-you page or a seasonal offer.

---

## 3. Add or update a product

### With the online editor
1. Open `/admin/`, then **Products**, then **New Products**.
2. Fill in the name in English and Bangla, choose the **Room** and the **Category**, and enter the **Price**.
   **Old price** is optional and shows crossed out.
3. **Main photo:** click and upload. **More photos:** add extra angles for the product gallery.
4. Optional: **Badge** (New, Sale or Bestseller), plus the page controls from section 2.
5. Write the product description in **Description (English)** and **Description (বাংলা)**.
6. Click **Publish**. The site is live in about 1–2 minutes.

To edit a product, click it in the list, change it and publish again.
To take a product down, turn on **Draft**. Do not delete it unless you are sure, because deleted product links stop working.

### With a code editor
Copy any file in `content/products/`, rename it (for example `oak-tv-cabinet.md`) and edit it:

```markdown
---
title: Oak TV Cabinet
title_bn: ওক টিভি ক্যাবিনেট
category: living            # room slug from categories.json
sub: coffee-tables          # category slug from categories.json
price: 32500
old: 36000                  # optional, shows crossed out
tag: New                    # optional: New | Sale | Bestseller
image: /images/oak-tv-cabinet-1.webp
images: /images/oak-tv-cabinet-1.webp, /images/oak-tv-cabinet-2.webp
summary: Oak TV cabinet with cable management. Free delivery in Chattogram.
summary_bn: কেবল ম্যানেজমেন্টসহ ওক টিভি ক্যাবিনেট। চট্টগ্রামে ফ্রি ডেলিভারি।
# --- page controls ---
subtitle:
subtitle_bn:
seo_title:
seo_title_bn:
date: 2026-11-07
index: true
canonical:
canonical_bn:
draft: false
---
English description here. You can use **bold**, lists (- item) and ## headings.

<!--bn-->
বাংলা বিবরণ এখানে।
```

Everything **above** `<!--bn-->` is the English text, and everything **below** it is the Bangla text.
(The online editor saves the Bangla text in a `body_bn:` field instead. Both ways work.)

---

## 4. Categories (the menu)

The file is `content/categories.json`. In the online editor go to **Categories & section pages**, then **Categories**.

- Each **room** (Living, Bedroom...) has `slug`, `en`, `bn`, `image` (the round picture on the homepage), the page controls, and a list of `subs`.
- Each **sub-category** (Sofas, Beds...) has `slug`, `en`, `bn` and the page controls.
- **To add a category:** add an item to `subs`. Then products can choose it.
- **To hide a category:** set `"draft": true`. Its page, its menu link **and all its products** are hidden.
- **Do not change a `slug`** after the site is live. It changes the URL, and old links and Google rankings break.
  If you must change it, move every product to the new slug as well.

In JSON, text needs quotes and true/false does not, for example `"draft": false`. Every item except the last needs a comma after it.
If the build fails after a hand edit, check the commas and quotes.

---

## 5. Blog posts

**Online editor:** **Blog posts**, then **New**. **Code editor:** add a file in `content/blog/`.

- `date` is the **publish date** shown on the post. Posts are listed newest first.
- `image` is the cover photo.
- Write the post in markdown: `## Heading`, `**bold**`, `- list item`, `[link text](/category/sofas/)`,
  and photos inside the text with `![description](/images/photo.webp)`.
- The Blog landing page (`/blog/`) has its own heading, subtitle and SEO in `content/sections.json`, under **blog**.
  Set `"draft": true` there to hide the whole blog, including its menu link.

## 6. Our Works, area pages, testimonials, pages

These work the same way as blog posts, in their own folders:

- **Our Works** (`content/works/`): project photos go in `image` and `images`.
- **Area pages** (`content/areas/`): one page per Chattogram area for local Google searches.
  Write real local details such as landmarks, delivery time and projects done nearby.
  Do not copy the same text into every area page, because Google ignores duplicate pages.
- **Testimonials** (`content/testimonials/`): `title` is the customer name, `place` is their area, and the text is the review. They are shown on the homepage.
- **Pages** (`content/pages/`): About, Contact and similar. `form: true` adds the enquiry form.

## 7. Homepage texts, phone and links

Edit `content/site.json` in a code editor:
- `phone`, `whatsapp` (digits only, with the country code, for example `8801XXXXXXXXX`), `email`, `address`, `social`
- `formAction`: where enquiry forms are sent (for example your Formspree URL)
- `t.en` / `t.bn`: the promo bar, hero heading (`hero`), hero sub-text (`sub`), hero image (`image`) and dining banner text
- `showrooms`: showroom list
- `diningImage`: the picture in the dining banner

The homepage's Google title, description and index settings are in `content/sections.json`, under **home**.

---

## 8. Photos: sizes and resolution

| Where | Shape | Recommended size (px) | Max file size |
|---|---|---|---|
| Product photos | Portrait **4:5** | **1200 × 1500** | 300 KB |
| Homepage hero image | Landscape 4:3 | 1600 × 1200 | 400 KB |
| Room circles (category `image`) | Square **1:1** | 600 × 600 | 120 KB |
| Blog / Works cover (`image`) | Landscape 16:9 | 1600 × 900 | 300 KB |
| Photos inside blog text | Any | max 1600 wide | 300 KB |
| Dining banner | Landscape 16:10 | 1600 × 1000 | 300 KB |
| Testimonial photo | Square | 400 × 400 | 60 KB (stored, not shown yet) |

Tips:
- **Format:** use **WebP** (best) or JPG at about 80% quality. Use PNG only for logos and graphics. SVG is fine for drawings.
- **Make them small:** drag a photo into <https://squoosh.app>, choose WebP, set quality to 75–80 and resize to the size above, then download.
- **Same shape for every product.** Product cards are cut to 4:5, so a landscape photo loses its sides.
  Keep the furniture in the centre with some space around it.
- **File names:** use lower-case words with dashes, for example `nolan-sofa-grey-front.webp`, not `IMG_2034.JPG`.
  Google reads file names.
- **Uploading:** the online editor puts photos in `static/images/` for you. With a code editor, copy them there
  and write the path as `/images/your-file.webp` (no `static`).
- To replace a photo, upload the new one under a **new file name** and update the field.
  Browsers cache old photos, so reusing a name can keep showing the old one.

---

## 9. Publishing and previewing

- **Online editor:** clicking **Publish** commits to GitHub, and Vercel rebuilds the site in about 1–2 minutes.
- **Code editor:**
  ```
  node build.js          # builds the site into dist/ and shows errors, if any
  npx serve dist         # preview at http://localhost:3000
  git add -A
  git commit -m "Add Oak TV Cabinet"
  git push               # goes live in about 1–2 minutes
  ```
- **Online editor on your own computer, without a GitHub login:** run `npx decap-server` in the project folder.
  In a second terminal run `node build.js && npx serve dist`, then open `http://localhost:3000/admin/`.
  Your changes are saved straight into `content/`. Commit and push them when you are done.

## 10. If something goes wrong

| Problem | Fix |
|---|---|
| Product not showing | Check that `draft` is `false`. Check that `category` and `sub` match slugs in `categories.json`, and that neither of those is a draft. |
| Product shows a beige box instead of a photo | The `image` path is wrong. It must start with `/images/` and match the file name exactly, including upper/lower case. |
| Build fails after editing `categories.json` / `site.json` | A comma or quote is missing. Paste the file into <https://jsonlint.com> to find the line. |
| Build shows "Skipped (no front matter)" | The `.md` file must start with a line `---` and have a second `---` line after the fields. |
| Bangla page shows English text | Fill in the `_bn` field, or add `<!--bn-->` and the Bangla text under the English text. |
| Page not on Google | Check that `index` is not `false`, `draft` is not `true` and `canonical` is empty. Then submit `sitemap.xml` in Google Search Console. |
| Online editor login fails | See "One-time setup" in README.md (GitHub OAuth app and Vercel environment variables). |
