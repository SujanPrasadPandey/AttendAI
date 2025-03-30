import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  // server: { port: 3000 },
  server: {
    host: true, // Change from "0.0.0.0" to true
    port: 5173, // Ensure this matches your port
    strictPort: true,
    watch: {
      usePolling: true
    }
  }
});
