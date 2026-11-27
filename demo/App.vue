<script setup lang="ts">
import { ref } from 'vue'
import type { VincSlide } from '../src'
import beach from './images/beach.svg'
import lagoon from './images/lagoon.svg'
import sunset from './images/sunset.svg'

const slides: VincSlide[] = [
  {
    image: lagoon,
    headline: { first: 'The', second: 'Water Villas' },
    cta: { label: 'See the villas', href: '#usage' },
  },
  {
    image: sunset,
    headline: { first: 'Fly', second: 'in Maldives' },
    cta: { label: 'Plan a trip', href: '#usage' },
  },
  {
    image: beach,
    headline: { first: 'Beautiful', second: 'Beach' },
  },
]

const current = ref(0)
const autoplay = ref(true)
const interval = ref(5000)
</script>

<template>
  <VincSlider
    v-model:current="current"
    :slides="slides"
    :autoplay="autoplay"
    :interval="interval"
    heading-tag="h1"
  />

  <main
    id="usage"
    class="demo"
  >
    <h2>vinc-slider</h2>
    <p>A full-screen banner slider for Vue 3. Swipe it on a phone, or use the arrow keys once a control has focus.</p>

    <fieldset class="demo__controls">
      <legend>Try it</legend>
      <label><input
        v-model="autoplay"
        type="checkbox"
      > Autoplay</label>
      <label>Interval
        <select v-model.number="interval">
          <option :value="3000">3 s</option>
          <option :value="5000">5 s</option>
          <option :value="8000">8 s</option>
        </select>
      </label>
      <span>Slide {{ current + 1 }} of {{ slides.length }}</span>
    </fieldset>

    <pre><code>import VincSlider from 'vinc-slider'
import 'vinc-slider/style.css'

app.use(VincSlider)</code></pre>
  </main>
</template>

<style>
body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: #1d2733;
  background: #f5f5f1;
}

.demo {
  max-width: 42rem;
  margin: 0 auto;
  padding: 3rem 1rem 4rem;
  line-height: 1.5;
}

.demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  align-items: center;
  margin: 2rem 0;
  padding: 1rem 1.25rem;
  border: 1px solid #c9ced6;
  border-radius: 8px;
}

.demo pre {
  overflow-x: auto;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  color: #e9edf2;
  background: #1d2733;
}
</style>
