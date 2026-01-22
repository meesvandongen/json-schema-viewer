import type { Preview } from "@storybook/react";
import "../src/styles/bundle.css";

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
    backgrounds: {
      options: {
        light: { name: "light", value: "#f9fafb" },
        dark: { name: "dark", value: "#0f172a" },
      },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: "light",
    },
  },

  tags: ["autodocs"],
};

export default preview;
