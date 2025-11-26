ChatRank Modern Frontend (Vite + React + Tailwind + Framer Motion)
==================================================================

Dev setup
---------
- Node 18+
- Install: `npm install`
- Run dev: `npm run dev` (opens on http://localhost:5173)

Env
---
- Create `.env` and set:
  - `VITE_API_URL=http://localhost:3000`
  - `VITE_USE_MOCKS=false` (set to `true` to use mock data when backend is unavailable)

Endpoints contract
------------------
- POST `/api/chatbot` body `{ query }` -> `{ answer: string }`
- POST `/api/search` body `{ query, num_results, ranking }` -> `{ results: [...], did_you_mean?: string, ai_answer?: string }`

Project structure
-----------------
- `src/pages/HomePage.tsx` landing-first page
- `src/pages/ResultsPage.tsx` optional results route `/?q=...`
- `src/pages/ChatPage.tsx` dedicated chat page at `/chat`
- `src/components/ChatModal/*` accessible chat modal and UI
- `src/components/Results/*` results panel and cards
- `src/lib/api.ts` axios instance using `VITE_API_URL`
- `src/lib/hooks/*` chat and search hooks
- `src/styles/tailwind.css` global styles

Features
--------
- Default dark theme, glass panels, brand gradient accents
- Hero with CTA that navigates to `/chat`
- Animated entries (Framer Motion)
- Quick search under hero with animated results
- Ranking metric toggle with smooth reorder
- Dedicated Chat page with typing indicator, retry, and sources pill

Build & deploy
--------------
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy: serve `dist/` with any static host. Ensure `VITE_API_URL` points to your backend.


