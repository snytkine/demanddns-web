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

## Quality checks

```sh
npm run check          # everything below, as run in CI
npm run typecheck      # TypeScript
npm run lint           # ESLint (npm run lint:fix to auto-fix)
npm run format:check   # Prettier (npm run format to rewrite files)
npm run test           # unit tests (npm run test:watch while developing)
npm run test:coverage  # unit tests with the coverage gate
```

A pre-commit hook (Husky, `.husky/pre-commit`) runs `npm run check` and `npm run build`
and rejects the commit if anything fails. It is installed automatically by `npm install`.

Every change must come with unit tests. Coverage must stay at or above 90% for
statements, branches, functions and lines; the build fails below that.
Tests live next to the code as `*.test.ts(x)` and use Vitest with React Testing Library.

## Updating content

| What                                              | Where                     |
| ------------------------------------------------- | ------------------------- |
| Page text (Markdown)                              | `src/content/*.md`        |
| Home page cards (Markdown)                        | `src/content/cards/*.md`  |
| Navigation items, site name, copyright start year | `src/config/site.ts`      |
| Home animation speed, traffic frequency, duration | `src/config/animation.ts` |

## Deployment

`.github/workflows/deploy.yml` runs the quality checks, then builds and deploys to
GitHub Pages on every push to `main` (direct commits and merges). A failing check
blocks the deployment. Day-to-day work happens on `develop`.

`.github/workflows/ci.yml` runs the same checks on pushes to `develop` and on pull
requests. It never deploys.

One-time setup in the GitHub repository: **Settings → Pages → Source: GitHub Actions**.
