import { defineConfig, lazyPlugins } from "vite-plus";

export default defineConfig({
  plugins: lazyPlugins(async () => {
    const { default: react } = await import("@vitejs/plugin-react");
    return [react()];
  }),
  // Library build (`vp pack`): ESM + CJS bundles, declarations, and every
  // stylesheet (CSS modules included) extracted into one `dist/style.css`,
  // matching the `exports` map in package.json.
  pack: {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    // `.mjs`/`.cjs` (and `.d.mts`/`.d.cts`) regardless of package `type`.
    fixedExtension: true,
    platform: "browser",
    target: "es2022",
    dts: true,
    // Inline the `@stoplight/types` aliases used in the public types; it is
    // only a devDependency, so consumers would not have it installed.
    deps: { onlyBundle: ["@stoplight/types"] },
    publint: true,
    css: { fileName: "style.css" },
  },
  fmt: {
    ignorePatterns: ["dist/**", "docs-auto/**", "coverage/**"],
  },
  lint: {
    ignorePatterns: ["dist/**", "docs-auto/**", "coverage/**"],
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
    environment: "happy-dom",
    include: ["src/**/*.{spec,test}.{ts,tsx}", "src/**/__tests__/**/*.{ts,tsx}"],
    globals: true,
    css: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["src/__tests__/utils/**", "src/components/shared/__tests__/utils.ts"],
  },
});
