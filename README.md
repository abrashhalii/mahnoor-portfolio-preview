# Mahnoor Paracha — Personal Website

A single-page, fully animated personal portfolio built with plain HTML/CSS/JS plus a vendored
copy of GSAP + ScrollTrigger — no build step, no framework, no backend, no CDN dependency. That
makes it a perfect fit for GitHub Pages: drop the files in a repo, flip one setting, and it's live.

## Structure

```
index.html                    All page content/sections
assets/css/style.css          Design system + styles
assets/js/main.js             Hero entrance timeline, scroll-triggered stagger reveals,
                               parallax background, animated timeline connector, magnetic
                               buttons, photo tilt, typed role text, animated stat counters
assets/js/vendor/             GSAP + ScrollTrigger (vendored locally, MIT licensed)
assets/files/                 Downloadable CV (linked from the "Download CV" buttons)
assets/img/profile-circle.png Profile photo, pre-cropped to the ring's circular boundary
```

## Motion design

Animations follow the UI/UX Pro Max motion guidelines: subtle parallax on decorative layers
only (never on body text), scroll reveals that trigger once and don't re-fire, a magnetic pull
effect reserved for just the two hero CTAs (not overused across the page), and everything wrapped
in a `prefers-reduced-motion` check that falls back to a static, fully visible layout. Content is
visible-by-default for no-JS users/crawlers (see the inline `<style>`/`<noscript>` pair in
`index.html`'s `<head>`) — animation only kicks in once GSAP has actually loaded.

## Deploying to GitHub Pages (as your main username.github.io site)

1. Create a new **public** GitHub repo named exactly `Mahnoorparacha56.github.io`
   (must match your GitHub username exactly, including case).
2. Push these files to the repo's default branch (`main`):
   ```bash
   cd mahnoor-portfolio
   git init
   git add .
   git commit -m "Initial personal website"
   git branch -M main
   git remote add origin https://github.com/Mahnoorparacha56/Mahnoorparacha56.github.io.git
   git push -u origin main
   ```
3. That's it — GitHub automatically serves a `<username>.github.io` repo at
   `https://Mahnoorparacha56.github.io` with no extra configuration. It can take a minute or two
   after the first push to go live.

If you'd rather host it as a project page instead (e.g. `Mahnoorparacha56.github.io/portfolio`),
push to a repo named anything else, then enable Pages in **Settings → Pages → Deploy from a
branch → main → /(root)**.

## Adding certificate images

The Certifications section currently shows placeholder cards (icon + issuer + status). Once you
have certificate images/PDFs:

1. Drop them into `assets/img/certs/`.
2. In `index.html`, inside each `.cert-card`, replace the emoji icon div with an `<img>` tag
   pointing at the certificate image (or wrap the whole card in an `<a>` linking to the
   certificate file/PDF for the full view).

## Updating project GitHub links

Each project card currently links to the main GitHub profile (github.com/Mahnoorparacha56) since
individual repo links weren't provided. Once specific repos exist, update the `href` on each
`.project-link` anchor in `index.html` to point directly at that project's repository.

## Local preview

No build tools needed — just open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
