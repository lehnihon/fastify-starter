import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: './test/globalSetup.ts',
    include: ['test/**/*.test.ts'],
  },
})
