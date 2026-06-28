# AGENTS.md

Guidance for any AI agent or contributor working on MoCode.

## Coding discipline

Follow [Karpathy behavioral guidelines](.cursor/rules/karpathy-behavioral-guidelines.mdc):
think before coding, minimum diff, verifiable success criteria. Every changed line
must trace directly to the request.

## Build & verify — run before claiming done

Bun monorepo. From the repo root:

- `bun run check` — runs typecheck + lint + test in one shot. **Run this after every change.**
- `bun run test` — `bun test` across `shared`, `server`, `cli`. **Must be 0 failures.**
- `bun run typecheck` — `tsc --noEmit` per package (production sources; `**/*.test.ts` excluded). **Must be 0 errors.**
- `bun run lint` — Biome linter (config: `biome.json`; formatter is intentionally **off**). **Must be 0 errors.**

The blocking gates are `bun run typecheck`, `bun run lint`, and `bun run test`. Do **not** mass-fix or
reformat unrelated code as a drive-by; fix only what your change touches.

## Package boundaries — do not violate

Dependency direction is one-way. Never add an import that points the wrong way.

- `@mocode/shared` — lowest layer. Tool contracts, Zod schemas, model catalog live **here**.
  Must **not** import from `cli`, `server`, or `database`.
- `@mocode/database` — Prisma client. Code under `packages/database/generated/` is
  **auto-generated — never hand-edit**. Change `schema.prisma`, then
  `bun run --cwd packages/database db:generate`.
- `@mocode/server` — depends on `shared` + `database`.
- `@mocode/cli` — depends on `shared` (uses `server` only for types). **Nothing may import from `cli`.**

## Definition of Done

A change is done only when **all** hold:

1. `bun run test` passes (0 failures).
2. `bun run lint` passes (0 errors).
3. `bun run typecheck` passes (0 errors).
4. Every changed line traces directly to the request (no drive-by edits, no reformatting).

## UI standard — read before touching the CLI

**[`DESIGN.md`](./DESIGN.md) is the single source of truth for all terminal UI.**

MoCode is a terminal-native app (OpenTUI + React), not a web app. Before adding
or changing anything under `packages/cli/src/components/`, `screens/`, or
`layouts/`, conform to DESIGN.md:

- Layout is **bottom-anchored**: scrolling transcript above, pinned composer +
  single status line below.
- Measurements are **character cells**, not pixels. No fonts, `px`,
  border-radius, or shadows.
- Color is **theme-driven**: resolve semantic tokens via `useTheme()`
  (`packages/cli/src/theme.ts`). **Never hardcode hex** in a component.
- Mode tint is global: `{color.primary}` (Build) / `{color.planMode}` (Plan) on
  the accent bar (`┃`), `◉`, and spinner.
- Reference DESIGN.md tokens (`{color.*}`, `{glyph.*}`, `{space.*}`, `{size.*}`).
  If you need a value that isn't a token, add it to DESIGN.md first, then use it.
- Follow the dialog shell + Width & Overflow rules (cap then truncate, no phantom
  scrollbars, single `esc` affordance in the header).

If a plan or `/gsd-ui-phase` UI-SPEC contradicts DESIGN.md, DESIGN.md wins —
reconcile to it.
