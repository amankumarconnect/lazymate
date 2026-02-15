## 1) How to run the app

1. Install dependencies from repo root.
   - `pnpm install`

2. Create env files.
   - Copy `apps/api/.env.example` to `apps/api/.env`
   - Copy `apps/desktop/.env.example` to `apps/desktop/.env`

3. Set required env values.
   - In `apps/api/.env`: `DATABASE_URL`, `OLLAMA_MODEL_GENERATION`, `OLLAMA_MODEL_EMBEDDING` (other defaults are already in example)
   - In `apps/desktop/.env`: `DATABASE_URL`, `OLLAMA_MODEL_GENERATION`, `OLLAMA_MODEL_EMBEDDING`

4. Make sure PostgreSQL is running.
   - Example with Docker: `docker run --name dockpost -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=Nothing1234 -e POSTGRES_DB=mini_tsenta -p 5432:5432 -d postgres`

5. Run DB migrations (from `apps/api`).
   - `npx prisma migrate dev`

6. Make sure Ollama is running and models are pulled.
   - `ollama pull gemma3:4b`
   - `ollama pull qwen3-embedding:0.6b`

7. Start everything from repo root.
   - `pnpm run dev` _(API + Desktop together, recommended)_
   - Optional: `pnpm run dev:api` and `pnpm run dev:desktop` separately

## 2) All the features (step by step)

1. **Resume setup in desktop app**
   - I can upload a PDF resume.
   - I can replace an existing resume.
   - I can download saved resume later.

2. **Resume processing pipeline**
   - App parses PDF text.
   - AI generates a _target job persona_ from resume.
   - AI creates embedding from that persona.
   - App saves profile data locally in Electron user data.

3. **Automation control**
   - I can start automation.
   - I can pause and continue automation.
   - Stop action closes automation and quits app.

4. **Live split layout while running**
   - Left panel is React control UI.
   - Right panel is live WorkAtAStartup browser view.

5. **User-specific tracking**
   - App reads logged-in user id from WorkAtAStartup localStorage (PostHog key).
   - That id is sent as `X-User-Id` so data is scoped per user.

6. **Company discovery and dedupe**
   - App scans companies list page.
   - It ignores non-company links.
   - It checks API before saving, so same company is not re-added for same user.
   - Company visit is stored with status.

7. **Job discovery per company**
   - App opens each new company.
   - It finds all job links.
   - It handles navigation back to list and keeps scroll position.

8. **Two-stage AI relevance filter**
   - Stage 1: title relevance check with embeddings.
   - Stage 2: full description relevance check.
   - Similarity uses cosine score.
   - Embeddings for job text are cached in DB by `model + textHash`.

9. **Skip handling and reasons**
   - If title/description does not match, app skips job.
   - Skip reason and match score are stored in applications table (`status: skipped`).
   - Duplicate job record is prevented per user + job URL.

10. **Application drafting (testing mode)**
    - If job matches, app opens apply form.
    - AI generates cover letter from job description + original resume text.
    - App types the cover letter into textarea.
    - It saves application to DB with score and status.
    - Real submission is intentionally disabled (_filled, not submitted_).

11. **Already-applied detection**
    - If page shows `Applied`, job is skipped in flow.

12. **Realtime activity log UI**
    - Logs info/success/error/skip/match events.
    - Shows job context and score bars.
    - Shows live matched/skipped counters.
    - Auto-scrolls to newest log.

13. **Application history dashboard**
    - I can open history view.
    - I can switch tabs: _Applied_ and _Skipped_.
    - I can view match score, date, job link.
    - I can expand each row to see cover letter or skipped reason.

14. **Backend API features**
    - Companies API: list, create, search by URL.
    - Applications API: list (latest first), create, search by job URL.
    - AI API: persona generation, embedding generation, relevance analysis, cover letter generation.
    - Proper bad request / unauthorized / not found / conflict handling for key cases.

15. **Data model features**
    - `Company` table with per-user unique URL.
    - `Application` table with per-user unique job URL and match score.
    - `JobTextEmbedding` table for reusable embedding cache.

## 3) Complete tech stack

- **Monorepo**
  - pnpm workspaces

- **Root package**
  - devDependencies: `concurrently`, `prettier`

- **API app (`apps/api`)**
  - framework/runtime: `@adonisjs/core`, `@adonisjs/auth`, `@adonisjs/cors`, `@adonisjs/lucid`, `reflect-metadata`
  - database: `postgresql`, `pg`, `prisma`, `@prisma/client`, `@prisma/adapter-pg`
  - AI: `ollama`
  - validation/date/env: `@vinejs/vine`, `luxon`, `dotenv`
  - devDependencies: `@adonisjs/assembler`, `@adonisjs/eslint-config`, `@adonisjs/prettier-config`, `@adonisjs/tsconfig`, `@japa/api-client`, `@japa/assert`, `@japa/plugin-adonisjs`, `@japa/runner`, `@swc/core`, `@types/luxon`, `@types/node`, `@types/pg`, `eslint`, `hot-hook`, `pino-pretty`, `prettier`, `ts-node-maintained`, `typescript`

- **Desktop app (`apps/desktop`)**
  - desktop/runtime: `electron`, `electron-vite`, `electron-builder`, `@electron-toolkit/preload`, `@electron-toolkit/utils`
  - frontend: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`
  - UI/styling: `tailwindcss`, `@tailwindcss/vite`, `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `lucide-react`
  - state: `@reduxjs/toolkit`, `react-redux`
  - automation + parsing: `playwright-core`, `pdf-parse`, `@types/pdf-parse`
  - AI/env: `ollama`, `dotenv`, `@heyputer/puter.js`
  - devDependencies: `@electron-toolkit/eslint-config-prettier`, `@electron-toolkit/eslint-config-ts`, `@electron-toolkit/tsconfig`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `prettier`, `ts-node`

- **Infra + data + protocols used by the app**
  - database: PostgreSQL
  - local AI server: Ollama
  - browser automation connection: CDP (`remote-debugging-port`)
  - API style: REST JSON over HTTP
