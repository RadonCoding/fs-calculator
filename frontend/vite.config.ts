import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/evaluate": `http://localhost:${process.env.PORT || 5001}`,
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
