# TaskFlow

**A gamified Jira: workers shop for tasks in a market, earn credits when their manager approves the work, and spend them in a rewards store.**

**Live app:** https://taskflow-one.vercel.app · **API:** https://taskflow-api-one.vercel.app/api

## Try it

Log in with any seeded demo account. Every account uses the password **`taskflow123`**.

| Role | Name | Email | Password | What to try |
| --- | --- | --- | --- | --- |
| Manager | Rohit Sharma | `rohit@taskflow.demo` | `taskflow123` | Post a task to the market, then approve Vikram's submission waiting in review ("Fix date picker timezone"). Stock the store, issue a penalty. |
| Worker | Asha Verma | `asha@taskflow.demo` | `taskflow123` | Claim a task from the market and submit it for review. Redeem "Coffee with the team" in the store. |
| Worker | Vikram Singh | `vikram@taskflow.demo` | `taskflow123` | Clear his active penalty ("Missed the sprint demo", 40 credits) from Store → Penalties. |
| Worker | Meera Iyer | `meera@taskflow.demo` | `taskflow123` | Earned the biggest single payout this week; check her wallet history, cleared penalty and pending coffee redemption. |

Anyone can also sign up as a new manager or worker (workers pick the manager they report to). The demo data can be reset with `npm run seed` (see [Getting started](#getting-started)).

| Market (desktop) | Leaderboard (desktop) |
| --- | --- |
| ![Task market](docs/screenshots/market-desktop.png) | ![Leaderboard](docs/screenshots/leaderboard-desktop.png) |

| Store (mobile) | Wallet (mobile) |
| --- | --- |
| <img src="docs/screenshots/store-mobile.png" alt="Rewards store on mobile" width="300"> | <img src="docs/screenshots/wallet-mobile.png" alt="Wallet on mobile" width="300"> |

## How it works

### Roles

- **Manager**: posts tasks with a credit reward, reviews and approves (or rejects with a note) submitted work, stocks the rewards store, fulfils redemptions and issues penalties.
- **Worker**: reports to one manager (`reportsTo`). Sees that manager's market, store and team leaderboard.

A manager's team is everyone whose `reportsTo` is that manager. Only the manager who created a task can approve it.

### The game loop

```
Market ──claim──> In progress ──submit──> In review ──approve──> Done
                       ^                      │                   │
                       └──reject (with note)──┘                   ▼
                                                     credits + XP to the worker
                                                                  │
                                         Store (redeem rewards) ◄─┴─► clear penalties
```

1. The manager posts a task with a reward to the **market**.
2. A worker **claims** it (only one claim wins), works on it, and **submits** it with an optional note.
3. The manager **approves** it, and only then does the worker get paid: credits equal to the task's reward, plus the same amount of XP. Or the manager rejects it with a note and it goes back to in progress.
4. Credits are spent in the manager's **rewards store** (e.g. "Join a special weekend with Rohit sir", "Skip a boring festival", "Event ticket: DevFest 2026") or used to **clear penalties**. The manager marks redemptions as fulfilled.

### Rules

- **XP** = total reward of approved tasks. It never goes down; spending credits does not cost XP.
- **Level** = `floor(sqrt(xp / 100)) + 1`, so level 2 needs 100 XP, level 3 400 XP, level 4 900 XP.
- **Streak** = consecutive days (UTC) with at least one approved task. A gap resets it.
- **Leaderboard** ranks the team by credits earned from approved tasks, this week or all time (ties go to more XP).
- **Balances never go negative**, and every payout, redemption and penalty clear is a single ledger entry, so nothing is paid or charged twice.

The full rules, data model and endpoints are in the API reference: [`backend/API.md`](backend/API.md).

## Features

The UI is fully responsive: a sidebar on desktop, an icon rail on tablet, and a bottom tab bar on phones. Light and dark mode are both supported.

- **Home**: workers see their next task, task counts, level/XP/streak card, progress toward store rewards and this week's ranks. Managers see the review queue, rewards to hand out and their team at a glance.
- **Market**: open tasks with reward and rarity, filter by type and sort; a "My tasks" tab for claimed or posted work. Workers claim and submit; managers post, edit, approve and reject.
- **Wallet**: balance, total earned and spent, and the full credit history.
- **Store**: rewards with cost and stock, a "You can afford" filter, redeemed items, and penalties. Managers add and edit rewards, fulfil redemptions and issue penalties.
- **Leaderboard**: weekly and all-time podium plus standings with level, XP and streak.
- **Profile**: level road, XP progress and recent wins.
- **Board and Sprints**: the original task board and sprint planning are still available.
- **Auth**: sign up as manager or worker, log in, JWT sessions.

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Vite 8, Chakra UI 3, React Router 7, TanStack React Query 5, Zustand 5, Formik 2 + Yup 1, Axios 1, React Icons 5, ESLint 10 |
| Backend | Node.js, Express 5, Mongoose 9, Passport + JWT (`passport-jwt`, `jwt-simple`), bcryptjs 3 |
| Database | MongoDB (MongoDB Atlas in production) |
| Tests | `node:test`, Supertest, `mongodb-memory-server` |
| Hosting | Vercel (two projects: frontend and backend) |

## Getting started

### Prerequisites

- Node.js `^20.19.0 || >=22.12.0` with npm (required by Vite 8)
- MongoDB running locally, or a MongoDB Atlas connection string
- Git

### 1. Clone and install

```bash
git clone https://github.com/itsApurba/taskflow.git
cd taskflow
(cd backend && npm install)
(cd frontend && npm install)
```

### 2. Configure environment variables

Backend: copy the example file and adjust it.

```bash
cp backend/.env.example backend/.env
```

| Variable | Default in `.env.example` | Notes |
| --- | --- | --- |
| `NODE_ENV` | `development` | |
| `PORT` | `3939` | |
| `JWT_SECRET` | `supersecret` | Use a long random value, e.g. `openssl rand -base64 48`. |
| `JWT_EXPIRATION_MINUTES` | `15` | Access token lifetime. |
| `MONGO_URI` | `mongodb://localhost:27017/taskflow` | `MONGODB_URI` also works. |
| `CORS_ORIGIN` | empty | Comma-separated allowed origins. Empty allows all. |

Frontend: create `frontend/.env`:

```bash
echo 'VITE_BACKEND_URL=http://localhost:3939/api' > frontend/.env
```

### 3. Seed the demo data

```bash
cd backend
npm run seed
```

This creates the four demo accounts above with tasks, rewards, redemptions and penalties. It replaces only the `@taskflow.demo` accounts and their data, so run it again any time to reset the demo.

### 4. Run it

In two terminals:

```bash
cd backend && npm run dev     # API on http://localhost:3939/api
cd frontend && npm run dev    # app on http://localhost:5173
```

Open http://localhost:5173 and log in with a demo account.

### 5. Tests and lint

```bash
cd backend && npm test        # starts its own in-memory MongoDB, no .env needed
cd frontend && npm run lint
```

## Deploy to Vercel

The repo deploys as two Vercel projects from the same Git repository. Create each one with **Add New → Project**, import the repo, and set its **Root Directory**.

### Backend project (Root Directory `backend`)

`backend/api/index.js` is the serverless function. `backend/vercel.json` rewrites `/` and `/api/*` to it, so routes stay at `https://<backend>.vercel.app/api/...`. Each instance connects to MongoDB once and reuses the connection. A missing required variable makes requests fail with `500 {"message":"Server is not configured"}` (the function log names the variable); an unreachable database gives `503`.

Set these under **Settings → Environment Variables**, then redeploy:

| Variable | Required | Value |
| --- | --- | --- |
| `MONGODB_URI` or `MONGO_URI` | yes | Atlas connection string including the database name, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/taskflow`. The Vercel MongoDB Atlas integration sets `MONGODB_URI`. If both are set, `MONGO_URI` wins. |
| `JWT_SECRET` | yes | A long random value. Never reuse the example value. Changing it logs everyone out. |
| `JWT_EXPIRATION_MINUTES` | no | Access token lifetime in minutes (default `15`). |
| `CORS_ORIGIN` | no | Comma-separated allowed origins, e.g. `https://taskflow-one.vercel.app`. Unset allows every origin. |

Vercel runs functions with `NODE_ENV=production`, which hides internal error details from responses.

**MongoDB Atlas:** Vercel functions have no fixed outbound IP, so under **Network Access** allow `0.0.0.0/0` (the integration may do this for you).

**Demo data:** seed Atlas once from your machine. A variable set in the shell wins over `backend/.env`:

```bash
cd backend
MONGO_URI='mongodb+srv://user:pass@cluster.mongodb.net/taskflow' npm run seed
```

### Frontend project (Root Directory `frontend`)

Vercel detects Vite and builds `dist`. `frontend/vercel.json` rewrites every non-file path to `index.html`, so deep links such as `/market` work.

| Variable | Required | Value |
| --- | --- | --- |
| `VITE_BACKEND_URL` | yes | The backend URL **including `/api`**, e.g. `https://<backend>.vercel.app/api`. |

`VITE_BACKEND_URL` is compiled into the bundle, so redeploy the frontend after changing it. Then set the backend's `CORS_ORIGIN` to the frontend URL.
