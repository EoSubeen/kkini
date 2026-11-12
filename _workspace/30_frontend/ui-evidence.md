# UI evidence

## Visual direction

- Palette: deep green `#173F32`, action green `#34755B`, soft green `#E7F2EC`, white, warm orange `#E88943`, risk red `#D95B4E`.
- Type: Pretendard-first Korean system stack.
- Layout: 20px mobile gutters, 4/8px spacing rhythm, 20–28px card radii, restrained shadows.
- Signature interaction: ingredients stack on a white plate; the rest of the interface stays quiet and data-led.
- Controls: Lucide outline icons, 44px minimum touch targets, visible focus rings, reduced-motion support.

## Screen checklist

- [x] App header with back action, sandwich mark and `끼니`
- [x] Five-item bottom navigation with selected state
- [x] Home dashboard with generous card padding
- [x] Current diagnosis with metrics and peer comparison
- [x] Future timeline
- [x] Three-generation family safety net
- [x] Recipe ingredient tab bar directly below the assembly tray
- [x] Ingredient selection cards with image, meaning and selected state
- [x] Fixed report recommendation disclosure without mutating selections
- [x] Downsizing disables current-home reverse mortgage and shows confirmation copy
- [x] Calculation-basis modal and education-purpose disclaimer
- [x] Check progress and checklist
- [x] Settings and auth forms

## Interaction regression tests

`src/components/recipe-builder.test.tsx`

1. Opening the fixed report card preserves the chosen bread and exposes both required report figures.
2. Selecting downsizing clears/disables current-home reverse mortgage and displays the required new-home notice.

## QA handoff

Run full E2E after Auth/API integration. At minimum cover signup → profile → diagnosis → recipe → check persistence, logout/login restore, 375px and 390px widths, keyboard focus, dialog close, loading/error states, and cross-user isolation.
