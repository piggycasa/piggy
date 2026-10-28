import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: { rollupOptions: { input: {
    arena: fileURLToPath(new URL('./index.html', import.meta.url)),
    fomo3d: fileURLToPath(new URL('./fomo3d/index.html', import.meta.url)),
    verification: fileURLToPath(new URL('./verify/index.html', import.meta.url)),
  } } },
  server: {
    host: '127.0.0.1',
    // Preserve Vite's default secret-file deny list and also exclude local
    // operator keys, journals and the private program checkout from serving.
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.openai/**'] },
    proxy: { '/api/local': { target: 'http://127.0.0.1:4318', changeOrigin: true, rewrite: path => path.replace(/^\/api\/local/, '') } },
  },
});
