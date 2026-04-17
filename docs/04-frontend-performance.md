# Frontend Performance Notes

This pass keeps the current visual language, but removes the most expensive unnecessary work.

## Keep

- `LiquidGlass` as the shared surface primitive.
- `SmoothScrollContainer` as the full-page section controller.
- `ExpandableWidget` interaction pattern for detail views.

## Refactor

- `useContainedScroll`
  - Use native nested scrolling with `overscroll-behavior: contain` and `touch-action: pan-y`.
  - Do not intercept `wheel` and simulate scrolling in JavaScript. That adds latency and makes nested panels feel heavy.
- `ContainedScrollArea`
  - Use this shared primitive instead of repeating scroll containment classes and hook wiring.
  - Current consumers include chat history, contact form, hero post rail, and expanded widgets.
- `MeshBackground`
  - Keep it decorative, but make it mostly static.
  - Avoid multiple full-screen `framer-motion` blobs with very large blur radii on every page.
- `FloatingDock`
  - Keep the dock, but animate only the properties that matter for navigation state.
  - Avoid elastic keyframe chains for the indicator when a simple spring on `left` and `width` is enough.
- `GlassIconButton` and `getLiquidGlassClassName`
  - Reuse these for circular controls and glass surfaces instead of copying ad-hoc border, blur, and hover classes.
  - This keeps interaction styling consistent while avoiding accidental reintroduction of heavier variants.

## Defer

- `ExpandableWidget`
  - It is not the main steady-state performance cost because it runs only on interaction.
  - If this area grows, move it onto `@radix-ui/react-dialog` for accessibility and keep motion focused on entry/exit.

## Practical Rule

- Prefer CSS and browser-native behavior for scrolling, containment, and static atmospherics.
- Spend JavaScript animation budget only on user-triggered transitions or clear information hierarchy.
