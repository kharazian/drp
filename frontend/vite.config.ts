import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return
          }

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/")
          ) {
            return "react-vendor"
          }

          if (id.includes("/@tanstack/")) {
            return "tanstack-vendor"
          }

          if (id.includes("/@radix-ui/")) {
            return "radix-vendor"
          }

          if (
            id.includes("/react-hook-form/") ||
            id.includes("/@hookform/resolvers/") ||
            id.includes("/zod/")
          ) {
            return "forms-vendor"
          }

          if (id.includes("/lucide-react/") || id.includes("/react-icons/")) {
            return "icons-vendor"
          }

          if (
            id.includes("/axios/") ||
            id.includes("/sonner/") ||
            id.includes("/react-error-boundary/")
          ) {
            return "app-vendor"
          }
        },
      },
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
})
