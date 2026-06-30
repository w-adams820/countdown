# Countdown App

This project is ready as a static site and configured for Vercel deployment.

## Files included
- `index.html` — main page
- `style.css` — layout and styling
- `script.js` — add event + countdown logic
- `vercel.json` — Vercel static site config
- `package.json` — npm scripts for local deployment

## Local setup
1. Install Node.js from https://nodejs.org or via `winget install --id OpenJS.NodeJS.LTS -e`.
2. Open a terminal in this folder:
   ```powershell
   cd c:\Users\7GRROUP\Desktop\countdown
   npm install
   ```

## Deploy to Vercel
1. Install Vercel CLI if needed:
   ```powershell
   npm install -g vercel
   ```
2. Deploy the project:
   ```powershell
   npm run deploy
   ```

## Development
Run locally with:
```powershell
npm run start
```

If you prefer, you can also deploy this folder directly from the Vercel dashboard by connecting your Git repository and using the existing `vercel.json` config.
