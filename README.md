# Laxmi Techno website

Static marketing site for Laxmi Techno (https://laxmitechno.in), an AI and software development studio. Plain HTML, CSS and a little JavaScript. No build step.

## Structure

```
index.html, services.html, about.html, contact.html   pages
css/base.css        shared design system (tokens, header, footer, buttons)
css/home.css, services.css, pages.css   per-page styles
js/kolam.js         animated kolam line drawing
js/contact.js       contact form behaviour
assets/             favicon.svg, og.svg, shell snippet
404.html            not-found page
CNAME               custom domain (laxmitechno.in)
.nojekyll           tells GitHub Pages to skip Jekyll
robots.txt, sitemap.xml
.github/workflows/pages.yml   deployment
```

Paths are root-relative (`/css/base.css`), so the site must be served from the domain root.

## Edit and preview locally

Edit the files directly, then serve the folder:

```
python3 -m http.server 8000
```

Open http://localhost:8000. Do not open files with `file://`, since root-relative paths will not resolve.

## Deployment

Pushing to `main` runs `.github/workflows/pages.yml`, which uploads the repo root as a Pages artifact and deploys it. You can also run it manually from the Actions tab (workflow_dispatch).

## GitHub setup

1. Repo Settings > Pages > Build and deployment > Source: **GitHub Actions**.
2. Settings > Pages > Custom domain: `laxmitechno.in`, then Save.
3. After the DNS check passes and the certificate is issued, tick **Enforce HTTPS**.

## GoDaddy DNS checklist

In GoDaddy > My Products > laxmitechno.in > DNS:

- [ ] Delete GoDaddy's default/parking records (the parked `A` record for `@`, any `WebsiteBuilder`/forwarding records, and the default `www` CNAME to `@` or a parking host).
- [ ] Add 4 `A` records, Name `@`:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
- [ ] Add `CNAME` record, Name `www`, Value `shubhmali19.github.io`.
- [ ] Leave the MX/TXT/CNAME records that belong to GoDaddy Email & Office untouched.
- [ ] Turn off any domain forwarding and GoDaddy parking/website products on the domain.

DNS changes can take from a few minutes up to 24-48 hours to propagate. GitHub will not issue the HTTPS certificate until DNS resolves correctly, so "Enforce HTTPS" may be greyed out for a while. Check with `dig laxmitechno.in +short`.

## Email

The site lists `hello@laxmitechno.in`. That mailbox must exist in GoDaddy Email & Office (or be set up as an alias/forward), otherwise mail sent from the contact links will bounce.
