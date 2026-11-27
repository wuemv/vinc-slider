<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { VincSlide, VincSliderLabels } from './types'

defineOptions({ name: 'VincSlider' })

const props = withDefaults(
  defineProps<{
    slides: VincSlide[]
    /** Moves to the next slide every `interval` milliseconds. */
    autoplay?: boolean
    interval?: number
    /** Pauses the rotation while the pointer is over the slider. */
    pauseOnHover?: boolean
    /** The element that holds each headline. */
    headingTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div'
    labels?: Partial<VincSliderLabels>
  }>(),
  {
    autoplay: true,
    interval: 5000,
    pauseOnHover: true,
    headingTag: 'h2',
    labels: () => ({}),
  },
)

/** The index of the slide on show, from 0. Bind it with `v-model:current`. */
const current = defineModel<number>('current', { default: 0 })

const defaultLabels: VincSliderLabels = {
  carousel: 'Banner',
  slide: (number, total) => `${number} of ${total}`,
  goTo: (number) => `Go to slide ${number}`,
  stop: 'Stop slide rotation',
  start: 'Start slide rotation',
}
const text = computed<VincSliderLabels>(() => ({ ...defaultLabels, ...props.labels }))

// A touch has to travel this far sideways to count as a swipe.
const SWIPE_DISTANCE = 50

const count = computed(() => props.slides.length)
// The slide coming in sits above the one going out, so it slides in from the left.
const isPrevious = ref(false)
const isFirstLoad = ref(true)
const hovered = ref(false)
const focused = ref(false)
// Set by the stop/start button, and on mount when the system asks for reduced motion.
const stopped = ref(false)
const mounted = ref(false)

const canRotate = computed(() => props.autoplay && count.value > 1)
const rotating = computed(
  () =>
    mounted.value && canRotate.value && !stopped.value && !focused.value && !(props.pauseOnHover && hovered.value),
)

function goTo(index: number): void {
  if (count.value > 0) {
    current.value = ((index % count.value) + count.value) % count.value
  }
}

function next(): void {
  goTo(current.value + 1)
}

function prev(): void {
  goTo(current.value - 1)
}

watch(current, (now, before) => {
  isPrevious.value = now < before
  isFirstLoad.value = false
})

watch(count, (total) => {
  if (current.value >= total) {
    goTo(0)
  }
})

let timer: ReturnType<typeof setTimeout> | undefined

function schedule(): void {
  clearTimeout(timer)
  timer = rotating.value && props.interval > 0 ? setTimeout(next, props.interval) : undefined
}

watch([rotating, current, () => props.interval], schedule)

onMounted(() => {
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)')
  stopped.value = reduceMotion ? reduceMotion.matches : false
  mounted.value = true
})

onUnmounted(() => clearTimeout(timer))

// Keyboard focus pauses the rotation, so a slide does not change under the reader. A click focuses a
// button too, but should not stop the slider for good.
function onFocusIn(event: FocusEvent): void {
  const target = event.target
  try {
    focused.value = target instanceof Element && target.matches(':focus-visible')
  } catch {
    focused.value = true
  }
}

function onFocusOut(event: FocusEvent): void {
  const root = event.currentTarget as HTMLElement
  if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) {
    focused.value = false
  }
}

// On the controls only: a link in a slide would lose focus as its slide left.
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowRight') {
    next()
  } else if (event.key === 'ArrowLeft') {
    prev()
  } else {
    return
  }
  event.preventDefault()
}

let swipeStart: { x: number; y: number } | null = null

function onPointerDown(event: PointerEvent): void {
  swipeStart = event.pointerType === 'mouse' || event.isPrimary === false ? null : { x: event.clientX, y: event.clientY }
}

function onPointerUp(event: PointerEvent): void {
  if (swipeStart === null) {
    return
  }
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy)) {
    return
  }
  if (dx < 0) {
    next()
  } else {
    prev()
  }
}

function slideStyle(slide: VincSlide, index: number): Record<string, string | number> {
  const style: Record<string, string | number> = {
    zIndex: count.value - index + 1,
    backgroundImage: `url(${JSON.stringify(slide.image)})`,
  }
  if (slide.tint) {
    style['--vinc-slide-tint'] = slide.tint
    style['--vinc-slide-overlay'] = `color-mix(in srgb, ${slide.tint} 60%, transparent)`
    style['--vinc-slide-text-shadow'] = `2px 5px 45px color-mix(in srgb, ${slide.tint} 50%, transparent)`
  }

  return style
}

defineExpose({ goTo, next, prev })
</script>

<template>
  <section
    class="vinc-slider"
    :class="{ 'vinc-slider--previous': isPrevious, 'vinc-slider--first-load': isFirstLoad }"
    aria-roledescription="carousel"
    :aria-label="text.carousel"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="swipeStart = null"
  >
    <div
      class="vinc-slider__slides"
      :aria-live="rotating ? 'off' : 'polite'"
    >
      <div
        v-for="(slide, index) in slides"
        :key="index"
        class="vinc-slider__slide"
        :class="[`vinc-slider__slide--tone-${(index % 3) + 1}`, { 'vinc-slider__slide--active': index === current }]"
        :style="slideStyle(slide, index)"
        role="group"
        aria-roledescription="slide"
        :aria-label="text.slide(index + 1, count)"
        :aria-hidden="index === current ? undefined : 'true'"
        :inert="index !== current || undefined"
      >
        <div class="vinc-slider__inner">
          <div
            class="vinc-slider__bg-text"
            aria-hidden="true"
          >
            <span class="vinc-slider__line">{{ slide.headline.first }}</span>
            <span
              v-if="slide.headline.second"
              class="vinc-slider__line"
            >{{ slide.headline.second }}</span>
          </div>
          <div class="vinc-slider__content">
            <component
              :is="headingTag"
              class="vinc-slider__headline"
            >
              <span class="vinc-slider__line">{{ slide.headline.first }}</span>
              <!-- One space between the lines, for screen readers: on separate lines, Vue would add more. -->
              <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
              <template v-if="slide.headline.second">{{ ' ' }}<span class="vinc-slider__line">{{ slide.headline.second }}</span></template>
            </component>
            <a
              v-if="slide.cta"
              class="vinc-slider__cta"
              :href="slide.cta.href"
              :target="slide.cta.target"
              :rel="slide.cta.rel"
            >
              {{ slide.cta.label }}
            </a>
          </div>
          <span
            v-if="slide.alt"
            class="vinc-slider__sr-only"
          >{{ slide.alt }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="count > 1"
      class="vinc-slider__controls"
      @keydown="onKeydown"
    >
      <div class="vinc-slider__pagination">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          type="button"
          class="vinc-slider__dot"
          :class="{ 'vinc-slider__dot--active': index === current }"
          :aria-label="text.goTo(index + 1)"
          :aria-current="index === current ? 'true' : undefined"
          @click="goTo(index)"
        />
      </div>
      <button
        v-if="canRotate"
        type="button"
        class="vinc-slider__toggle"
        :aria-label="stopped ? text.start : text.stop"
        @click="stopped = !stopped"
      >
        <svg
          v-if="stopped"
          viewBox="0 0 12 12"
          aria-hidden="true"
        ><path d="M3 1.5v9l7.5-4.5z" /></svg>
        <svg
          v-else
          viewBox="0 0 12 12"
          aria-hidden="true"
        ><path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" /></svg>
      </button>
    </div>
  </section>
</template>

<style src="./style.css"></style>
