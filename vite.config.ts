import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' loads all env vars regardless of prefix, allowing us to map them manually.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This maps the 'VITE_API_KEY' from Vercel settings to 'process.env.API_KEY' in your code
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
  };
});