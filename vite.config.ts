import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Prevent vite from obscuring Rust errors
  clearScreen: false,
  // Tauri expects a fixed port
  server: {
    port: 5173,
    strictPort: true,
  },
  // Env prefix for Tauri
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS/Linux
    target: process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari13",
    // Don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split React into its own chunk
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Split Radix UI
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }
          // Split markdown rendering (heavy)
          if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || 
              id.includes('unified') || id.includes('mdast') || id.includes('hast')) {
            return 'markdown';
          }
          // Split syntax highlighting (heavy)
          if (id.includes('react-syntax-highlighter') || id.includes('refractor') || id.includes('prismjs')) {
            return 'syntax';
          }
          // Split database
          if (id.includes('dexie')) {
            return 'dexie';
          }
        },
      },
    },
  },
});
