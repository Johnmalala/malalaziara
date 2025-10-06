import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      proxy: {
        // Explicitly proxy each Supabase service
        '/auth/v1': {
          target: env.VITE_SUPABASE_URL,
          changeOrigin: true,
        },
        '/rest/v1': {
          target: env.VITE_SUPABASE_URL,
          changeOrigin: true,
        },
        '/storage/v1': {
          target: env.VITE_SUPABASE_URL,
          changeOrigin: true,
        },
        // Ensure WebSocket traffic for Realtime is handled correctly
        '/realtime/v1': {
          target: env.VITE_SUPABASE_URL,
          changeOrigin: true,
          ws: true,
        },
      }
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
