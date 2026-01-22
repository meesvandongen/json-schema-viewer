import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    include: ["src/**/*.{spec,test}.{ts,tsx}", "src/**/__tests__/**/*.{ts,tsx}"],
    globals: true,
    css: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["src/__tests__/utils/**", "src/components/shared/__tests__/utils.ts"],
  },
});
