import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: {
    __QUIZ_BUILD_MODE__: JSON.stringify('preview'),
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
})
