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
npm run check          # everything below, as run by the pre-commit hook and the deploy
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
GitHub Pages on every push to `main` (direct commits and merges). It can also be
re-run from the Actions tab, but both jobs are guarded to run only on `main`. A failing
check blocks the deployment. Day-to-day work happens on `develop`.

This is the only workflow. Nothing runs on GitHub for `develop` or for pull requests; the
pre-commit hook is what checks work on `develop`.

One-time setup in the GitHub repository: **Settings → Pages → Source: GitHub Actions**.

### URLs and deep links

Pages have plain URLs such as `/features` (React Router's `BrowserRouter`, no `#`). GitHub
Pages only serves files that exist, so two things make direct links work:

- The build copies `index.html` to `404.html`. Pages serves it for any address without a
  file behind it, the app starts, and the router shows the page for that address (or its own
  "Page not found" screen).
- Assets are loaded from absolute URLs, which a deep link needs. The deploy workflow gets
  the site's path from `actions/configure-pages` and passes it to the build as `BASE_PATH`
  (`/<repository>` for a project site, empty on a custom domain; see `build/base.ts`).
  Locally it defaults to `/`.

`public/.nojekyll` stops Pages from running Jekyll over the build.
