import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";

export default defineConfig({
  plugins: [pluginReact()],
  output: {
    target: "web",
  },
  source: {
    entry: {
      index: "./src/index.ts",
    },
    tsconfigPath: "./tsconfig.json",
  },
  lib: [
    {
      format: "esm",
      dts: true,
      bundle: true,
    },
  ],
});
