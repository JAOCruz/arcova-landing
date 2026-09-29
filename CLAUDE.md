# Arcova site v2
Static site (no build): index.html, styles.css, main.js (motion, cursor, cylinder), i18n.js (ES/EN), arc.js (2D pinned arc section), cosmos.js/.css (canvas background of the kinetic section), arch3d.js/.css (Three.js hero: glass rings → arch).
- Use the `premium-3d-web` skill for any visual/animation work and `arcova-infra` for deploys/repos.
- Local preview: `python3 -m http.server 8766` → QA with `node ~/.claude/skills/premium-3d-web/scripts/shoot.js http://localhost:8766/`.
- Git: push to `origin main:arcova-studio-v2` (never to remote `main`, which is the partner's React site, without asking).
- Deploy (user runs it): `netlify deploy --prod --dir . --site 9d4ae3da-a246-4a85-a373-73d586e6adb7`.
- Contact email is projects@arcovaco.com. Team: Laura Ortiz, Geffri González, Juan Aulio Ortiz.
- SEO (skill `local-seo-analytics`): title/description in index.html AND i18n.js (`meta.title`/`meta.desc`), JSON-LD ProfessionalService in `<head>`, robots.txt, sitemap.xml, llms.txt, assets/og.jpg (1200×630). **When moving to arcovaco.com**, replace `https://arcova-studio.netlify.app` everywhere (canonical, og:url, JSON-LD, robots, sitemap, llms.txt).
- GA4: set `GA_ID` in `analytics.js` (empty = disabled). Events: whatsapp_click, phone_click, email_click; consent banner built in.
