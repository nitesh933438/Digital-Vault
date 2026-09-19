import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageInfo from './package.json' with { type: 'json' }

export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageInfo.version),
  },
})
