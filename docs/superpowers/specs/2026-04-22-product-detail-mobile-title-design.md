# Product Detail Mobile Title Design

**Goal**

Move the product name block above the product image on the public product detail page for mobile viewports, while keeping the desktop two-column layout unchanged.

**Scope**

- Public storefront only
- Product detail route (`/produto/:slug`)
- Mobile-first ordering change for category + product title

**Design**

- Keep the existing desktop grid and information column structure.
- Render the title block twice with breakpoint-controlled visibility:
  - a mobile-only title block above the image inside the media column;
  - a desktop-only title block at the top of the information column.
- Leave pricing, stock, variations, quantity, CTA buttons, suggestions, and navigation unchanged.

**Why this approach**

- It is the lowest-risk way to change only mobile ordering.
- It avoids rearranging the desktop column structure.
- It keeps the existing Tailwind breakpoint behavior explicit and easy to verify.

**Risks**

- Duplicated heading markup can drift if edited in only one place.
- Responsive visibility classes must be correct or both titles could appear together.

**Mitigation**

- Extract a small shared title block renderer in the same file.
- Add a regression test that checks the mobile and desktop visibility hooks in `ProductDetail.tsx`.
