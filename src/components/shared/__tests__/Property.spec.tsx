import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import type { JSONSchema4, JSONSchema7 } from "json-schema";
import * as React from "react";
import { describe, expect, it } from "vite-plus/test";

import { SchemaRow } from "../..";
import { buildTree, findNodeWithPath } from "./utils";

describe("Property component", () => {
  function renderSchema(schema: JSONSchema4 | JSONSchema7, nodePath?: readonly string[]) {
    const tree = buildTree(schema);

    const node = nodePath ? findNodeWithPath(tree, nodePath) : tree.children[0];

    if (node === undefined) {
      throw new Error("Schema node not found in tree");
    }
    const wrapper = render(<SchemaRow schemaNode={node} nestingLevel={0} />);

    return wrapper;
  }

  it("should render Types with proper type and subtype", () => {
    let schema: JSONSchema4 = {
      type: "array",
      items: {
        type: "string",
      },
    };

    let wrapper = renderSchema(schema).queryAllByTestId("property-type")[0];
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="_types_c734fe _muted_c734fe _text_c734fe"
        data-test="property-type"
      >
        array[string]
      </span>
    `,
    );

    schema = {
      type: "object",
      additionalProperties: {
        type: "string",
      },
    };

    wrapper = renderSchema(schema).queryAllByTestId("property-type")[0];
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="_types_c734fe _muted_c734fe _text_c734fe"
        data-test="property-type"
      >
        array[string]
      </span>
    `,
    );
  });

  it("should handle nullish items", () => {
    const schema: JSONSchema4 = {
      type: "array",
      items: null as any,
    };

    const wrapper = renderSchema(schema).queryByTestId("property-type");
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="_types_c734fe _muted_c734fe _text_c734fe"
        data-test="property-type"
      >
        array
      </span>
    `,
    );
  });

  it("should handle nullish $ref", () => {
    const schema: JSONSchema4 = {
      $ref: null as any,
    };

    const wrapper = renderSchema(schema).queryByTestId("property-type-ref");
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="_types_c734fe _text_c734fe"
        data-test="property-type-ref"
      >
        $ref
      </span>
    `,
    );
  });

  it("should display true schemas", () => {
    const schema: JSONSchema7 = {
      type: "object",
      properties: {
        foo: true,
      },
    };

    const wrapper = renderSchema(schema, ["properties", "foo"]).queryByTestId("property-type");
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="_types_c734fe _muted_c734fe _text_c734fe"
        data-test="property-type"
      >
        any
      </span>
    `,
    );
  });

  it("should display false schemas", () => {
    const schema: JSONSchema7 = {
      type: "object",
      properties: {
        foo: false,
      },
    };

    const wrapper = renderSchema(schema, ["properties", "foo"]).queryByTestId("property-type");
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="_types_c734fe _muted_c734fe _text_c734fe"
        data-test="property-type"
      >
        never
      </span>
    `,
    );
  });

  describe("properties names", () => {
    it("given an object, should display the names of its properties", () => {
      const schema: JSONSchema4 = {
        properties: {
          foo: {
            type: "string",
          },
        },
      };

      const wrapper = renderSchema(schema, ["properties", "foo"]).queryByTestId("schema-row");
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          aria-label="Schema row"
          class="_row_9d8035"
          data-has-chevron="false"
          data-id="862ab7c3a6663"
          data-nested="false"
          data-test="schema-row"
          role="presentation"
        >
          <div
            class="_indicators_9d8035"
          />
          <div
            class="_content_9d8035"
            style="--nesting-level: 0; --root-level: 1;"
          >
            <div
              class="_header_9d8035"
            >
              <button
                class="_inline_9d8035"
                style="cursor: default;"
                type="button"
              >
                <span
                  class="_name_9d8035"
                  data-test="property-name-foo"
                >
                  foo
                </span>
                <span
                  class="_types_c734fe _muted_c734fe _text_c734fe"
                  data-test="property-type"
                >
                  string
                </span>
              </button>
              <span
                class="_properties_3455dc"
              />
            </div>
          </div>
        </div>
      `,
      );
    });

    it("given an object among other types, should still display its properties", () => {
      const schema: JSONSchema4 = {
        type: ["string", "object"],
        properties: {
          foo: {
            type: "array",
            items: {
              type: "integer",
            },
          },
        },
      };

      const wrapper = renderSchema(schema, ["properties", "foo"]).queryByTestId("schema-row");
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          aria-label="Schema row"
          class="_row_9d8035"
          data-has-chevron="false"
          data-id="862ab7c3a6663"
          data-nested="false"
          data-test="schema-row"
          role="presentation"
        >
          <div
            class="_indicators_9d8035"
          />
          <div
            class="_content_9d8035"
            style="--nesting-level: 0; --root-level: 1;"
          >
            <div
              class="_header_9d8035"
            >
              <button
                class="_inline_9d8035"
                style="cursor: default;"
                type="button"
              >
                <span
                  class="_name_9d8035"
                  data-test="property-name-foo"
                >
                  foo
                </span>
                <span
                  class="_types_c734fe _muted_c734fe _text_c734fe"
                  data-test="property-type"
                >
                  array[integer]
                </span>
              </button>
              <span
                class="_properties_3455dc"
              />
            </div>
          </div>
        </div>
      `,
      );
    });

    it("given an array of objects, should display names of those properties", () => {
      const schema: JSONSchema4 = {
        type: "array",
        items: {
          properties: {
            foo: {
              type: "string",
            },
          },
        },
      };

      const wrapper = renderSchema(schema, ["items", "properties", "foo"]).container.firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          aria-label="Schema row"
          class="_row_9d8035"
          data-has-chevron="false"
          data-id="862ab7c3a6663"
          data-nested="false"
          data-test="schema-row"
          role="presentation"
        >
          <div
            class="_indicators_9d8035"
          />
          <div
            class="_content_9d8035"
            style="--nesting-level: 0; --root-level: 1;"
          >
            <div
              class="_header_9d8035"
            >
              <button
                class="_inline_9d8035"
                style="cursor: default;"
                type="button"
              >
                <span
                  class="_name_9d8035"
                  data-test="property-name-foo"
                >
                  foo
                </span>
                <span
                  class="_types_c734fe _muted_c734fe _text_c734fe"
                  data-test="property-type"
                >
                  string
                </span>
              </button>
              <span
                class="_properties_3455dc"
              />
            </div>
          </div>
        </div>
      `,
      );
    });

    it("given an array with a combiner inside, should merge it", () => {
      const schema: JSONSchema4 = {
        type: "array",
        items: {
          oneOf: [
            {
              type: "string",
            },
            {
              type: "number",
            },
          ],
        },
      };

      const wrapper = renderSchema(schema).container.firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          aria-label="Schema row"
          class="_row_9d8035"
          data-has-chevron="false"
          data-id="bf8b96e78f11d"
          data-nested="false"
          data-test="schema-row"
          role="presentation"
        >
          <div
            class="_indicators_9d8035"
          />
          <div
            class="_content_9d8035"
            style="--nesting-level: 0; --root-level: 1;"
          >
            <div
              class="_header_9d8035"
            >
              <button
                class="_inline_9d8035"
                style="cursor: default;"
                type="button"
              >
                <select
                  aria-label="Pick a type"
                >
                  <option
                    value="0"
                  >
                    array (oneOf) [strings]
                  </option>
                  <option
                    value="1"
                  >
                    array (oneOf) [numbers]
                  </option>
                </select>
              </button>
              <span
                class="_properties_3455dc"
              />
            </div>
          </div>
        </div>
      `,
      );
    });

    it("given an array with a mergeable combiner inside, should merge it", () => {
      const schema: JSONSchema4 = {
        type: "array",
        items: {
          oneOf: [
            {
              properties: {
                foo: {},
                bar: {},
                baz: {},
              },
            },
          ],
          type: "object",
        },
      };

      const wrapper = renderSchema(schema).container.firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          aria-label="Schema row"
          class="_row_9d8035"
          data-has-chevron="true"
          data-id="bf8b96e78f11d"
          data-nested="false"
          data-test="schema-row"
          role="presentation"
        >
          <div
            class="_indicators_9d8035"
          />
          <div
            class="_content_9d8035"
            style="--nesting-level: 0; --root-level: 1;"
          >
            <div
              class="_header_9d8035"
            >
              <span
                aria-hidden="true"
                class="_caret_ab251d _expanded_ab251d"
                role="presentation"
              >
                <svg
                  aria-hidden="true"
                  class="_chevron_ab251d"
                  focusable="false"
                  viewBox="0 0 12 12"
                >
                  <path
                    d="M4 2.5 8 6l-4 3.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.6"
                  />
                </svg>
              </span>
              <button
                aria-expanded="true"
                class="_inline_9d8035"
                style="cursor: pointer;"
                type="button"
              >
                <span
                  class="_types_c734fe _muted_c734fe _text_c734fe"
                  data-test="property-type"
                >
                  array[object]
                </span>
              </button>
              <span
                class="_properties_3455dc"
              />
            </div>
          </div>
        </div>
      `,
      );
    });

    it("given an array with an allOf inside and enabled allOf merging, should display the name of properties", () => {
      const schema: JSONSchema4 = {
        type: "object",
        properties: {
          "array-all-objects": {
            type: "array",
            items: {
              allOf: [
                {
                  properties: {
                    foo: {
                      type: "string",
                    },
                  },
                },
                {
                  properties: {
                    bar: {
                      type: "string",
                    },
                  },
                },
              ],
              type: "object",
            },
          },
        },
      };

      let wrapper = renderSchema(schema, [
        "properties",
        "array-all-objects",
        "items",
        "properties",
        "foo",
      ]).container.firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          aria-label="Schema row"
          class="_row_9d8035"
          data-has-chevron="false"
          data-id="862ab7c3a6663"
          data-nested="false"
          data-test="schema-row"
          role="presentation"
        >
          <div
            class="_indicators_9d8035"
          />
          <div
            class="_content_9d8035"
            style="--nesting-level: 0; --root-level: 1;"
          >
            <div
              class="_header_9d8035"
            >
              <button
                class="_inline_9d8035"
                style="cursor: default;"
                type="button"
              >
                <span
                  class="_name_9d8035"
                  data-test="property-name-foo"
                >
                  foo
                </span>
                <span
                  class="_types_c734fe _muted_c734fe _text_c734fe"
                  data-test="property-type"
                >
                  string
                </span>
              </button>
              <span
                class="_properties_3455dc"
              />
            </div>
          </div>
        </div>
      `,
      );

      wrapper = renderSchema(schema, [
        "properties",
        "array-all-objects",
        "items",
        "properties",
        "bar",
      ]).container.firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          aria-label="Schema row"
          class="_row_9d8035"
          data-has-chevron="false"
          data-id="3cbab69efa81f"
          data-nested="false"
          data-test="schema-row"
          role="presentation"
        >
          <div
            class="_indicators_9d8035"
          />
          <div
            class="_content_9d8035"
            style="--nesting-level: 0; --root-level: 1;"
          >
            <div
              class="_header_9d8035"
            >
              <button
                class="_inline_9d8035"
                style="cursor: default;"
                type="button"
              >
                <span
                  class="_name_9d8035"
                  data-test="property-name-bar"
                >
                  bar
                </span>
                <span
                  class="_types_c734fe _muted_c734fe _text_c734fe"
                  data-test="property-type"
                >
                  string
                </span>
              </button>
              <span
                class="_properties_3455dc"
              />
            </div>
          </div>
        </div>
      `,
      );
    });

    it("given a ref pointing at complex type, should display property name", () => {
      const schema: JSONSchema4 = {
        properties: {
          foo: {
            $ref: "#/properties/bar",
          },
          bar: {
            type: "object",
          },
        },
      };

      const tree = buildTree(schema);

      const wrapper = render(
        <SchemaRow schemaNode={findNodeWithPath(tree, ["properties", "foo"])!} nestingLevel={0} />,
      ).container.firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          aria-label="Schema row"
          class="_row_9d8035"
          data-has-chevron="false"
          data-id="862ab7c3a6663"
          data-nested="false"
          data-test="schema-row"
          role="presentation"
        >
          <div
            class="_indicators_9d8035"
          />
          <div
            class="_content_9d8035"
            style="--nesting-level: 0; --root-level: 1;"
          >
            <div
              class="_header_9d8035"
            >
              <button
                class="_inline_9d8035"
                style="cursor: default;"
                type="button"
              >
                <span
                  class="_name_9d8035"
                  data-test="property-name-foo"
                >
                  foo
                </span>
                <span
                  class="_types_c734fe _muted_c734fe _text_c734fe"
                  data-test="property-type"
                >
                  object
                </span>
              </button>
              <span
                class="_properties_3455dc"
              />
            </div>
          </div>
        </div>
      `,
      );
    });
  });

  describe("properties titles", () => {
    it("given object type, should render title", () => {
      const schema: JSONSchema4 = {
        title: "User",
        type: "object",
        properties: {
          name: {
            type: "string",
          },
        },
      };

      const wrapper = renderSchema(schema).queryAllByTestId("property-type")[0];
      expect(wrapper).toMatchInlineSnapshot(
        `
        <span
          class="_types_c734fe _muted_c734fe _text_c734fe"
          data-test="property-type"
        >
          User
        </span>
      `,
      );
    });

    it("given array type with non-array items, should render title", () => {
      const schema: JSONSchema4 = {
        type: "array",
        items: {
          title: "User",
          type: "object",
          properties: {
            name: {
              type: "string",
            },
          },
        },
      };

      const wrapper = renderSchema(schema).queryAllByTestId("property-type")[0];
      expect(wrapper).toMatchInlineSnapshot(
        `
        <span
          class="_types_c734fe _muted_c734fe _text_c734fe"
          data-test="property-type"
        >
          array[User]
        </span>
      `,
      );
    });

    it("given array with no items, should render title", () => {
      const schema: JSONSchema4 = {
        type: "array",
        title: "User",
      };

      const wrapper = renderSchema(schema).queryByTestId("property-type");
      expect(wrapper).toMatchInlineSnapshot(
        `
        <span
          class="_types_c734fe _muted_c734fe _text_c734fe"
          data-test="property-type"
        >
          User
        </span>
      `,
      );
    });

    it("given array with defined items, should not render title", () => {
      const schema: JSONSchema4 = {
        type: "array",
        items: [
          {
            title: "foo",
            type: "string",
          },
          {
            title: "bar",
            type: "number",
          },
        ],
      };

      const wrapper = renderSchema(schema).queryAllByTestId("property-type")[0];
      expect(wrapper).toMatchInlineSnapshot(
        `
        <span
          class="_types_c734fe _muted_c734fe _text_c734fe"
          data-test="property-type"
        >
          array
        </span>
      `,
      );
    });
  });

  describe("format", () => {
    const schema: JSONSchema4 = require("../../../__fixtures__/formats-schema.json");

    it("should render next to a single type", () => {
      const wrapper = renderSchema(schema, ["properties", "id"]).queryByText("number<float>");
      expect(wrapper).toBeInTheDocument();
    });

    it.each`
      property               | text
      ${"count"}             | ${"integer<int32> or null"}
      ${"date-of-birth"}     | ${"number or string<date-time> or array"}
      ${"array-of-integers"} | ${"array[integer<int32>]"}
      ${"map-of-ids"}        | ${"dictionary[string, integer<int32>]"}
      ${"size"}              | ${"number<byte> or string"}
    `(
      "given $property property, should render next to the appropriate type $text",
      ({ property }) => {
        const wrapper = renderSchema(schema, ["properties", property]).container.firstChild;
        expect(wrapper).toMatchSnapshot();
      },
    );

    it("should render even when the type(s) is/are missing", () => {
      const wrapper = renderSchema(schema, ["properties", "notype"]).queryByText("<date-time>");
      expect(wrapper).toBeInTheDocument();
    });
  });
});
