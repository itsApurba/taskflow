# TaskFlow design system

TaskFlow is a gamified Jira. People claim tasks like loot, earn credits when their manager approves the work, spend them in a rewards store, and level up. The UI has to feel like a game HUD and still read like a work tool. This file is the contract for anyone building a new screen: use these tokens, components and layout rules, and the app stays consistent.

## Direction: "quest board"

- **Game HUD, professional body.** The currency, XP and level widgets carry the game feel: a gold coin, a gradient XP bar, a hexagon level badge, loot-tier colours. Everything else is calm: ink-tinted neutrals, generous spacing, readable type.
- **One hero gradient.** Violet to cyan (`gradients.hero`) appears on a few surfaces only: the player card, the auth brand panel and the raised Market tab. Using it everywhere would cheapen it.
- **Colour means something.** Violet (`brand`) is for actions and "in progress"; gold (`coin`) is only ever money; cyan (`xp`) is only ever progress. Status, type and reward-tier colours come from `src/lib/game.js`, never from ad-hoc picks.
- **Phone first.** The captain mostly uses a phone. Design at 360px, then let it breathe on bigger screens.
- **Light and dark are equal.** Every colour is a semantic token with a light and a dark value, so both themes come for free.

## Where things live

| Path | What |
| --- | --- |
| `src/theme.js` | Chakra UI 3 system: tokens, semantic tokens, text/layer styles, keyframes, recipe overrides |
| `src/lib/game.js` | Game vocabulary: reward tiers, task statuses and lanes, task types, level maths, number formatting |
| `src/lib/sprints.js` | Sprint phase (upcoming/active/ended), sorting, date range text |
| `src/lib/leaderboard.js` | Leaderboard periods, medal colours (`RANK_MEDALS`), ordinals, "where you stand" copy |
| `src/components/ui/` | Reusable presentational components (no data fetching except where noted) |
| `src/components/shell/` | App chrome: `AppShell`, `TopBar`, `Sidebar`, `BottomNav`, `AuthLayout`, `UserMenu`, `CreditPill`, `Logo`, and `nav.js` |
| `src/components/` | Feature components: task/sprint cards, lists, forms, pickers, `PlayerCard`, `TaskRow` |
| `src/pages/` | Route screens |
| `src/hooks/` | `useMe` (player profile), `useTasks`, `useSprints`, `useGoBack` (history back with a fallback for deep links), `useAuth`, `useColorMode`, `useLogout`, `useMarket` (market queries and lifecycle mutations), `useTaskFlows` (market actions with their dialogs), `usePayoutCelebration`, `useGameQueries` (leaderboard, rewards, redemptions, penalties) |

## Tokens

### Colour palettes

| Palette | Use for | Notes |
| --- | --- | --- |
| `gray` | Neutrals | Replaced with a violet-tinted "ink" scale, so all Chakra defaults (borders, muted text) match the brand |
| `brand` (violet) | Primary buttons, links, active nav, focus rings, "in progress", Epic tier | Default `colorPalette` for the whole app (set on `html`) |
| `coin` (gold) | Credits, prices, the credit pill, Legendary tier | `coin.solid` takes dark text (`coin.contrast`), not white |
| `xp` (cyan) | XP bars, "upcoming" sprints, "up for grabs" | `xp.solid` takes dark text |
| `orange` | Streaks, "in review" | Chakra built-in |
| `green` / `red` / `blue` / `teal` | Done / errors and bugs / Rare tier and features / stories | Chakra built-ins |

Use palettes through `colorPalette` and the semantic keys every palette has: `solid`, `contrast`, `fg`, `subtle`, `muted`, `emphasized`, `border`, `focusRing`. Example: `<Flex colorPalette='coin' bg='colorPalette.subtle' color='colorPalette.fg'>`.

### Surfaces and text

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `bg` | lavender-white `#F4F3FA` | deep ink `#0B0A17` | Page canvas |
| `bg.panel` | white | `gray.900` | Cards, dialogs, menus, inputs |
| `bg.subtle` / `bg.muted` / `bg.emphasized` | ink 50 / 100 / 200 | ink 950 / 800 / 700 | Rows inside cards, tracks, pressed states |
| `bg.glass` | white 82% | ink 78% | Frosted sticky bars (pair with `backdropFilter`) |
| `fg` / `fg.muted` / `fg.subtle` | ink text / secondary / tertiary | | Body, secondary, metadata |
| `border` / `border.emphasized` | | | Card borders / input borders |

Never hard-code hex values or use `useColorModeValue` in a screen; pick a semantic token and both themes work.

### Gradients

`bgGradient='hero'` (violet to cyan), `bgGradient='coin'`, `bgGradient='xp'` (cyan to violet, the XP bar fill).

### Typography

- **Headings:** Bricolage Grotesque (`fonts.heading`), weight 700-800, slight negative tracking. Page titles are `2xl` on phones, `3xl` from `md`.
- **Body/UI:** Figtree (`fonts.body`), 16px base. Inputs are 16px below `md` so iOS does not zoom.
- **`textStyle='eyebrow'`:** small uppercase label above titles ("NEXT UP", "COMING SOON").
- **`textStyle='hud'`:** game numbers (credits, XP, counts): heading font, bold, tabular figures.
- Fonts load from Google Fonts in `index.html` with a system fallback.

### Radii

`l1` 6px (menu items, small chips), `l2` 12px (buttons, inputs, inner rows), `l3` 20px (cards, dialogs, panels), `full` (badges, pills, avatars).

### Shadows

| Token | Use |
| --- | --- |
| `card` | Resting cards and panels |
| `card-hover` | Hovered/raised cards |
| `glow` | Brand-gradient surfaces (player card, raised Market tab) |
| `glow-coin` | Gold highlights, if a coin element needs to pop |
| `bar` | The phone tab bar's upward shadow |

Solid buttons get a soft shadow tinted with their own palette automatically.

### Motion

- `animation='fade-up'`: entrance for cards and page headers (8px rise, 0.42s).
- `animation='pop'`: entrance for icons in empty states and placeholders.
- `animation='float'`: decorative idle bob (auth panel only).
- `coin-burst` keyframes: the coins flying out of `Celebration`. Each coin sets `--tx`, `--ty` and `--spin`.
- Hover lift: `transform: translateY(-2px)` plus `boxShadow: card-hover`. Buttons scale to 0.97 when pressed.
- Entrance animations use `backwards` fill, so hover transforms still work afterwards.
- `prefers-reduced-motion` turns animations and transitions off globally (in `theme.js`).

### Layer style

`layerStyle='panel'` = `bg.panel` + `border` + `l3` radius + `card` shadow. Use it for card-like surfaces that cannot be a `Card` (links, grid cells). `Card.Root` (default `outline` variant) looks the same.

## Game vocabulary (`src/lib/game.js`)

**Reward tiers**: colour a task by its credit reward, like loot rarity.

| Tier | Credits | Palette | Icon |
| --- | --- | --- | --- |
| Common | 0-49 | `gray` | star |
| Rare | 50-99 | `blue` | sparkles |
| Epic | 100-199 | `brand` | gem |
| Legendary | 200+ | `coin` | crown |

Use `getRewardTier(reward)` or just `<RewardTierBadge reward={n} />`.

**Task statuses** (`getTaskStatus(status)` returns `label`, `palette`, `icon`, `lane`):

| Status | Label | Palette | Lane |
| --- | --- | --- | --- |
| `not started` | To do | gray | todo |
| `open` (market) | Open | blue | todo |
| `in progress` | In progress | brand | active |
| `in review` (market) | In review | orange | review |
| `completed` | Completed | green | done |
| `done` (market) | Done | green | done |
| `closed` | Closed | gray | done |

Lanes (`TASK_LANES`) group statuses into the "what next" buckets used by the dashboard and the board filter. A legacy `completed` task sits in the done lane: the board has no approval step, so only market `in review` tasks wait for review. `BOARD_STATUSES` are the ones people may pick on the legacy board; market tasks (`isMarketTask`: they have `createdBy` or a market status) move through claim/submit/approve instead, so their cards hide the status and type pickers and the Edit/Delete actions, and `taskPath` opens them on their market page (`/market/:id`) instead of the legacy edit form.

**Task types**: `bug` (red), `feature` (blue), `story` (teal), with icons.

**Levels**: `xpForLevel(n) = 100 * (n - 1)^2`, `levelProgress({ xp, level, nextLevelXp })` gives 0-1, matching the backend. `formatNumber` formats credits and XP.

## Components (`src/components/ui/`)

| Component | Purpose | Key props |
| --- | --- | --- |
| `PageHeader` | Top of every screen | `eyebrow`, `title`, `description`, `actions`, `actionsProps`, `back` (shows a back button; a path is where it goes when the page was opened directly, `true` means home) |
| `SectionHeader` | Heading of a block inside a page | `title`, `count`, `to` + `linkLabel` ("See all") |
| `StatTile` | One number with a label; a link when `to` is set | `label`, `value`, `icon`, `palette`, `hint`, `to` |
| `EmptyState` | Empty lists and "nothing here" moments | `icon`, `title`, `description`, `palette`, `size` (`sm`/`md`), children = actions |
| `ConfirmDialog` | Yes/no for destructive actions; bottom sheet on phones, focus on Cancel | `open`, `onClose`, `onConfirm`, `title`, `description`, `confirmLabel`, `palette`, `icon`, `loading` |
| `FilterChips` | Single-select pill row; scrolls sideways inside itself | `options` (`value`, `label`, `count`), `value`, `onChange`, `label` |
| `CoinIcon` | The credit coin (SVG) | Chakra `Icon` props (`boxSize`) |
| `CreditAmount` | Coin + tabular amount | `value`, `size` (`sm`-`xl`), `signed` (ledger +/-, negatives turn red), `label`, `color` |
| `LevelBadge` | Hexagon with the level; a lock when `level` is null | `level`, `size` (`sm`-`xl`) |
| `XpBar` | XP towards the next level | `xp`, `level`, `nextLevelXp`, `size`, `showLabels`, `inverted` (on gradients) |
| `StreakBadge` | Flame + days in a row | `days`, `compact` |
| `RewardTierBadge` | Coin amount + tier name in tier colours | `reward`, `showAmount`, `showTier`, `size` |
| `RankBadge` | Leaderboard place; gold, silver and bronze for the top three | `rank`, `size` (`sm`-`lg`) |
| `StatusBadge` / `TaskTypeBadge` | Task status / type chips | `status` / `type` |
| `UserAvatar` | Initials avatar, stable colour per name | `name`, `size` |
| `PasswordInput` | Password with show/hide; works as a Formik `Field as` | input props |
| `toaster` | `toaster.create({ title, description, type, action })` | Panel-coloured toasts with a coloured edge; they sit above the phone tab bar. `action: { label, onClick }` adds a button ("Open", "View") |
| `SegmentedControl` | Pill switch between 2-4 views of one screen (Market / My tasks), styled like `BoardTabs`; full width on phones | `options` (`value`, `label`, `count`, `palette` for the count bubble), `value`, `onChange`, `label` |
| `NoteDialog` | Asks for a short note before an action (submit work, send it back); bottom sheet on phones | `open`, `onClose`, `onConfirm(note)`, `title`, `description`, `label`, `placeholder`, `required`, `confirmLabel`, `palette`, `icon`, `loading` |
| `Celebration` | The payout moment: a coin burst, the signed amount and one line. Only for money moments (payouts, redemptions); everything else gets a toast | `open`, `onClose`, `eyebrow`, `amount`, `title`, `description`, `actionLabel`, children = extra actions |

Feature-level building blocks in `src/components/`:

- `PlayerCard`: the HUD card (level, XP, credits, streak) from `useMe`, with a locked state.
- `TaskRow`: compact, tappable task line for dashboards, sprint details and future lists.
- `TeamMemberRow`: one report from `GET /users/team` (level, XP bar, balance, task counts, streak, active penalties).
- `home/`: `WorkerHome` and `ManagerHome` (Home picks one by `profile.role`) and `HomePanels` (`Lane`, `SprintsPanel`, `MiniLeaderboard`).
- `TaskCard` / `TaskList`, `SprintCard` / `SprintList`, `BoardTabs`.
- `shell/CreditPill`: the always-visible balance in the top bar, linking to `/wallet`.
- `MarketTaskCard`: a market listing shown like a shop item: a price tag in the reward's tier colour, title, type, poster and an `action` (Claim). `preview` renders it without links for the post form.
- `QuestCard`: a claimed task with its status, reward, assignee (`showPerson`), latest note and next actions as children. Used by My tasks, the review queue and the manager's team view. `NoteQuote` (same file) shows a worker's or manager's note.
- `TaskLifecycle`: the four-step tracker (Posted, Claimed, In review, Paid) with dates; a sent-back task shows "Fixing" in orange.

## Data and the game backend

- `useMe()` fetches `GET /me` and returns `{ profile, isLoadError, isFirstLoad, refetch, isFetching, ... }`. On a backend without the gamification API the request 404s and `profile` is `null`. Every game widget must handle `profile === null` by showing a locked or neutral state (the credit pill reads "Wallet", `LevelBadge` shows a lock, `PlayerCard` explains what is coming). Never invent numbers.
- Any other `/me` failure (network, timeout, 5xx; transient ones are retried twice) sets `isLoadError`, which stays true through refetches until `/me` answers. Then the game is not "coming soon" and the role is unknown: show a "Couldn't load…" state with a Try again button that calls `refetch` (`loading={isFetching}`), and never fall back to worker UI or locked copy.
- Gate a whole page on `useMe().isFirstLoad`, not `isLoading`: it is true only before `/me` has ever answered, so an error or a refetch never swaps the page for a skeleton. `/me` does not retry on mount.
- A 401 on a signed-in request ends the session (`src/api/session.js`): the API client clears the token and cache, `PrivateRoute` sends you to `/login`, and a toast says why. `/auth/*` 401s (wrong password) stay with the form.
- `useTasks()` (`["tasks"]`) and `useSprints()` (`["sprints"]`) share caches with the forms, which refetch them after saving. Invalidate `["me"]` after anything that changes credits or XP.
- `useGameQueries` keeps raw API responses under `["leaderboard", period]`, `["rewards"]`, `["redemptions"]` and `["penalties"]`. A screen that changes that data invalidates the matching key (`invalidateMarket` already covers `["leaderboard"]`), so Home, Profile and the leaderboard stay current. Home and Profile read tasks and the team through `useMarket`'s hooks, not copies of them.
- An assignee can be an id or a populated user; use `assigneeId(task)`.
- Market data lives in `src/hooks/useMarket.js`: `useMarket()` (`["market"]`), `useMyTasks()` (`["tasks", "mine"]`), `useReviewQueue()` (`["tasks", "review"]`), `useTeam()` and `useMarketTask(id)` (`["tasks", id]`, seeded from the list caches). `useTaskAction(action)` runs claim/submit/approve/reject/create/update/delete and then `invalidateMarket`, which refreshes the market, every `["tasks", ...]` query, `["me"]`, `["wallet"]`, `["leaderboard"]` and the team. Use the same keys on other screens so a payout shows up everywhere.
- `useTaskFlows()` wraps those actions with their confirm/note dialogs, toasts and the approval `Celebration`; render its `dialogs` once per page.

## Layout

### Shell

- **Phones (< 768px):** sticky frosted top bar (logo, credit pill, avatar menu) and a fixed bottom tab bar: Home, Board, **Market** (raised gradient button), Store, Ranks. The wallet is reached from the credit pill; profile, theme and log out from the avatar menu (theme and log out are also on the Profile page).
- **Tablet (768-1023px):** an icon rail (96px) with small labels instead of the tab bar.
- **Desktop (1024px+):** a 256px sidebar with "Work" and "Play" groups, a "Soon" tag on unbuilt screens and a "New task" button (hidden from workers, like every "New task" action).
- When the profile is available the top bar also shows level and XP (from 768px) and the streak (from 480px).
- Content is capped at `6xl` (1152px) with gutters of 16px (phones), 24px (`md`) and 32px (`lg`). The phone layout reserves space for the tab bar and the safe-area inset at the bottom.
- `src/components/shell/nav.js` is the single list of destinations. `paths` decides which item is active; `soon: true` shows the "Soon" tag.

### Page anatomy

1. `PageHeader` (eyebrow, title, one-line description, primary action). On phones the action goes full width under the title.
2. Optional sub-navigation (`BoardTabs`) and filters (search + select on one row, then `FilterChips`).
3. Content: cards in a `SimpleGrid` (`1` column on phones, `2`-`3` from `md`/`xl`), or panels with `TaskRow` lists.
4. Empty states use `EmptyState` inside a `layerStyle='panel'` box with the next action as a button.

### Responsive rules

- No horizontal page scroll at 360px. Grid and flex children that hold text get `minW={0}` and tracks use `minmax(0, 1fr)`; long titles use `overflowWrap='anywhere'` or `lineClamp`.
- Tap targets are at least 44px on phones: `md` buttons, inputs and selects are 44px below `md` automatically; give icon buttons `minW={{ base: 11, md: 9 }}`.
- Horizontal overflow is allowed only inside a self-contained scroller (`FilterChips`).
- A component that sits in grids of different widths should lay out by its own width, not the viewport: give its root `css={{ containerType: "inline-size" }}` and use `@container (min-width: …)` rules (see the `TaskCard` footer, which stacks in narrow cards on phones and in the two-column desktop board).
- Dialogs: bottom sheet on phones, centred from `sm`. Menus: `Menu.Root` with `positioning={{ placement: "bottom-end" }}`.
- Whole-card links use the stretched-link pattern (`TaskCard`, `SprintCard`): the title is the link and its `::after` covers the card; controls inside get `position: relative; zIndex: 1`.

### Forms

- One panel (`layerStyle='panel'`) capped at `2xl`, fields stacked with `gap={5}`; pairs (dates, status + assignee) sit side by side from `md` (dates always).
- Labels above fields, helper text below, Formik + Yup validation, `ErrorText` under the field.
- Choice of 2-4 options with icons: `RadioCard` (task type). Longer lists: `NativeSelect`, which uses the phone's native picker.
- Actions at the end: primary on the right, Cancel as `outline` + `gray`; on phones they stack with the primary on top.

## Adding a screen (wallet, store)

1. Build the page in `src/pages/` and swap it in for the `ComingSoonPage` route in `src/routes/AllRoutes.jsx`.
2. Remove `soon: true` from its entry in `src/components/shell/nav.js`. Delete its entry from `FEATURES` in `ComingSoonPage.jsx`.
3. Start with `PageHeader`; use `CreditAmount`, `RewardTierBadge`, `XpBar`, `StreakBadge`, `UserAvatar`, `EmptyState` and `ConfirmDialog` rather than new one-offs. If you need a new reusable piece, add it to `src/components/ui/` and to this file.
4. Gate role-specific UI on `profile.role` (`manager` / `worker`) from `useMe`; while `isLoadError` is set, show the retry state instead of picking a role.
5. Check it at 360x740, 390x844, 768x1024 and 1440x900, in light and dark.

## Copy

Short, warm and plain: "Next up", "Up for grabs", "You're all caught up". Use game words (claim, earn, level up, streak) where they explain the mechanic, not as decoration. Sentence case everywhere; numbers through `formatNumber`; credits always shown with the coin.
