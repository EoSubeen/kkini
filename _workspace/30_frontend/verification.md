# Frontend verification

- Producer: `frontend`
- Consumer: `architecture-supervisor`, `qa-release`
- Completion: `frontend-foundation-complete`
- Verified at: 2026-11-12 (Asia/Seoul)

## Implemented routes

| Route | State |
| --- | --- |
| `/login`, `/signup` | Korean auth forms, visible labels, password-manager autocomplete, pending state |
| `/home` | Monthly cash-flow hero, next action, quick actions, progress |
| `/diagnosis/current` | Cash flow, health metrics, peer comparison, calculation-basis dialog |
| `/diagnosis/timeline` | Key age summary and event timeline |
| `/diagnosis/family` | Three-generation assets, transfer, protection gap |
| `/recipe` | Plate preview, ingredient tabs/cards, report example, housing interaction, calculation basis |
| `/check` | Interactive checklist, progress gauge, actual-assets fields |
| `/settings` | Account, data and service settings list |

## Reusable UI

- `ProductShell`: sticky header and five-item safe-area bottom navigation.
- `SegmentTabs`: visual diagnosis subnavigation.
- `RecipeBuilder`: six ingredient categories and selected-state preview.
- `CalculationBasisDialog`: modal calculation explanation and educational disclaimer.
- Shared cards, metrics, progress, section headings and page intro components.
- Existing sandwich, ingredient, family and action assets were copied under `public/kkini/**`; original `assets/**` files were not changed.

## Automated checks

| Command | Result |
| --- | --- |
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm run test -- src/components/recipe-builder.test.tsx` | exit 0; 1 file, 2 tests passed |
| `npx next build --webpack` | exit 0; 18 routes generated |

The default Turbopack production build could not complete in the managed environment because its CSS loader attempted a prohibited local port bind. The same app compiled, type-checked and generated successfully with the supported Webpack builder. The supervisor owns the root build-script decision.

## Browser evidence

The local `/recipe` route was checked with a 390 × 844 viewport override.

- `innerWidth`: 390px
- document `scrollWidth`: 375px (no horizontal overflow)
- app viewport width: 375px
- ingredient card widths: 162.5px each in the two-column tray
- bottom navigation remained fixed at viewport bottom (top 772px, bottom 844px)
- report button exposed `김샌드 씨 · 보고서 추천안`, `약 −12만 원`, `약 3.2억 원`
- selecting `집 줄여 이사` unchecked and disabled `본인 주택연금`
- the new-house reverse-mortgage confirmation notice became visible

## Remaining integration risks

- Auth forms currently expose the intended UI states but await supervisor integration with the DB/Auth server actions.
- Product screens use representative Kim Sandwich data until the typed API result is connected.
- Next Image logged non-blocking aspect-ratio/LCP development warnings for several transparent PNG layers; QA should include image optimization in the performance pass.
- Browser tests used placeholder local Supabase environment values; no real user or financial data was transmitted.
