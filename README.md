# Command DNS website

Promotional single-page website for Command DNS, built with React, TypeScript, Vite and three.js.

## Repository

- Web: <https://github.com/snytkine/commanddns-web>
- Git origin: `git@github.com:snytkine/commanddns-web.git`

```sh
git clone git@github.com:snytkine/commanddns-web.git
```

## Develop

```sh
npm install
npm run dev      # local dev server
npm run build    # type-check and build into dist/
npm run preview  # serve the production build
```

## Updating content

| What | Where |
| --- | --- |
| Page text (Markdown) | `src/content/*.md` |
| Home page cards (Markdown) | `src/content/cards/*.md` |
| Navigation items, site name, copyright start year | `src/config/site.ts` |
| Home animation speed, traffic frequency, duration | `src/config/animation.ts` |

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push
to `main` (direct commits and merges). Day-to-day work happens on `develop`.

One-time setup in the GitHub repository: **Settings → Pages → Source: GitHub Actions**.
