import type { Meta, StoryObj } from "@storybook/react";
import { JSONSchema4 } from "json-schema";
import React from "react";

import "../styles/bundle.css";

import { JsonSchemaViewer } from "../components/JsonSchemaViewer";

import defaultSchema from "../__fixtures__/default-schema.json";
import boxFileSchema from "../__fixtures__/real-world/box-file.json";
import githubIssueSchema from "../__fixtures__/real-world/github-issue.json";

const meta: Meta<typeof JsonSchemaViewer> = {
  component: JsonSchemaViewer,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof JsonSchemaViewer>;

export const BoxFileSchema: Story = {
  args: {
    schema: boxFileSchema as JSONSchema4,
    parentCrumbs: ["Box", "File"],
    renderRootTreeLines: true,
  },
};

export const GithubIssueSchema: Story = {
  args: {
    schema: githubIssueSchema as JSONSchema4,
    parentCrumbs: ["Github", "Issue"],
    renderRootTreeLines: true,
  },
};
