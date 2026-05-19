import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/evaluate": {
        target: `http://localhost:${process.env.PORT || 5001}`,
        changeOrigin: true,
        logLevel: "debug",
      },
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
