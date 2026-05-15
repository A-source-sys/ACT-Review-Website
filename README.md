# ACT Prep

A Next.js study site that serves questions from your scraped ACT database.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Plugging in your scraped questions

1. Run `act_scraper.py` to generate `act_questions.json`
2. Copy it into `data/questions/`
3. Restart the dev server

That's it. The app reads every `.json` in that folder on startup.
See [`data/questions/README.md`](data/questions/README.md) for the full format spec.

---

## Project structure

```
act-prep/
├── data/
│   └── questions/           ← DROP YOUR JSON FILES HERE
│       ├── README.md
│       └── sample_questions.json
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx         ← main quiz page
│   │   ├── page.module.css
│   │   ├── globals.css
│   │   └── api/
│   │       └── questions/
│   │           └── route.ts ← API: GET /api/questions?section=ENGLISH
│   │
│   ├── components/
│   │   ├── QuestionCard.tsx
│   │   └── QuestionCard.module.css
│   │
│   ├── lib/
│   │   ├── questions.ts     ← reads + caches questions from data/
│   │   └── useScore.ts      ← score hook (persists to localStorage)
│   │
│   └── types/
│       └── index.ts         ← shared TypeScript types
│
├── package.json
└── next.config.js
```

---

## API

### `GET /api/questions`

| Param | Type | Description |
|---|---|---|
| `section` | string | `ENGLISH`, `MATHEMATICS`, `READING`, or `SCIENCE` |
| `limit` | number | Max questions to return (default 10, max 50) |
| `exclude` | string | Comma-separated question numbers to skip |
| `counts` | `1` | If set, returns question counts per section instead |

**Example:**
```
/api/questions?section=MATHEMATICS&limit=10&exclude=1,2,3
```

---

## Score

Scores are stored in `localStorage` under the key `act_prep_stats` and persist across browser sessions.
Hit "Reset score" in the UI to clear them.

---

## Deployment

```bash
npm run build
npm start
```

Or deploy to Vercel with one command:
```bash
npx vercel
```

> **Note:** On Vercel, the `data/questions/` folder is bundled at build time.
> To add new questions after deploying, rebuild and redeploy.
