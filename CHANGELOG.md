# Changelog

## 1.0.0 (unreleased)

Rewritten for Vue 3. See [Upgrading from 0.0.1](README.md#upgrading-from-001) in the README.

### Changed

- Vue 3.5 or later; Vue 2 is no longer supported.
- The CSS is a separate file, `vinc-slider/style.css`, and every rule is scoped to the slider.
- Headlines are `<h2>` by default (`heading-tag` sets the level).
- `slides` has no sample default.

### Added

- `autoplay`, `interval`, `pause-on-hover`, `heading-tag`, `labels` and `v-model:current`.
- Per-slide `cta`, `alt` and `tint`.
- `next()`, `prev()` and `goTo()` on the component instance.
- A stop button, pause on keyboard focus, arrow keys on the controls, and reduced-motion support.
- TypeScript types.

### Fixed

- `import VincSlider from 'vinc-slider'` failed: the package pointed at a file it did not include.
- Swiping: a tap moved to the next slide, a short swipe did nothing, and swiping back from the first slide left no slide showing.
- Only the first slider on a page responded to swipes.
- The timer kept running after the slider was removed.
- The slider's styles changed the whole page (`html`, `body`, `*`, `::selection`).
- Slides after the third had no tint.

## 0.0.1 (2019-09-26)

First release, for Vue 2.
