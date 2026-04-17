# Implementation Performance Guardrails

Use this before adding new UI, animation, or interaction logic. The goal is to keep the current visual language while avoiding accidental regressions.

## Core Rule

- Keep effects.
- Simplify state, measurement, and event flow underneath them.
- Prefer one source of truth for visual state.

## Before Adding New Motion

- Ask whether the effect is steady-state or user-triggered.
- If it is steady-state, prefer CSS over JavaScript animation.
- If it is user-triggered, prefer transform and opacity over layout and height animation.
- Avoid giving the same visual state two different control paths.
  - Example: an icon using one state and an indicator using separate measured state.

## Before Adding New Scroll Behavior

- Decide who owns the gesture.
  - Root container
  - Nested scroll area
  - Modal or panel local container
- Do not hijack wheel scrolling with JavaScript smoothing.
- Use `ContainedScrollArea` for nested scroll by default.
- If a nested area must allow horizontal gestures to bubble upward, make that choice explicit with data attributes instead of special-case code in multiple places.

## Before Adding New Section Navigation

- Update the visible section list and dock navigation together.
- On mobile, treat sections as real horizontal panels, not vertical pages controlled by swipe emulation.
- Make active section state derive from actual scroll position, not only from observer timing.
- If dock highlight and icon state can drift apart, unify them under a single render path.

## Before Adding New Glass or Blur UI

- Reuse `LiquidGlass`, `GlassIconButton`, and `getLiquidGlassClassName`.
- Do not add new one-off blur stacks unless existing primitives cannot express the design.
- Limit large blur surfaces that remain mounted all the time.
- Prefer one strong blur layer over several stacked mild blur layers.

## Before Adding New Images

- Use optimized image delivery whenever possible.
- Avoid plain `<img>` when `next/image` can be used.
- Define width and height constraints early so layout and paint stay predictable.
- Treat `unoptimized` as an exception that needs justification.

## Before Adding New Mobile Interactions

- Decide whether the mobile version is:
  - the same structure as desktop with smaller layout, or
  - a different interaction model
- If the interaction model changes, separate the mobile logic clearly.
- Avoid mixing native horizontal carousel behavior with extra gesture hacks unless profiling proves they are needed.

## Hotspots To Re-check First

- `apps/web/src/components/shared/smooth-scroll-container.tsx`
- `apps/web/src/components/shared/floating-dock.tsx`
- `apps/web/src/hooks/use-contained-scroll.ts`
- `apps/web/src/components/features/bento/expandable-widget.tsx`
- `apps/web/src/components/features/hero/hero-section.tsx`
- `apps/web/src/components/features/chat/*`

## Safe Defaults

- Use CSS gradients and static atmospheric layers for backgrounds.
- Use `requestAnimationFrame` only when syncing visual state to actual scroll or pointer position.
- Use `IntersectionObserver` for coarse visibility, not as the only truth source for snap-driven navigation.
- Keep modal overlays portaled to `document.body`.

## Red Flags

- Multiple components measuring the same thing independently.
- A `motion` tree that controls width, position, opacity, and content timing in different state variables.
- Scroll bugs that only happen when the gesture begins on a child element.
- Separate mobile and desktop visuals sharing one complicated event pipeline.
- Adding a new effect by copying classes instead of extending a primitive.

## Pre-merge Checklist

- Does the feature reuse an existing primitive where possible?
- Does one state source drive all visible active and highlight states?
- Does mobile behavior match the actual mobile layout model?
- Have nested scroll areas been tested for both vertical and horizontal gestures?
- Have images been checked for optimization and fixed sizing?
- Has the change been linted?
- If the change affects motion or scrolling, has it been manually tested on mobile interaction paths?
