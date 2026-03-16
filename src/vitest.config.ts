import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Compatible con Vitest 1.3.1 + Vite 5.1.0
export default defineConfig({
  plugins: [react()],
  
  // Configuración de tests
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest-setup.ts'],
  },
});