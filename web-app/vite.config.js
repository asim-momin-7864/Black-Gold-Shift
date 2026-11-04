import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        login: resolve(import.meta.dirname, "login.html"),
        dashboard1: resolve(import.meta.dirname, "Dashboard_page1.html"),
        dashboard2: resolve(import.meta.dirname, "Dashboard_page2.html"),
        seed: resolve(import.meta.dirname, "seed.html"),
      },
    },
  },
});
