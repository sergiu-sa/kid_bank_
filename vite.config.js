import { defineConfig } from "vite";
import { resolve } from "path";

// Multi-page build: every HTML file used as an entry point
// must be listed here so `vite build` produces it in dist/.
// Files in `public/` are also copied verbatim to dist/ root.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "src/pages/login.html"),
      },
    },
  },
});
