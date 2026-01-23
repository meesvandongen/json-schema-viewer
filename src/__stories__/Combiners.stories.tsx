import type { Meta, StoryObj } from "@storybook/react";
import { JSONSchema7 } from "json-schema";

import "../styles/bundle.css";

import { JsonSchemaViewer } from "../components/JsonSchemaViewer";

import defaultSchema from "../__fixtures__/default-schema.json";
import allOfSchema from "../__fixtures__/combiners/allOfs/base.json";
import allOfComplexSchema from "../__fixtures__/combiners/allOfs/complex.json";
import oneOfWithArraySchema from "../__fixtures__/combiners/oneof-with-array-type.json";
import oneOfWithArraySchema2 from "../__fixtures__/combiners/oneof-within-array-item.json";
import oneOfWithMultiTypesSchema from "../__fixtures__/combiners/oneof-with-multi-types.json";
import anyOfObject from "../__fixtures__/combiners/anyOf.json";

const meta: Meta<typeof JsonSchemaViewer> = {
  component: JsonSchemaViewer,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof JsonSchemaViewer>;

export const SimpleAllOf: Story = {
  args: { schema: allOfSchema as JSONSchema7 },
};

export const CircularAllOf: Story = {
  args: { schema: allOfComplexSchema as JSONSchema7 },
};

export const ArrayOneOf: Story = {
  args: { schema: oneOfWithArraySchema as JSONSchema7, renderRootTreeLines: true },
};

export const OneOfMulti: Story = {
  args: { schema: oneOfWithMultiTypesSchema, renderRootTreeLines: true },
};

export const ArrayOneOf2: Story = {
  args: { schema: oneOfWithArraySchema2 as JSONSchema7, renderRootTreeLines: true },
};

export const ObjectAnyOf: Story = {
  args: { schema: anyOfObject as JSONSchema7 },
};
