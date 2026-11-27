export interface VincSlideHeadline {
  /** The first line. */
  first: string
  /** The second line, indented under the first. */
  second?: string
}

export interface VincSlideCta {
  label: string
  href: string
  target?: string
  rel?: string
}

export interface VincSlide {
  /** URL of the background image. */
  image: string
  headline: VincSlideHeadline
  /** A link under the headline. */
  cta?: VincSlideCta
  /** Describes the image to screen readers. Leave it out for a decorative image. */
  alt?: string
  /** Colour laid over the image, such as `rgba(86, 125, 156, 0.5)`. By default, slides take turns through three blue tones. */
  tint?: string
}

/** The words screen readers hear. Override them to translate the slider. */
export interface VincSliderLabels {
  /** Names the slider as a whole. */
  carousel: string
  /** Names a slide: "2 of 3". */
  slide: (number: number, total: number) => string
  /** A pagination button: "Go to slide 2". */
  goTo: (number: number) => string
  /** The button that stops automatic rotation. */
  stop: string
  /** The button that starts it again. */
  start: string
}
