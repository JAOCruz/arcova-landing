# Arcova Visual-Literacy Filter

Use this filter before adding any asset, section, or style decision to an Arcova property. If the answer to any question is "no," reject the asset or simplify the section.

## 1. One idea per section
- Does this section communicate exactly **one** promise, service, or action?
- If it says two things, split it into two sections or cut the weaker idea.

## 2. Type does the work
- Is the headline the biggest, most confident element on the section?
- Is body text 2–3 short lines maximum, left-aligned, and easy to scan?
- No centered paragraphs. No walls of text.

## 3. Color discipline
- Backgrounds: warm cream `#F6F4EF`, stone `#EFEBE4`, or ink `#0A0A0A`.
- Type: near-black `#111111` on light, white `#FFFFFF` on dark.
- Accent: one electric indigo `#4F46E5`. Use it for CTAs, numbers, and one highlight only.
- No random gradients, no glassmorphism, no decorative glows.

## 4. Grid first, decoration never
- Does the layout rely on a clear 12-column grid, generous whitespace, and strong alignment?
- If an element is purely decorative (orb, blur, floating shape), remove it.

## 5. Photography earns its place
- Is the image human, high-contrast, and focused on a single subject?
- Does it support the headline, not replace it?
- No stock collages, no generic illustrations, no clipart icons where a word would do.

## 6. Motion is directional
- Does animation reveal content (fade/slide up or in) and then stop?
- No infinite floating, pulsing, wobbling, or parallax on decorative elements.
- Always respect `prefers-reduced-motion`.

## 7. Production finish
- Semantic HTML, proper heading order, `aria-label`s, visible focus states.
- Contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text.
- Mobile-first responsive layout; no horizontal scroll or layout shift.
- Build passes `tsc && vite build` and `eslint .` without errors.

## Genre summary
Arcova is **editorial + Swiss + tech**: confident typography, clean grid, warm but neutral palette, high-contrast photography, and motion that serves clarity. Every asset must feel like it belongs in a design annual, not a startup template.
