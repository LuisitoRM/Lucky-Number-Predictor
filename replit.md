# Neural Expert — Plataforma de Análisis Predictivo de Loterías

## Overview

Web application for statistical analysis and prediction of lottery numbers for Baloto (Colombia), Revancha (Colombia), and Powerball (USA). Built on a pnpm monorepo with Express backend + React/Vite frontend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + Tailwind CSS + Recharts + Framer Motion
- **Build**: esbuild (CJS bundle for server)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080, path /api)
│   └── lottery-app/        # React + Vite frontend (path /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
└── app.py                  # Legacy Python/Flask reference (not deployed here)
```

## Lottery Configuration

| Lottery | Main Numbers | Range | Special Ball | Range | Valid Sum Range |
|---------|-------------|-------|-------------|-------|----------------|
| Baloto | 5 | 1-43 | Super Balota | 1-16 | 82-137 |
| Revancha | 5 | 1-43 | RSB | 1-16 | 82-137 |
| Powerball | 5 | 1-69 | Powerball | 1-26 | 130-221 |

## Database Tables

- `historial_baloto` — Baloto historical draws
- `historial_revancha` — Revancha historical draws
- `historial_powerball` — Powerball historical draws

All tables: `id (serial PK), fecha (text, unique), n1-n5 (integer), especial (integer)`

## CSV Upload Formats

- **Baloto**: Fecha, B1, B2, B3, B4, B5, SB
- **Revancha**: Fecha, R1, R2, R3, R4, R5, RSB
- **Powerball**: Fecha, Bola Blanca 1..5, Powerball

## API Endpoints

- `GET /api/status` — Record counts and date ranges per lottery
- `POST /api/upload/:tipo` — CSV bulk upload (multipart/form-data, field: `file`)
- `GET /api/history/:tipo?page&limit` — Paginated historical results
- `GET /api/frequencies/:tipo` — Frequency analysis (hot/cold numbers, even/odd, sums)
- `POST /api/predict/:tipo` — Monte Carlo prediction (10,000 iterations)

## Prediction Engine

Located in `artifacts/api-server/src/lib/prediction.ts`:
1. Build frequency weights from last 500 draws
2. Weighted random selection (Monte Carlo, 10,000 iterations)
3. Filter combinations by valid sum range
4. Return the most statistically stable combination

## Key Scripts

- `pnpm --filter @workspace/api-server run dev` — Run dev API server
- `pnpm --filter @workspace/lottery-app run dev` — Run frontend
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate types from OpenAPI spec
- `pnpm --filter @workspace/db run push` — Push DB schema changes
