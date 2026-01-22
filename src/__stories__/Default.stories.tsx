import type { Meta, StoryObj } from "@storybook/react";
import { JSONSchema4 } from "json-schema";
import React from "react";

import "../styles/bundle.css";

import { JsonSchemaViewer } from "../components/JsonSchemaViewer";

import defaultSchema from "../__fixtures__/default-schema.json";
import stressSchema from "../__fixtures__/stress-schema.json";
import arrayOfComplexObjects from "../__fixtures__/arrays/of-complex-objects.json";

const meta: Meta<typeof JsonSchemaViewer> = {
  component: JsonSchemaViewer,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof JsonSchemaViewer>;

export const Default: Story = {
  args: {
    schema: defaultSchema as JSONSchema4,
  },
};

export const CustomRowAddon: Story = {
  args: {
    schema: defaultSchema as JSONSchema4,
    renderRowAddon: () => (
      <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          aria-label="focus"
          style={{ border: "1px solid var(--jsv-border)", padding: 4 }}
        >
          ●
        </button>
        <input type="checkbox" />
      </div>
    ),
  },
};

export const Expansions: Story = {
  args: {
    schema: arrayOfComplexObjects as JSONSchema4,
    renderRootTreeLines: true,
    defaultExpandedDepth: 0,
  },
};

export const ArrayOfObjects: Story = {
  args: { 
    schema: arrayOfComplexObjects as JSONSchema4, 
    renderRootTreeLines: true 
  },
};

export const StressTest: Story = {
  args: { 
    schema: stressSchema as JSONSchema4, 
    defaultExpandedDepth: 7 
  },
};

export const ErrorBoundary: Story = {
  args: {
    schema: {
      "null (throws error)": null,
      "object (recovers from error)": defaultSchema,
    },
  },
};

export const InvalidTypes: Story = {
  args: {
    schema: {
      type: "object",
      // @ts-ignore
      properties: {
        id: {
          type: "string",
        },
        address: {
          type: [
            // @ts-ignore
            "null",
            // @ts-ignore
            {
              type: "object",
              properties: {
                taskId: {
                  type: "string",
                  format: "uuid",
                },
              },
            },
          ],
        },
      },
    },
  },
  name: "Invalid types",
};

export const DarkMode: Story = {
  args: {
    schema: defaultSchema as JSONSchema4,
  },
  render: (args) => (
    <div className="json-schema-viewer" data-theme="dark">
      <JsonSchemaViewer {...args} />
    </div>
  ),
};
