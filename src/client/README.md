# @gh/client — Public site (Nim-inspired)

Personal website on port **3001**, consuming `@gh/backend` APIs.

## Dev

From repo root (after `pnpm install`):

```bash
# Terminal 1 — API
pnpm dev:backend

# Terminal 2 — public site
pnpm dev:client
```

Open http://localhost:3001/fa or http://localhost:3001/en

## Stack

- Next.js 15 App Router + next-intl (fa/en, RTL)
- Framer Motion (Nim-style animations)
- Zinc minimal theme (dark/light via next-themes)
- Data: posts, portfolio, pages, experiences, site settings from API

## Database

After pulling Experience model changes:

```bash
pnpm db:migrate
pnpm db:seed
```
