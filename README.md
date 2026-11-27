# @wuemv/slider

Formerly [`vinc-slider`](#upgrading-from-vinc-slider-001). A full-screen banner slider for Vue 3. As a slide leaves, its headline is cut away and the slide moves aside to show the next one underneath.

- Swipe on touch screens, or use the arrow keys on the slider's controls
- Pauses on hover and keyboard focus, and has a stop button
- Follows the reduced-motion setting: it starts stopped, and slides cross-fade instead of moving
- Renders on the server
- Typed, with no dependencies besides Vue: 2.6 kB of JavaScript and 1.8 kB of CSS, gzipped

**[See the demo](https://wuemv.github.io/vinc-slider/)**

## Install

```sh
npm install @wuemv/slider
```

It needs Vue 3.5 or later.

## Use

Register it for the whole app:

```ts
import { createApp } from 'vue'
import VincSlider from '@wuemv/slider'
import '@wuemv/slider/style.css'
import App from './App.vue'

createApp(App).use(VincSlider).mount('#app')
```

Or import it where you use it:

```vue
<script setup lang="ts">
import { VincSlider, type VincSlide } from '@wuemv/slider'
import '@wuemv/slider/style.css'

const slides: VincSlide[] = [
  {
    image: '/images/villas.jpg',
    headline: { first: 'The', second: 'Water Villas' },
    cta: { label: 'See the villas', href: '/villas' },
  },
  {
    image: '/images/beach.jpg',
    headline: { first: 'Beautiful', second: 'Beach' },
    alt: 'A white sand beach at low tide',
  },
]
</script>

<template>
  <VincSlider :slides="slides" />
</template>
```

Registered with `app.use()`, it also works as `<vinc-slider>`.

## Slides

| Field | Type | |
|---|---|---|
| `image` | `string` | URL of the background image. |
| `headline` | `{ first: string, second?: string }` | Two lines, the second indented. |
| `cta` | `{ label, href, target?, rel? }` | A link under the headline. Optional. |
| `alt` | `string` | Describes the image to screen readers. Leave it out for a decorative image. |
| `tint` | `string` | A colour laid over the image, such as `rgba(86, 125, 156, 0.5)`. By default, slides take turns through three blue tones. |

## Props

| Prop | Default | |
|---|---|---|
| `slides` | required | The slides, in order. |
| `autoplay` | `true` | Moves to the next slide every `interval`. |
| `interval` | `5000` | Milliseconds per slide. |
| `pause-on-hover` | `true` | Pauses while the pointer is over the slider. |
| `heading-tag` | `'h2'` | The element for each headline: `h1` to `h6`, `p` or `div`. Use `h1` when the slider carries the page's main heading. |
| `labels` | English | What screen readers hear. See [Translating](#translating). |
| `v-model:current` | `0` | The index of the slide on show, from 0. |

`update:current` is emitted whenever the slide changes.

From a template ref, `next()`, `prev()` and `goTo(index)` change the slide:

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'

const slider = useTemplateRef('slider')
</script>

<template>
  <VincSlider ref="slider" :slides="slides" />
  <button @click="slider?.next()">Next</button>
</template>
```

## Styling

Set these on `.vinc-slider` or any ancestor:

| Property | Default |
|---|---|
| `--vinc-slider-height` | `calc(100svh - 50px)`; `100svh` up to 630px wide |
| `--vinc-slider-min-height` | `36rem`; none up to 630px wide |
| `--vinc-slider-color` | `#fff`: text and controls |

```css
.vinc-slider {
  --vinc-slider-height: 70vh;
  --vinc-slider-min-height: 28rem;
}
```

Every class starts with `vinc-slider`, such as `.vinc-slider__headline` and `.vinc-slider__cta`, and the styles touch nothing else on the page. Fonts come from your page.

## Accessibility

It follows the WAI-ARIA [carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/):

- The slider is a labelled carousel, and each slide a group named "2 of 3". Slides out of view are `inert`, so their links can't take focus.
- The rotation pauses while the pointer is over the slider or a control has keyboard focus. The stop button stops it until pressed again. While it's stopped, screen readers announce each new slide.
- The pagination dots are buttons. With one focused, the left and right arrow keys move between slides.
- With reduced motion turned on in the system settings, the slider starts stopped, and slides cross-fade instead of moving.

### Translating

```vue
<VincSlider
  :slides="slides"
  :labels="{
    carousel: 'Offres',
    slide: (n, total) => `${n} sur ${total}`,
    goTo: (n) => `Aller à la diapositive ${n}`,
    stop: 'Arrêter le défilement',
    start: 'Lancer le défilement',
  }"
/>
```

## Server-side rendering

The slider renders on the server like any component. Its timer and the reduced-motion check start only once it is mounted in the browser.

## Upgrading from vinc-slider 0.0.1

The slider was published as `vinc-slider` until 0.0.1, for Vue 2, which reached its end of life at the end of 2023. Vue 2 apps can stay on `vinc-slider` 0.0.1.

```sh
npm uninstall vinc-slider
npm install @wuemv/slider
```

- **A new package name.** Import from `@wuemv/slider`, not `vinc-slider` or `vinc-slider/dist/index`. The component is still `VincSlider`.
- **Vue 3.5 or later.** `app.use(VincSlider)` replaces `Vue.use(VincSlider)`.
- **Import the CSS** with `import '@wuemv/slider/style.css'`. It is no longer added to the page by the script.
- **`slides` is required.** The three sample slides are gone.
- **The link under the headline** appears only for slides with a `cta`. It used to be a "Call To Action" link that went nowhere.
- **Headlines are `<h2>`** by default. 0.0.1 used `<h1>`, with invalid `<p>` tags inside: set `heading-tag="h1"` to keep that level.
- **Styles are scoped.** The slider no longer sets `box-sizing` on every element, the cursor on `body` or the text selection colour, and its classes start with `vinc-slider`.

## Develop

```sh
pnpm install
pnpm dev     # the demo, at http://localhost:5173
pnpm check   # lint, types, tests and build
```

## Credits

The design comes from Emily Hayman's [CodePen](https://codepen.io/eehayman/pen/WReQmv).

## License

MIT
