import type { Meta, StoryObj } from "@storybook/react";
import { JSONSchema4 } from "json-schema";
import React from "react";

import "../styles/bundle.css";

import { JsonSchemaViewer } from "../components/JsonSchemaViewer";

import defaultSchema from "../__fixtures__/default-schema.json";
import extensionsSchema from "../__fixtures__/extensions/simple.json";

const meta: Meta<typeof JsonSchemaViewer> = {
  component: JsonSchemaViewer,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof JsonSchemaViewer>;

export const ExtensionRowSchema: Story = {
  args: {
    schema: extensionsSchema as JSONSchema4,
    defaultExpandedDepth: Infinity,
    renderRootTreeLines: true,
    renderExtensionAddon: ({ nestingLevel, vendorExtensions }) => {
      if (nestingLevel < 1) {
        return null;
      }

      if (typeof vendorExtensions["x-stoplight"] === "undefined") {
        return null;
      }

      return <strong>{JSON.stringify(vendorExtensions["x-stoplight"], null, 2)}</strong>;
    },
  },
};
