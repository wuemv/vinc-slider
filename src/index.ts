import type { App, Plugin } from 'vue'
import VincSlider from './VincSlider.vue'

export type { VincSlide, VincSlideCta, VincSlideHeadline, VincSliderLabels } from './types'
export { VincSlider }

/** Registers `<VincSlider>` (also usable as `<vinc-slider>`) in every component of the app. */
const plugin: Plugin = {
  install(app: App) {
    app.component('VincSlider', VincSlider)
  },
}

export default plugin

declare module 'vue' {
  interface GlobalComponents {
    VincSlider: typeof VincSlider
  }
}
