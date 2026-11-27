import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// `vite` serves the demo, `vite build` builds the library, `vite build --mode demo` builds the demo.
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  base: mode === 'demo' ? './' : '/',
  build:
    mode === 'demo'
      ? { outDir: 'demo-dist' }
      : {
          lib: {
            entry: 'src/index.ts',
            formats: ['es'],
            fileName: 'vinc-slider',
            cssFileName: 'style',
          },
          rolldownOptions: { external: ['vue'] },
          copyPublicDir: false,
        },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
}))
