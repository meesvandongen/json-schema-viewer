import type { Meta, StoryObj } from "@storybook/react";
import { JSONSchema4, JSONSchema7 } from "json-schema";
import React from "react";

import "../styles/bundle.css";

import { JsonSchemaViewer } from "../components/JsonSchemaViewer";
import { defaultResolver } from "../utils/refResolver";

import defaultSchema from "../__fixtures__/default-schema.json";
import refSchema from "../__fixtures__/references/base.json";
import nullRefSchema from "../__fixtures__/references/nullish.json";
import brokenRefArraySchema from "../__fixtures__/arrays/of-refs.json";
import allOfRefSchema from "../__fixtures__/references/allOfReference.json";
import fullAllOfRefDoc from "../__fixtures__/references/fullAllOfReference.json";

const meta: Meta<typeof JsonSchemaViewer> = {
  component: JsonSchemaViewer,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof JsonSchemaViewer>;

export const Simple: Story = {
  args: { schema: refSchema as JSONSchema4 },
};

export const Nullish: Story = {
  args: { schema: nullRefSchema as JSONSchema4 },
};

export const Broken: Story = {
  args: { schema: brokenRefArraySchema as JSONSchema4 },
};

export const RefResolverAllOfRef: Story = {
  args: {
    schema: allOfRefSchema as JSONSchema7,
    resolveRef: defaultResolver(fullAllOfRefDoc),
  },
};
