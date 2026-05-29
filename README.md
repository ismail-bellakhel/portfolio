# Portfolio — Ismail Bellakhel

Personal portfolio site built with React + Vite, Tailwind CSS, shadcn/ui, and Framer Motion.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # outputs to apps/web/dist/
```

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In `apps/web/vite.config.js`, set the `base` option to your repo name if deploying to a subpath:
   ```js
   base: '/your-repo-name/',
   ```
3. Install the deploy helper:
   ```bash
   npm install --save-dev gh-pages
   ```
4. Add to `apps/web/package.json` scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
5. Run from the `apps/web/` directory:
   ```bash
   npm run deploy
   ```
6. In your GitHub repo → Settings → Pages, set the source branch to `gh-pages`.

## Deploying to Vercel / Netlify

- **Vercel**: Import the repo, set root directory to `apps/web`, build command `npm run build`, output dir `dist`.
- **Netlify**: Same settings. Add a `netlify.toml` with `publish = "apps/web/dist"` and `command = "npm run build --prefix apps/web"` if needed.

---

## Liquid Glass UI — Future Implementation Notes

See [LIQUID_GLASS_NOTES.md](./LIQUID_GLASS_NOTES.md) for the planned iOS 26 / Apple Liquid Glass direction.
