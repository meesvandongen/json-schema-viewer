import type { NodeHasChangedFn } from "@stoplight/types";
import type { Meta, StoryObj } from "@storybook/react";
import { JSONSchema4 } from "json-schema";
import React from "react";

import "../styles/bundle.css";

import { JsonSchemaViewer } from "../components/JsonSchemaViewer";

import defaultSchema from "../__fixtures__/default-schema.json";
import simpleExample from "../__fixtures__/diff/simple-example.json";
import rootRefExample from "../__fixtures__/diff/root-ref.json";

const changed: Record<string, ReturnType<NodeHasChangedFn>> = {
  "age-id": { type: "removed" },
  "list-id": { type: "modified", selfAffected: true },
  "list-of-objects-id": { type: "modified", isBreaking: true },
  "list-of-objects-items-friend-id": { type: "modified", isBreaking: true },
  "list-of-objects-items-friend-name-id": {
    type: "modified",
    selfAffected: true,
    isBreaking: true,
  },
  "list-of-objects-items-friend-name-last-id": { type: "added", isBreaking: true },
  "friend-id": { type: "added", isBreaking: true },
  "address-street-id": { type: "added" },
};
const nodeHasChanged: NodeHasChangedFn = ({ nodeId }) => {
  const change = changed[nodeId!];
  return change || false;
};

const meta: Meta<typeof JsonSchemaViewer> = {
  component: JsonSchemaViewer,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof JsonSchemaViewer>;

export const SimpleAllOf: Story = {
  args: { 
    schema: simpleExample as JSONSchema4,
    nodeHasChanged,
  },
};

export const RootRef: Story = {
  args: { 
    schema: rootRefExample as JSONSchema4,
    nodeHasChanged,
  },
};
