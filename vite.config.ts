import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isHubBuild = mode === 'production-hub'

  return {
    // Preview builds use relative URLs so the same files work locally and as a private preview page.
    base: isHubBuild ? '/english-grade1-quiz/' : './',
    define: {
      __QUIZ_BUILD_MODE__: JSON.stringify(isHubBuild ? 'production-hub' : 'preview'),
    },
    plugins: [react()],
    build: {
      outDir: isHubBuild ? 'dist-hub' : 'dist',
      target: 'es2022',
      assetsInlineLimit: 0,
    },
  }
})
