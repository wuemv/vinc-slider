import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import VincSliderPlugin, { VincSlider, type VincSlide } from '../src'

const slides: VincSlide[] = [
  { image: '/one.jpg', headline: { first: 'The', second: 'Water Villas' } },
  { image: '/two.jpg', headline: { first: 'Fly', second: 'in Maldives' }, cta: { label: 'Book', href: '/book' } },
  { image: '/three.jpg', headline: { first: 'Beautiful' }, alt: 'A white beach', tint: 'rgba(0, 0, 0, 0.4)' },
]

let wrapper: VueWrapper | undefined

// Waits a tick after mounting: the slider starts its timer once it is mounted.
async function mountSlider(props: Record<string, unknown> = {}): Promise<VueWrapper> {
  wrapper = mount(VincSlider, { props: { slides, ...props }, attachTo: document.body })
  await nextTick()

  return wrapper
}

function activeIndex(slider: VueWrapper): number {
  return slider.findAll('.vinc-slider__slide').findIndex((slide) => slide.classes('vinc-slider__slide--active'))
}

async function advance(ms: number): Promise<void> {
  vi.advanceTimersByTime(ms)
  await nextTick()
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('rendering', () => {
  it('renders a slide per item, with only the first one shown', async () => {
    const slider = await mountSlider()
    const rendered = slider.findAll('.vinc-slider__slide')

    expect(rendered).toHaveLength(3)
    expect(activeIndex(slider)).toBe(0)
    expect(rendered[0]?.attributes('aria-hidden')).toBeUndefined()
    expect(rendered[0]?.attributes('inert')).toBeUndefined()
    expect(rendered[1]?.attributes('aria-hidden')).toBe('true')
    expect(rendered[1]?.attributes('inert')).toBeDefined()
    expect(rendered[0]?.attributes('aria-label')).toBe('1 of 3')
    expect(slider.attributes('aria-roledescription')).toBe('carousel')
    expect(slider.attributes('aria-label')).toBe('Banner')
  })

  it('renders the headline as one heading, readable as a phrase', async () => {
    const slider = await mountSlider()
    const headline = slider.find('.vinc-slider__slide h2')

    expect(headline.text()).toBe('The Water Villas')
    expect(slider.findAll('.vinc-slider__slide')[2]?.find('h2').text()).toBe('Beautiful')
    expect((await mountSlider({ headingTag: 'h1' })).find('.vinc-slider__slide h1').exists()).toBe(true)
  })

  it('renders a call to action only for slides that have one', async () => {
    const slider = await mountSlider()
    const ctas = slider.findAll('.vinc-slider__cta')

    expect(ctas).toHaveLength(1)
    expect(ctas[0]?.attributes('href')).toBe('/book')
    expect(ctas[0]?.text()).toBe('Book')
  })

  it('sets the image, the stacking order and a custom tint', async () => {
    const rendered = (await mountSlider()).findAll('.vinc-slider__slide')
    const first = rendered[0]?.element as HTMLElement
    const third = rendered[2]?.element as HTMLElement

    expect(first.style.backgroundImage).toBe('url("/one.jpg")')
    expect(first.style.zIndex).toBe('4')
    expect(third.style.zIndex).toBe('2')
    expect(third.style.getPropertyValue('--vinc-slide-tint')).toBe('rgba(0, 0, 0, 0.4)')
    expect(first.style.getPropertyValue('--vinc-slide-tint')).toBe('')
    expect(rendered[2]?.find('.vinc-slider__sr-only').text()).toBe('A white beach')
  })

  it('translates the labels', async () => {
    const slider = await mountSlider({
      labels: { carousel: 'Offers', slide: (n: number, total: number) => `${n}/${total}`, stop: 'Pause' },
    })

    expect(slider.attributes('aria-label')).toBe('Offers')
    expect(slider.find('.vinc-slider__slide').attributes('aria-label')).toBe('1/3')
    expect(slider.find('.vinc-slider__toggle').attributes('aria-label')).toBe('Pause')
    expect(slider.find('.vinc-slider__dot').attributes('aria-label')).toBe('Go to slide 1')
  })

  it('shows no controls for a single slide', async () => {
    const slider = await mountSlider({ slides: [slides[0]] })

    expect(slider.find('.vinc-slider__controls').exists()).toBe(false)
  })

  it('renders on the server, with only the hidden slides inert', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(VincSlider, { slides }) }))
    const container = document.createElement('div')
    container.innerHTML = html
    const rendered = [...container.querySelectorAll('.vinc-slider__slide')]

    expect(rendered.map((slide) => slide.hasAttribute('inert'))).toEqual([false, true, true])
    expect(rendered[0]?.classList).toContain('vinc-slider__slide--active')
  })
})

describe('autoplay', () => {
  it('moves to the next slide every interval and wraps around', async () => {
    const slider = await mountSlider({ interval: 1000 })

    await advance(999)
    expect(activeIndex(slider)).toBe(0)
    await advance(1)
    expect(activeIndex(slider)).toBe(1)
    expect(slider.classes()).not.toContain('vinc-slider--first-load')
    await advance(1000)
    expect(activeIndex(slider)).toBe(2)
    await advance(1000)
    expect(activeIndex(slider)).toBe(0)
    // The first slide sits on top of the last, so it slides in from the left.
    expect(slider.classes()).toContain('vinc-slider--previous')
  })

  it('stays put without autoplay', async () => {
    const slider = await mountSlider({ autoplay: false })

    await advance(20000)
    expect(activeIndex(slider)).toBe(0)
    expect(slider.find('.vinc-slider__toggle').exists()).toBe(false)
  })

  it('pauses while hovered, unless pauseOnHover is off', async () => {
    const slider = await mountSlider({ interval: 1000 })

    await slider.trigger('mouseenter')
    await advance(3000)
    expect(activeIndex(slider)).toBe(0)
    await slider.trigger('mouseleave')
    await advance(1000)
    expect(activeIndex(slider)).toBe(1)

    const always = await mountSlider({ interval: 1000, pauseOnHover: false })
    await always.trigger('mouseenter')
    await advance(1000)
    expect(activeIndex(always)).toBe(1)
  })

  it('stops and starts with the toggle button', async () => {
    const slider = await mountSlider({ interval: 1000 })
    const toggle = slider.find('.vinc-slider__toggle')

    expect(toggle.attributes('aria-label')).toBe('Stop slide rotation')
    expect(slider.find('.vinc-slider__slides').attributes('aria-live')).toBe('off')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-label')).toBe('Start slide rotation')
    expect(slider.find('.vinc-slider__slides').attributes('aria-live')).toBe('polite')
    await advance(5000)
    expect(activeIndex(slider)).toBe(0)
    await toggle.trigger('click')
    await advance(1000)
    expect(activeIndex(slider)).toBe(1)
  })

  it('pauses while a control has keyboard focus', async () => {
    const slider = await mountSlider({ interval: 1000 })
    const dot = slider.find('.vinc-slider__dot')

    ;(dot.element as HTMLButtonElement).focus()
    await nextTick()
    await advance(3000)
    expect(activeIndex(slider)).toBe(0)
    ;(dot.element as HTMLButtonElement).blur()
    await nextTick()
    await advance(1000)
    expect(activeIndex(slider)).toBe(1)
  })

  it('starts stopped when the system asks for reduced motion', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce'), media: query }))
    const slider = await mountSlider({ interval: 1000 })
    await nextTick()

    await advance(5000)
    expect(activeIndex(slider)).toBe(0)
    expect(slider.find('.vinc-slider__toggle').attributes('aria-label')).toBe('Start slide rotation')
  })

  it('clears its timer when unmounted', async () => {
    const slider = await mountSlider({ interval: 1000 })
    await nextTick()
    expect(vi.getTimerCount()).toBe(1)

    slider.unmount()
    wrapper = undefined
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('navigation', () => {
  it('goes to a slide from the pagination, and restarts the timer', async () => {
    const slider = await mountSlider({ interval: 1000 })
    const dots = slider.findAll('.vinc-slider__dot')

    await advance(900)
    await dots[2]?.trigger('click')
    expect(activeIndex(slider)).toBe(2)
    expect(dots[2]?.attributes('aria-current')).toBe('true')
    expect(dots[0]?.attributes('aria-current')).toBeUndefined()
    expect(slider.classes()).not.toContain('vinc-slider--previous')
    await advance(900)
    expect(activeIndex(slider)).toBe(2)

    await dots[1]?.trigger('click')
    expect(slider.classes()).toContain('vinc-slider--previous')
  })

  it('moves with the arrow keys on the controls', async () => {
    const slider = await mountSlider({ autoplay: false, current: 1 })
    const dot = slider.find('.vinc-slider__dot')

    await dot.trigger('keydown', { key: 'ArrowRight' })
    expect(activeIndex(slider)).toBe(2)
    await dot.trigger('keydown', { key: 'ArrowRight' })
    await dot.trigger('keydown', { key: 'ArrowLeft' })
    await dot.trigger('keydown', { key: 'ArrowLeft' })
    expect(activeIndex(slider)).toBe(1)
    await dot.trigger('keydown', { key: 'Enter' })
    expect(activeIndex(slider)).toBe(1)
    // A slide's link keeps focus: moving its slide away would lose it.
    await slider.find('.vinc-slider__cta').trigger('keydown', { key: 'ArrowRight' })
    expect(activeIndex(slider)).toBe(1)
  })

  it('moves with a horizontal touch swipe', async () => {
    const slider = await mountSlider({ autoplay: false })
    const swipe = async (from: [number, number], to: [number, number], pointerType = 'touch') => {
      await slider.trigger('pointerdown', { pointerType, isPrimary: true, clientX: from[0], clientY: from[1] })
      await slider.trigger('pointerup', { pointerType, isPrimary: true, clientX: to[0], clientY: to[1] })
    }

    await swipe([300, 100], [100, 110])
    expect(activeIndex(slider)).toBe(1)
    await swipe([100, 100], [300, 90])
    expect(activeIndex(slider)).toBe(0)
    // A tap, a mostly vertical move and a mouse drag change nothing.
    await swipe([100, 100], [110, 100])
    await swipe([100, 100], [180, 300])
    await swipe([300, 100], [100, 100], 'mouse')
    expect(activeIndex(slider)).toBe(0)
  })

  it('swipes each slider on the page on its own', async () => {
    const first = await mountSlider({ autoplay: false })
    const second = mount(VincSlider, { props: { slides, autoplay: false }, attachTo: document.body })

    await second.trigger('pointerdown', { pointerType: 'touch', isPrimary: true, clientX: 300, clientY: 0 })
    await second.trigger('pointerup', { pointerType: 'touch', isPrimary: true, clientX: 100, clientY: 0 })
    expect(activeIndex(second)).toBe(1)
    expect(activeIndex(first)).toBe(0)
    second.unmount()
  })

  it('works with v-model:current', async () => {
    const slider = await mountSlider({ autoplay: false, current: 1 })
    expect(activeIndex(slider)).toBe(1)

    await slider.findAll('.vinc-slider__dot')[2]?.trigger('click')
    expect(slider.emitted('update:current')).toEqual([[2]])
  })

  it('exposes next, prev and goTo', async () => {
    const slider = await mountSlider({ autoplay: false })
    const api = slider.vm as unknown as { next(): void; prev(): void; goTo(index: number): void }

    api.next()
    await nextTick()
    expect(activeIndex(slider)).toBe(1)
    api.goTo(-1)
    await nextTick()
    expect(activeIndex(slider)).toBe(2)
    api.prev()
    await nextTick()
    expect(activeIndex(slider)).toBe(1)
  })

  it('goes back to the first slide when the slide on show is removed', async () => {
    const slider = await mountSlider({ autoplay: false, current: 2 })

    await slider.setProps({ slides: slides.slice(0, 2) })
    expect(activeIndex(slider)).toBe(0)
  })
})

describe('plugin', () => {
  it('registers the component for <VincSlider> and <vinc-slider>', async () => {
    wrapper = mount(
      { template: '<div><VincSlider :slides="slides" /><vinc-slider :slides="slides" /></div>', data: () => ({ slides }) },
      { global: { plugins: [VincSliderPlugin] } },
    )

    expect(wrapper.findAll('.vinc-slider')).toHaveLength(2)
  })
})
