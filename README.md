# SignMind

SignMind is a visual-first mental wellness app designed for Deaf and Hard-of-Hearing (DHH) users.

Most mental health products are built around audio instructions and hearing-first assumptions. SignMind takes a different approach: clear visual interactions, text-first support, and accessibility choices that respect DHH communication preferences.

## What This App Includes

- Visual therapy modules with no audio dependency
- Private journaling with mood tracking
- Support chat for emotional check-ins and practical coping steps
- Insight views based on recent mood logs
- DHH-focused community and research sections
- Crisis support modal with accessible contact options

## Why SignMind

SignMind is built around everyday realities many DHH users describe:

- communication fatigue
- limited access to culturally-aware support
- hearing-centric design in wellness apps

The goal is not to replace therapy. The goal is to lower friction for daily support and reflection.

## Tech Stack

- Frontend: React + Vite
- Styling/UI: Utility-first classes with reusable UI components
- Local API: Express server at server/index.js
- Edge API option: Cloudflare Worker at server/worker.js
- Local data store: server/db.json
- Cloud data store: Cloudflare KV (worker path)

## Project Structure

- src/components: Feature screens and shared UI
- src/services: Frontend API client
- server/index.js: Local Express backend
- server/worker.js: Cloudflare Worker backend
- docs: Product and UI design docs

## Getting Started

Run these commands from the project root.

1. Install dependencies

```bash
npm install
```

2. Start frontend

```bash
npm run dev
```

3. Start backend (optional but recommended for full features)

```bash
npm run dev:api
```

Default local URLs:

- Frontend: http://localhost:5173
- API: http://localhost:8787

## Environment and Secrets

Set your Groq key before using chat endpoints.

PowerShell example:

```powershell
$env:GROQ_API_KEY="your_key_here"
```

Important:

- Never commit API keys to the repository
- Use Cloudflare secrets or your deployment platform secret manager in production

## Available Scripts

- npm run dev: Start Vite dev server
- npm run dev:api: Start local Express API
- npm run build: Create production frontend build
- npm run preview: Preview production build locally
- npm run lint: Run lint checks
- npm run deploy: Deploy frontend build to Cloudflare Pages

## Deployment Notes

- This repository supports both local server and worker-based deployment paths
- For Cloudflare Worker deployment, configure KV binding and secrets in wrangler config
- Review crisis support links periodically to keep contact details current

## Responsible Use

SignMind provides supportive wellness guidance. It is not a substitute for licensed clinical care.

If a user appears to be in immediate danger, direct them to local emergency or crisis services immediately.
