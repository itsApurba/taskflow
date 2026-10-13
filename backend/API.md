# TaskFlow API

Gamified TaskFlow: managers post tasks with a credit reward to a market, workers
claim and finish them, and managers approve the work to pay out credits and XP.
Workers spend credits in their manager's rewards store or to clear penalties.

All routes live under `/api`. Every route needs `Authorization: Bearer <accessToken>`
except `/auth/*` and `GET /users/managers`.

## Conventions

- Bodies and responses are JSON. Ids are MongoDB ObjectId strings in `_id`.
- Errors are always `{ "message": "..." }` with a status code:

  | Status | Meaning |
  | --- | --- |
  | 400 | Invalid input: validation failure, malformed id, bad query value |
  | 401 | Missing, invalid or expired token; wrong login |
  | 403 | Wrong role (`Only managers can do this` / `Only workers can do this`) or not your resource |
  | 404 | Resource not found (or not in your team) |
  | 409 | Not allowed in the current state: task not open/in review, already approved/cleared/fulfilled, `Insufficient credits`, `This reward is out of stock`, duplicate email |

- User objects never contain `password`.

## Roles and teams

- `role` is `manager` or `worker` (default `worker`).
- A worker's `reportsTo` is their manager. A manager's **team** is every user whose
  `reportsTo` is that manager.
- Workers see the market, store and leaderboard of the manager they report to. A
  worker without a manager sees empty lists.

## Gamification rules

- **Credits** are paid only when the posting manager approves a task: the
  assignee earns exactly the task's `reward`, once.
- **XP** gained = task reward. XP never goes down (spending credits does not cost XP).
- **Level** = `floor(sqrt(xp / 100)) + 1`, so level *n* needs `100 * (n - 1)^2` XP:
  level 2 at 100 XP, level 3 at 400, level 4 at 900. `nextLevelXp` in profiles is the
  XP needed for the next level.
- **Streak** = consecutive calendar days (UTC) with at least one approved task.
  Another approval the same day keeps it, one the next day extends it, a gap resets it
  to 1. A streak whose last approval is older than yesterday is reported as `0`.
- **Balances never go negative.** Every debit is one conditional atomic update
  (`credits >= cost`). The ledger has one entry per task, redemption and penalty
  (unique `kind` + `ref`), so nothing is paid or charged twice.

## Data model

| Model | Fields |
| --- | --- |
| User | `name`, `email`, `role`, `reportsTo`, `credits` (cached balance), `xp`, `level`, `streak`, `lastApprovedAt`, `created_at` |
| Task | `title` (1-50 chars), `type` (`bug`/`feature`/`story`), `description`, `reward` (integer >= 0), `createdBy`, `assignee`, `status`, `submissionNote`, `reviewNote`, `claimedAt`, `submittedAt`, `approvedAt`, `created_at`, `updated_at` |
| CreditTransaction | `user`, `amount` (signed integer), `kind` (`task_reward`/`reward_redeem`/`penalty_clear`), `ref` (Task/Redemption/Penalty id), `note`, `createdAt` |
| Penalty | `worker`, `issuedBy`, `reason`, `cost`, `status` (`active`/`cleared`), `clearedAt`, `createdAt`, `updatedAt` |
| Reward | `title`, `description`, `cost`, `stock` (`null` = unlimited), `createdBy`, `active`, `createdAt`, `updatedAt` |
| Redemption | `worker`, `reward`, `rewardTitle` (snapshot), `manager`, `cost`, `status` (`pending`/`fulfilled`), `fulfilledAt`, `createdAt`, `updatedAt` |

### Task lifecycle

```
open --claim--> in progress --submit--> in review --approve--> done (credits + XP paid)
                     ^                       |
                     +----reject (note)------+
```

Market tasks are the ones with a `createdBy`. Their status and assignee change only
through the lifecycle endpoints; only the posting manager may edit or delete them, and
`reward` can only change while the task is `open`. Older tasks without `createdBy` keep
the legacy statuses (`not started`, `in progress`, `completed`, `closed`) and the
legacy board/sprint endpoints; they never appear in the market.

## Auth

### `POST /auth/register`
Body: `{ name, email, password, role?, reportsTo? }`. `role` defaults to `worker`;
a worker's `reportsTo` must be a manager id (optional). Managers report to no one.
Credits/XP and other stats cannot be set. `201`:

```json
{
  "token": { "tokenType": "Bearer", "accessToken": "...", "refreshToken": "...", "expiresIn": "..." },
  "user": { "_id": "...", "name": "...", "email": "...", "role": "worker", "reportsTo": "...", "credits": 0, "xp": 0, "level": 1, "streak": 0 }
}
```

### `POST /auth/login`
Body: `{ email, password }`. `200` with the same shape as register. Wrong credentials: `401`.

### `POST /auth/refresh`
Body: `{ email, refreshToken }`. `200` with a new token object.

## Users

### `GET /users/managers` (public)
Managers for the signup picker: `[{ "_id": "...", "name": "Rohit Sharma" }]`.

### `GET /me`
```json
{
  "_id": "...", "name": "Asha Verma", "email": "asha@taskflow.demo",
  "role": "worker", "reportsTo": "...",
  "credits": 60, "xp": 360, "level": 2, "nextLevelXp": 400,
  "streak": 2, "lastApprovedAt": "...", "created_at": "...",
  "manager": { "_id": "...", "name": "Rohit Sharma", "email": "rohit@taskflow.demo" }
}
```
`manager` is `null` for managers and unassigned workers.

### `GET /users/team` (manager)
The manager's reports: each is the `/me` profile (without `manager`) plus
`tasksDone`, `tasksInProgress`, `tasksInReview` (tasks from this manager) and
`activePenalties`.

The older `GET /users`, `GET /users/search?name=`, `GET /users/:id`, `POST /users`,
`PUT /users/:id` and `DELETE /users/:id` remain; `PUT`/`DELETE` only work on your own
account (`403` otherwise).

## Market and tasks

### `GET /market`
Open tasks of your team's manager (a manager sees their own open tasks), newest
first, with `createdBy` populated (`name`, `email`, `role`).

### `POST /tasks` (manager)
Body: `{ title, type?, description?, reward }`. Creates an `open` market task owned by
you. `201` with the task.

### `POST /tasks/:id/claim` (worker)
Takes an `open` task from your manager's market: `status` -> `in progress`,
`assignee` -> you. `403` if the task is from another manager; `409` if it is no longer
open (only one concurrent claim wins).

### `POST /tasks/:id/submit` (worker, assignee)
Body: `{ note? }`. `in progress` -> `in review`. `409` from any other status.

### `POST /tasks/:id/approve` (manager, task creator)
`in review` -> `done`, sets `approvedAt`, pays the reward to the assignee
(credits, XP, level, streak) and writes a `task_reward` ledger entry. A second
approve gets `409 Task is not awaiting review` and pays nothing.

### `POST /tasks/:id/reject` (manager, task creator)
Body: `{ note }` (required, `400` without it). `in review` -> `in progress` with
`reviewNote` set. The note is cleared on approval.

### `GET /tasks/mine`
Workers: tasks assigned to you. Managers: tasks you posted. Any status, most recently
updated first, `assignee` and `createdBy` populated.

### `GET /tasks/review` (manager)
Your tasks in `in review`, oldest submission first, `assignee` populated.

### Board and sprint endpoints
`GET /tasks`, `GET /tasks/search?name=`, `GET /tasks/:id`, `GET /tasks/user/:id`,
`PATCH /tasks/:id`, `POST /tasks/status/:id`, `POST /tasks/type/:id`,
`POST /tasks/assignee/:userId/:taskId`, `DELETE /tasks/:id` and all `/sprints`
routes keep working (with a JWT). For market tasks: status/assignee changes there
return `409`, and edit/delete is limited to the posting manager (`403`).

## Wallet

### `GET /wallet`
```json
{
  "balance": 60, "earned": 360, "spent": 300,
  "transactions": [
    { "_id": "...", "user": "...", "amount": -300, "kind": "reward_redeem", "ref": "<redemption id>", "note": "Redeemed: Event ticket: DevFest 2026", "createdAt": "..." },
    { "_id": "...", "user": "...", "amount": 120, "kind": "task_reward", "ref": "<task id>", "note": "Task approved: Dark mode for dashboard", "createdAt": "..." }
  ]
}
```
Newest first.

## Store

### `GET /rewards`
Workers: your manager's active rewards. Managers: every reward you stock (including
inactive). Cheapest first.

### `POST /rewards` (manager)
Body: `{ title, description?, cost, stock?, active? }`. `stock` omitted or `null`
means unlimited. `201` with the reward.

### `PATCH /rewards/:id` (manager, owner)
Any of `title`, `description`, `cost`, `stock`, `active`. `200` with the reward.

### `DELETE /rewards/:id` (manager, owner)
Deletes the item; past redemptions keep `rewardTitle`. `200` with the deleted reward.
(To hide an item but keep it, `PATCH` `{ "active": false }`.)

### `POST /rewards/:id/redeem` (worker)
Buys one unit from your manager's store: takes one unit of stock (if limited) and
`cost` credits, writes a `reward_redeem` ledger entry and creates a `pending`
redemption. `201` with the redemption. `409 Insufficient credits` /
`409 This reward is out of stock` change nothing; `403` for another manager's store;
`404` if missing or inactive.

### `GET /redemptions`
Workers: your redemptions. Managers: redemptions of your rewards. Newest first,
`worker` (`name`, `email`) and `reward` (`title`, `cost`) populated (`reward` is `null`
if deleted; use `rewardTitle`).

### `POST /redemptions/:id/fulfill` (manager, owner)
`pending` -> `fulfilled`, sets `fulfilledAt`. `409` if already fulfilled.

## Penalties

### `POST /penalties` (manager)
Body: `{ worker, reason, cost }`. `worker` must be in your team (`404` otherwise).
`201` with an `active` penalty.

### `GET /penalties`
Workers: your penalties. Managers: penalties you issued. Optional `?status=active|cleared`.
Newest first, `worker` and `issuedBy` populated.

### `POST /penalties/:id/clear` (worker, the penalised worker)
Pays `cost` credits: `active` -> `cleared`, sets `clearedAt`, writes a
`penalty_clear` ledger entry. `409 Insufficient credits` keeps it active;
`409 Penalty is already cleared` charges nothing.

## Leaderboard

### `GET /leaderboard?period=week|all`
Ranks your team (your manager's reports, or a manager's own reports) by credits earned
from approved tasks: `all` (default) is all-time, `week` is the last 7 days.
Ties break by XP, then name. `400` for any other period.

```json
{
  "period": "week",
  "entries": [
    { "rank": 1, "user": { "_id": "...", "name": "Asha Verma" }, "points": 210, "tasksDone": 2, "xp": 360, "level": 2, "streak": 2 }
  ]
}
```
