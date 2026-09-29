# Arcova site v2
Static site (no build): index.html, styles.css, main.js (motion, cursor, cylinder), i18n.js (ES/EN), arc.js (2D pinned arc section), cosmos.js/.css (canvas background of the kinetic section), arch3d.js/.css (Three.js hero: glass rings → arch).
- Use the `premium-3d-web` skill for any visual/animation work and `arcova-infra` for deploys/repos.
- Local preview: `python3 -m http.server 8766` → QA with `node ~/.claude/skills/premium-3d-web/scripts/shoot.js http://localhost:8766/`.
- Git + DEPLOY: arcovaco.com is served by Arcova's own Netlify account with continuous deployment from `github.com/JAOCruz/arcova-landing` branch **`arcova-studio-v2`**. `git push origin main:arcova-studio-v2` = **production deploy**. Only push verified work (QA with shoot.js first) and tell Juan before pushing. Remote `main` still holds the partner's old React site — don't touch without asking.
- The old CLI-deployed site `arcova-studio` (id 9d4ae3da-…) in Juan's personal Netlify is obsolete (to be deleted); never deploy to it.
- Contact email is projects@arcovaco.com. Team: Laura Ortiz, Geffri González, Juan Aulio Ortiz.
- SEO (skill `local-seo-analytics`): title/description in index.html AND i18n.js (`meta.title`/`meta.desc`), JSON-LD ProfessionalService in `<head>`, robots.txt, sitemap.xml, llms.txt, assets/og.jpg (1200×630). Official domain is **https://arcovaco.com** (live since 2026-09-29; www/http redirect to it). All SEO URLs use it; arcova-studio.netlify.app is only the Netlify default URL.
- GA4: set `GA_ID` in `analytics.js` (empty = disabled). Events: whatsapp_click, phone_click, email_click; consent banner built in.
