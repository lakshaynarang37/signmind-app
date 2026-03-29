# SignMind

SignMind is a visual-first mental wellness app built for Deaf and Hard-of-Hearing (DHH) users.

The app focuses on everyday support:

- a private journal for mood and reflection
- visual therapy modules (no audio required)
- a supportive chat companion
- mood trends and weekly insights
- community and research resources

The goal is simple: make mental wellness tools easier to use when most apps assume hearing-first experiences.

## Tech Stack

- Frontend: React + Vite
- UI: Tailwind-style utility classes + custom components
- Local backend: Express (`server/index.js`)
- Edge backend option: Cloudflare Worker (`server/worker.js`)
- Data: JSON file for local dev, KV for worker mode

## Local Setup

1. Install dependencies:

```bash
npm install
cd signmind-app-main
npm install
```

2. Run the frontend:

```bash
cd signmind-app-main
npm run dev
```

3. Run the local API (optional, if you need backend features locally):

```bash
cd signmind-app-main
npm run dev:api
```

Frontend usually runs on `http://localhost:5173` and API on `http://localhost:8787`.

## Environment Variables

Do not commit secrets.

Set `GROQ_API_KEY` in your local environment (or Cloudflare secrets) before using chat features.

Example (PowerShell):

```powershell
$env:GROQ_API_KEY="your_key_here"
```

## Scripts

From `signmind-app-main/`:

- `npm run dev` - start frontend
- `npm run build` - production build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint
- `npm run dev:api` - start Express API server

## Notes

- This project includes both local-server and worker-based backend paths.
- Crisis/support content should be reviewed regularly to keep numbers and links accurate.
- If you deploy publicly, keep all API keys in secret managers only.
