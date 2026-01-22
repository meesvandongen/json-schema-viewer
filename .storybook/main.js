import { mergeConfig } from "vite";

/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
  stories: ["../src/__stories__/*.stories.tsx"],
  addons: ["@storybook/addon-docs"],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  async viteFinal(config) {
    return mergeConfig(config, {
      optimizeDeps: {
        include: ["react", "react-dom"],
      },
    });
  },
};

export default config;
