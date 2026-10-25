import { render } from "@testing-library/react";
import type { JSONSchema4, JSONSchema7 } from "json-schema";
import * as React from "react";
import { beforeEach, describe, expect, it } from "vite-plus/test";

import { JsonSchemaViewer } from "../components";
import { ViewMode } from "../types";

describe("HTML Output", () => {
  describe.each(["anyOf", "oneOf"])("given %s combiner placed next to allOf", (combiner) => {
    let schema: JSONSchema4;

    beforeEach(() => {
      schema = {
        type: "object",
        title: "Account",
        allOf: [
          {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["admin", "editor"],
              },
              enabled: {
                type: "boolean",
                description: "Is this account enabled",
              },
            },
            required: ["type"],
          },
        ],
        [combiner]: [
          {
            type: "object",
            title: "Admin",
            properties: {
              root: {
                type: "boolean",
              },
              group: {
                type: "string",
              },
              expirationDate: {
                type: "string",
              },
            },
          },
          {
            type: "object",
            title: "Editor",
            properties: {
              supervisor: {
                type: "string",
              },
              key: {
                type: "string",
              },
            },
          },
        ],
      };
    });

    it("given allOf merging enabled, should merge contents of allOf combiners", () => {
      expect(
        render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container
          .firstChild,
      ).toMatchSnapshot();
    });
  });

  it("given array with oneOf containing items, should merge it correctly", () => {
    const schema: JSONSchema4 = {
      oneOf: [
        {
          items: {
            type: "string",
          },
        },
        {
          items: {
            type: "number",
          },
        },
      ],
      type: "array",
    };

    expect(
      render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container
        .firstChild,
    ).toMatchSnapshot();
  });

  it.each<ViewMode>(["standalone", "read", "write"])(
    "given %s mode, should populate proper nodes",
    (mode) => {
      const schema: JSONSchema4 = {
        type: ["string", "object"],
        properties: {
          id: {
            type: "string",
            readOnly: true,
          },
          description: {
            type: "string",
            writeOnly: true,
          },
        },
      };

      expect(
        render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} viewMode={mode} />)
          .container.firstChild,
      ).toMatchSnapshot();
    },
  );

  it("given multiple object and string type, should process properties", () => {
    const schema: JSONSchema4 = {
      type: ["string", "object"],
      properties: {
        ids: {
          type: "array",
          items: {
            type: "integer",
          },
        },
      },
    };

    expect(
      render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container
        .firstChild,
    ).toMatchSnapshot();
  });

  it("given complex type that includes array and complex array subtype, should not ignore subtype", () => {
    const schema: JSONSchema4 = {
      type: "object",
      properties: {
        items: {
          type: ["null", "array"],
          items: {
            type: ["string", "number"],
          },
          description:
            "This description can be long and should truncate once it reaches the end of the row. If it's not truncating then theres and issue that needs to be fixed. Help!",
        },
      },
    };

    expect(
      render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container
        .firstChild,
    ).toMatchSnapshot();
  });

  it("given visible $ref node, should try to inject the title immediately", () => {
    const schema: JSONSchema4 = {
      type: "object",
      properties: {
        foo: {
          $ref: "#/properties/user",
        },
        user: {
          title: "User",
          type: "object",
          properties: {
            name: {
              type: "string",
            },
          },
        },
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} />).container.firstChild).toMatchSnapshot();
  });

  it("given dictionary with defined properties, should not render them", () => {
    const schema: JSONSchema7 = {
      type: ["object", "null"],
      properties: {
        id: {
          type: "string",
          readOnly: true,
        },
        description: {
          type: "string",
          writeOnly: true,
        },
      },
      additionalProperties: {
        type: "string",
      },
    };

    expect(
      render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container
        .firstChild,
    ).toMatchInlineSnapshot(`
      <div
        aria-label="JSON schema viewer"
        class="_viewer_e7b391 json-schema-viewer"
        role="region"
        tabindex="0"
      >
        <div
          class="_container_e31247"
        >
          <div />
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
                  <span
                    class="_types_c734fe"
                  >
                    <span
                      class="_types_c734fe _muted_c734fe _text_c734fe"
                      data-test="property-type"
                    >
                      dictionary[string, string]
                    </span>
                    <span
                      class="_muted_c734fe"
                    >
                       or 
                    </span>
                    <span
                      class="_types_c734fe _muted_c734fe _text_c734fe"
                      data-test="property-type"
                    >
                      null
                    </span>
                  </span>
                </button>
                <span
                  class="_properties_3455dc"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  });

  it("should render top-level dictionary", () => {
    const schema: JSONSchema7 = {
      type: "object",
      additionalProperties: {
        type: "string",
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />))
      .toMatchInlineSnapshot(`
        {
          "asFragment": [Function],
          "baseElement": <body>
            <div>
              <div
                aria-label="JSON schema viewer"
                class="_viewer_e7b391 json-schema-viewer"
                role="region"
                tabindex="0"
              >
                <div
                  class="_container_e31247"
                >
                  <div />
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
                          <span
                            class="_types_c734fe _muted_c734fe _text_c734fe"
                            data-test="property-type"
                          >
                            dictionary[string, string]
                          </span>
                        </button>
                        <span
                          class="_properties_3455dc"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </body>,
          "container": <div>
            <div
              aria-label="JSON schema viewer"
              class="_viewer_e7b391 json-schema-viewer"
              role="region"
              tabindex="0"
            >
              <div
                class="_container_e31247"
              >
                <div />
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
                        <span
                          class="_types_c734fe _muted_c734fe _text_c734fe"
                          data-test="property-type"
                        >
                          dictionary[string, string]
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          "debug": [Function],
          "findAllByAltText": [Function],
          "findAllByDisplayValue": [Function],
          "findAllByLabelText": [Function],
          "findAllByPlaceholderText": [Function],
          "findAllByRole": [Function],
          "findAllByTestId": [Function],
          "findAllByText": [Function],
          "findAllByTitle": [Function],
          "findByAltText": [Function],
          "findByDisplayValue": [Function],
          "findByLabelText": [Function],
          "findByPlaceholderText": [Function],
          "findByRole": [Function],
          "findByTestId": [Function],
          "findByText": [Function],
          "findByTitle": [Function],
          "getAllByAltText": [Function],
          "getAllByDisplayValue": [Function],
          "getAllByLabelText": [Function],
          "getAllByPlaceholderText": [Function],
          "getAllByRole": [Function],
          "getAllByTestId": [Function],
          "getAllByText": [Function],
          "getAllByTitle": [Function],
          "getByAltText": [Function],
          "getByDisplayValue": [Function],
          "getByLabelText": [Function],
          "getByPlaceholderText": [Function],
          "getByRole": [Function],
          "getByTestId": [Function],
          "getByText": [Function],
          "getByTitle": [Function],
          "queryAllByAltText": [Function],
          "queryAllByDisplayValue": [Function],
          "queryAllByLabelText": [Function],
          "queryAllByPlaceholderText": [Function],
          "queryAllByRole": [Function],
          "queryAllByTestId": [Function],
          "queryAllByText": [Function],
          "queryAllByTitle": [Function],
          "queryByAltText": [Function],
          "queryByDisplayValue": [Function],
          "queryByLabelText": [Function],
          "queryByPlaceholderText": [Function],
          "queryByRole": [Function],
          "queryByTestId": [Function],
          "queryByText": [Function],
          "queryByTitle": [Function],
          "rerender": [Function],
          "unmount": [Function],
        }
      `);
  });

  it("should not merge array of dictionaries", () => {
    const schema: JSONSchema7 = {
      type: "array",
      items: {
        type: "object",
        additionalProperties: {
          type: "string",
        },
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />))
      .toMatchInlineSnapshot(`
        {
          "asFragment": [Function],
          "baseElement": <body>
            <div>
              <div
                aria-label="JSON schema viewer"
                class="_viewer_e7b391 json-schema-viewer"
                role="region"
                tabindex="0"
              >
                <div
                  class="_container_e31247"
                >
                  <div />
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
                            array
                          </span>
                        </button>
                        <span
                          class="_properties_3455dc"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    class="_stack_577e6e _root_577e6e "
                    data-level="0"
                    style="--parent-nesting-level: 0; --root-level: 1;"
                  >
                    <div
                      aria-label="Schema row"
                      class="_row_9d8035"
                      data-has-chevron="false"
                      data-id="98538b996305d"
                      data-nested="false"
                      data-test="schema-row"
                      role="presentation"
                    >
                      <div
                        class="_indicators_9d8035"
                      />
                      <div
                        class="_content_9d8035"
                        style="--nesting-level: 1; --root-level: 1;"
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
                              class="_types_c734fe _muted_c734fe _text_c734fe"
                              data-test="property-type"
                            >
                              dictionary[string, string]
                            </span>
                          </button>
                          <span
                            class="_properties_3455dc"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </body>,
          "container": <div>
            <div
              aria-label="JSON schema viewer"
              class="_viewer_e7b391 json-schema-viewer"
              role="region"
              tabindex="0"
            >
              <div
                class="_container_e31247"
              >
                <div />
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
                          array
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
                <div
                  class="_stack_577e6e _root_577e6e "
                  data-level="0"
                  style="--parent-nesting-level: 0; --root-level: 1;"
                >
                  <div
                    aria-label="Schema row"
                    class="_row_9d8035"
                    data-has-chevron="false"
                    data-id="98538b996305d"
                    data-nested="false"
                    data-test="schema-row"
                    role="presentation"
                  >
                    <div
                      class="_indicators_9d8035"
                    />
                    <div
                      class="_content_9d8035"
                      style="--nesting-level: 1; --root-level: 1;"
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
                            class="_types_c734fe _muted_c734fe _text_c734fe"
                            data-test="property-type"
                          >
                            dictionary[string, string]
                          </span>
                        </button>
                        <span
                          class="_properties_3455dc"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          "debug": [Function],
          "findAllByAltText": [Function],
          "findAllByDisplayValue": [Function],
          "findAllByLabelText": [Function],
          "findAllByPlaceholderText": [Function],
          "findAllByRole": [Function],
          "findAllByTestId": [Function],
          "findAllByText": [Function],
          "findAllByTitle": [Function],
          "findByAltText": [Function],
          "findByDisplayValue": [Function],
          "findByLabelText": [Function],
          "findByPlaceholderText": [Function],
          "findByRole": [Function],
          "findByTestId": [Function],
          "findByText": [Function],
          "findByTitle": [Function],
          "getAllByAltText": [Function],
          "getAllByDisplayValue": [Function],
          "getAllByLabelText": [Function],
          "getAllByPlaceholderText": [Function],
          "getAllByRole": [Function],
          "getAllByTestId": [Function],
          "getAllByText": [Function],
          "getAllByTitle": [Function],
          "getByAltText": [Function],
          "getByDisplayValue": [Function],
          "getByLabelText": [Function],
          "getByPlaceholderText": [Function],
          "getByRole": [Function],
          "getByTestId": [Function],
          "getByText": [Function],
          "getByTitle": [Function],
          "queryAllByAltText": [Function],
          "queryAllByDisplayValue": [Function],
          "queryAllByLabelText": [Function],
          "queryAllByPlaceholderText": [Function],
          "queryAllByRole": [Function],
          "queryAllByTestId": [Function],
          "queryAllByText": [Function],
          "queryAllByTitle": [Function],
          "queryByAltText": [Function],
          "queryByDisplayValue": [Function],
          "queryByLabelText": [Function],
          "queryByPlaceholderText": [Function],
          "queryByRole": [Function],
          "queryByTestId": [Function],
          "queryByText": [Function],
          "queryByTitle": [Function],
          "rerender": [Function],
          "unmount": [Function],
        }
      `);
  });

  it("should merge dictionaries with array values", () => {
    const schema: JSONSchema7 = {
      type: "object",
      additionalProperties: {
        type: "array",
        items: {
          type: "string",
        },
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />))
      .toMatchInlineSnapshot(`
        {
          "asFragment": [Function],
          "baseElement": <body>
            <div>
              <div
                aria-label="JSON schema viewer"
                class="_viewer_e7b391 json-schema-viewer"
                role="region"
                tabindex="0"
              >
                <div
                  class="_container_e31247"
                >
                  <div />
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
                            dictionary[string, array]
                          </span>
                        </button>
                        <span
                          class="_properties_3455dc"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    class="_stack_577e6e _root_577e6e "
                    data-level="0"
                    style="--parent-nesting-level: 0; --root-level: 1;"
                  >
                    <div
                      aria-label="Schema row"
                      class="_row_9d8035"
                      data-has-chevron="false"
                      data-id="98538b996305d"
                      data-nested="false"
                      data-test="schema-row"
                      role="presentation"
                    >
                      <div
                        class="_indicators_9d8035"
                      />
                      <div
                        class="_content_9d8035"
                        style="--nesting-level: 1; --root-level: 1;"
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
                  </div>
                </div>
              </div>
            </div>
          </body>,
          "container": <div>
            <div
              aria-label="JSON schema viewer"
              class="_viewer_e7b391 json-schema-viewer"
              role="region"
              tabindex="0"
            >
              <div
                class="_container_e31247"
              >
                <div />
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
                          dictionary[string, array]
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
                <div
                  class="_stack_577e6e _root_577e6e "
                  data-level="0"
                  style="--parent-nesting-level: 0; --root-level: 1;"
                >
                  <div
                    aria-label="Schema row"
                    class="_row_9d8035"
                    data-has-chevron="false"
                    data-id="98538b996305d"
                    data-nested="false"
                    data-test="schema-row"
                    role="presentation"
                  >
                    <div
                      class="_indicators_9d8035"
                    />
                    <div
                      class="_content_9d8035"
                      style="--nesting-level: 1; --root-level: 1;"
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
                </div>
              </div>
            </div>
          </div>,
          "debug": [Function],
          "findAllByAltText": [Function],
          "findAllByDisplayValue": [Function],
          "findAllByLabelText": [Function],
          "findAllByPlaceholderText": [Function],
          "findAllByRole": [Function],
          "findAllByTestId": [Function],
          "findAllByText": [Function],
          "findAllByTitle": [Function],
          "findByAltText": [Function],
          "findByDisplayValue": [Function],
          "findByLabelText": [Function],
          "findByPlaceholderText": [Function],
          "findByRole": [Function],
          "findByTestId": [Function],
          "findByText": [Function],
          "findByTitle": [Function],
          "getAllByAltText": [Function],
          "getAllByDisplayValue": [Function],
          "getAllByLabelText": [Function],
          "getAllByPlaceholderText": [Function],
          "getAllByRole": [Function],
          "getAllByTestId": [Function],
          "getAllByText": [Function],
          "getAllByTitle": [Function],
          "getByAltText": [Function],
          "getByDisplayValue": [Function],
          "getByLabelText": [Function],
          "getByPlaceholderText": [Function],
          "getByRole": [Function],
          "getByTestId": [Function],
          "getByText": [Function],
          "getByTitle": [Function],
          "queryAllByAltText": [Function],
          "queryAllByDisplayValue": [Function],
          "queryAllByLabelText": [Function],
          "queryAllByPlaceholderText": [Function],
          "queryAllByRole": [Function],
          "queryAllByTestId": [Function],
          "queryAllByText": [Function],
          "queryAllByTitle": [Function],
          "queryByAltText": [Function],
          "queryByDisplayValue": [Function],
          "queryByLabelText": [Function],
          "queryByPlaceholderText": [Function],
          "queryByRole": [Function],
          "queryByTestId": [Function],
          "queryByText": [Function],
          "queryByTitle": [Function],
          "rerender": [Function],
          "unmount": [Function],
        }
      `);
  });

  it("should not render true/false additionalProperties", () => {
    const schema: JSONSchema7 = {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      additionalProperties: true,
    };

    const additionalTrue = render(
      <JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />,
    );
    const additionalFalse = render(
      <JsonSchemaViewer
        schema={{ ...schema, additionalProperties: false }}
        defaultExpandedDepth={Infinity}
      />,
    );
    expect(additionalTrue.container.firstChild).toEqual(additionalFalse.container.firstChild);
    expect(additionalTrue.container.firstChild).toMatchInlineSnapshot(`
      <div
        aria-label="JSON schema viewer"
        class="_viewer_e7b391 json-schema-viewer"
        role="region"
        tabindex="0"
      >
        <div
          class="_container_e31247"
        >
          <div />
          <div
            class="_stack_577e6e _root_577e6e "
            data-level="0"
            style="--parent-nesting-level: 0; --root-level: 1;"
          >
            <div
              aria-label="Schema row"
              class="_row_9d8035"
              data-has-chevron="false"
              data-id="8074f410d9775"
              data-nested="false"
              data-test="schema-row"
              role="presentation"
            >
              <div
                class="_indicators_9d8035"
              />
              <div
                class="_content_9d8035"
                style="--nesting-level: 1; --root-level: 1;"
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
                      data-test="property-name-id"
                    >
                      id
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
          </div>
        </div>
      </div>
    `);
  });

  it("should not render additionalItems", () => {
    const schema: JSONSchema7 = {
      type: "array",
      additionalItems: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
        },
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />))
      .toMatchInlineSnapshot(`
        {
          "asFragment": [Function],
          "baseElement": <body>
            <div>
              <div
                aria-label="JSON schema viewer"
                class="_viewer_e7b391 json-schema-viewer"
                role="region"
                tabindex="0"
              >
                <div
                  class="_container_e31247"
                >
                  <div />
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
                          <span
                            class="_types_c734fe _muted_c734fe _text_c734fe"
                            data-test="property-type"
                          >
                            array
                          </span>
                        </button>
                        <span
                          class="_properties_3455dc"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </body>,
          "container": <div>
            <div
              aria-label="JSON schema viewer"
              class="_viewer_e7b391 json-schema-viewer"
              role="region"
              tabindex="0"
            >
              <div
                class="_container_e31247"
              >
                <div />
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
                        <span
                          class="_types_c734fe _muted_c734fe _text_c734fe"
                          data-test="property-type"
                        >
                          array
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          "debug": [Function],
          "findAllByAltText": [Function],
          "findAllByDisplayValue": [Function],
          "findAllByLabelText": [Function],
          "findAllByPlaceholderText": [Function],
          "findAllByRole": [Function],
          "findAllByTestId": [Function],
          "findAllByText": [Function],
          "findAllByTitle": [Function],
          "findByAltText": [Function],
          "findByDisplayValue": [Function],
          "findByLabelText": [Function],
          "findByPlaceholderText": [Function],
          "findByRole": [Function],
          "findByTestId": [Function],
          "findByText": [Function],
          "findByTitle": [Function],
          "getAllByAltText": [Function],
          "getAllByDisplayValue": [Function],
          "getAllByLabelText": [Function],
          "getAllByPlaceholderText": [Function],
          "getAllByRole": [Function],
          "getAllByTestId": [Function],
          "getAllByText": [Function],
          "getAllByTitle": [Function],
          "getByAltText": [Function],
          "getByDisplayValue": [Function],
          "getByLabelText": [Function],
          "getByPlaceholderText": [Function],
          "getByRole": [Function],
          "getByTestId": [Function],
          "getByText": [Function],
          "getByTitle": [Function],
          "queryAllByAltText": [Function],
          "queryAllByDisplayValue": [Function],
          "queryAllByLabelText": [Function],
          "queryAllByPlaceholderText": [Function],
          "queryAllByRole": [Function],
          "queryAllByTestId": [Function],
          "queryAllByText": [Function],
          "queryAllByTitle": [Function],
          "queryByAltText": [Function],
          "queryByDisplayValue": [Function],
          "queryByLabelText": [Function],
          "queryByPlaceholderText": [Function],
          "queryByRole": [Function],
          "queryByTestId": [Function],
          "queryByText": [Function],
          "queryByTitle": [Function],
          "rerender": [Function],
          "unmount": [Function],
        }
      `);
  });

  describe("top level descriptions", () => {
    const schema: JSONSchema4 = {
      description: "This is a description that should be rendered",
      allOf: [
        {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
          },
        },
        {
          type: "object",
          properties: {
            baz: {
              type: "string",
            },
          },
        },
      ],
    };

    it("should render top-level description on allOf", () => {
      expect(
        render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container
          .firstChild,
      ).toMatchSnapshot();
    });

    it("should not render top-level description when skipTopLevelDescription=true", () => {
      expect(
        render(
          <JsonSchemaViewer
            schema={schema}
            defaultExpandedDepth={Infinity}
            skipTopLevelDescription
          />,
        ).container.firstChild,
      ).toMatchSnapshot();
    });
  });
});

describe.each([{}, { unknown: "" }, { $ref: null }])("given empty schema: %o", (schema) => {
  it("should render empty text", () => {
    const wrapper = render(<JsonSchemaViewer schema={schema as any} />);
    const emptyText = wrapper.queryAllByTestId("empty-text");
    expect(emptyText[0]).toBeInTheDocument();
  });
});

describe("Expanded depth", () => {
  describe("merged array with object", () => {
    let schema: JSONSchema4;

    beforeEach(() => {
      schema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            foo: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  bar: {
                    type: "object",
                    properties: {
                      baz: {
                        type: "integer",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
    });

    describe("static", () => {
      it("given initial level set to -1, should render only top-level property", () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={-1} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            aria-label="JSON schema viewer"
            class="_viewer_e7b391 json-schema-viewer"
            role="region"
            tabindex="0"
          >
            <div
              class="_container_e31247"
            >
              <div />
              <div
                class="_arrayHeader_e31247"
              >
                <div
                  class="_arrayLabel_e31247"
                >
                  array of:
                </div>
              </div>
              <div
                class="_stack_577e6e _root_577e6e "
                data-level="0"
                style="--parent-nesting-level: 0; --root-level: 1;"
              >
                <div
                  aria-label="Schema row"
                  class="_row_9d8035"
                  data-has-chevron="true"
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
                    style="--nesting-level: 1; --root-level: 1;"
                  >
                    <div
                      class="_header_9d8035"
                    >
                      <span
                        aria-hidden="true"
                        class="_caret_ab251d "
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
                        aria-expanded="false"
                        class="_inline_9d8035"
                        style="cursor: pointer;"
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
                          array[object]
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      it("given initial level set to 0, should render top 2 levels", () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={0} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            aria-label="JSON schema viewer"
            class="_viewer_e7b391 json-schema-viewer"
            role="region"
            tabindex="0"
          >
            <div
              class="_container_e31247"
            >
              <div />
              <div
                class="_arrayHeader_e31247"
              >
                <div
                  class="_arrayLabel_e31247"
                >
                  array of:
                </div>
              </div>
              <div
                class="_stack_577e6e _root_577e6e "
                data-level="0"
                style="--parent-nesting-level: 0; --root-level: 1;"
              >
                <div
                  aria-label="Schema row"
                  class="_row_9d8035"
                  data-has-chevron="true"
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
                    style="--nesting-level: 1; --root-level: 1;"
                  >
                    <div
                      class="_header_9d8035"
                    >
                      <span
                        aria-hidden="true"
                        class="_caret_ab251d "
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
                        aria-expanded="false"
                        class="_inline_9d8035"
                        style="cursor: pointer;"
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
                          array[object]
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      it("given initial level set to 1, should render top 3 levels", () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={1} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            aria-label="JSON schema viewer"
            class="_viewer_e7b391 json-schema-viewer"
            role="region"
            tabindex="0"
          >
            <div
              class="_container_e31247"
            >
              <div />
              <div
                class="_arrayHeader_e31247"
              >
                <div
                  class="_arrayLabel_e31247"
                >
                  array of:
                </div>
              </div>
              <div
                class="_stack_577e6e _root_577e6e "
                data-level="0"
                style="--parent-nesting-level: 0; --root-level: 1;"
              >
                <div
                  aria-label="Schema row"
                  class="_row_9d8035"
                  data-has-chevron="true"
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
                    style="--nesting-level: 1; --root-level: 1;"
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
                          class="_name_9d8035"
                          data-test="property-name-foo"
                        >
                          foo
                        </span>
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
                <div
                  class="_stack_577e6e  "
                  data-level="1"
                  style="--parent-nesting-level: 1; --root-level: 1;"
                >
                  <div
                    aria-label="Schema row"
                    class="_row_9d8035"
                    data-has-chevron="true"
                    data-id="f1c21cde4de6f"
                    data-nested="true"
                    data-test="schema-row"
                    role="presentation"
                  >
                    <div
                      class="_indicators_9d8035"
                    />
                    <div
                      class="_content_9d8035"
                      style="--nesting-level: 2; --root-level: 1;"
                    >
                      <div
                        class="_header_9d8035"
                      >
                        <span
                          aria-hidden="true"
                          class="_caret_ab251d "
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
                          aria-expanded="false"
                          class="_inline_9d8035"
                          style="cursor: pointer;"
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
                            object
                          </span>
                        </button>
                        <span
                          class="_properties_3455dc"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });
    });
  });

  describe("merged array with object #2", () => {
    let schema: JSONSchema4;

    beforeEach(() => {
      schema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            bar: {
              type: "integer",
            },
            foo: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  bar: {
                    type: "string",
                  },
                  foo: {
                    type: "number",
                  },
                },
              },
            },
          },
        },
      };
    });

    describe("static", () => {
      it("given initial level set to -1, should render only top-level property", () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={-1} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            aria-label="JSON schema viewer"
            class="_viewer_e7b391 json-schema-viewer"
            role="region"
            tabindex="0"
          >
            <div
              class="_container_e31247"
            >
              <div />
              <div
                class="_arrayHeader_e31247"
              >
                <div
                  class="_arrayLabel_e31247"
                >
                  array of:
                </div>
              </div>
              <div
                class="_stack_577e6e _root_577e6e "
                data-level="0"
                style="--parent-nesting-level: 0; --root-level: 1;"
              >
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
                    style="--nesting-level: 1; --root-level: 1;"
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
                          integer
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
                <div
                  aria-label="Schema row"
                  class="_row_9d8035"
                  data-has-chevron="true"
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
                    style="--nesting-level: 1; --root-level: 1;"
                  >
                    <div
                      class="_header_9d8035"
                    >
                      <span
                        aria-hidden="true"
                        class="_caret_ab251d "
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
                        aria-expanded="false"
                        class="_inline_9d8035"
                        style="cursor: pointer;"
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
                          array[object]
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      it("given initial level set to 0, should render top 2 levels", () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={0} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            aria-label="JSON schema viewer"
            class="_viewer_e7b391 json-schema-viewer"
            role="region"
            tabindex="0"
          >
            <div
              class="_container_e31247"
            >
              <div />
              <div
                class="_arrayHeader_e31247"
              >
                <div
                  class="_arrayLabel_e31247"
                >
                  array of:
                </div>
              </div>
              <div
                class="_stack_577e6e _root_577e6e "
                data-level="0"
                style="--parent-nesting-level: 0; --root-level: 1;"
              >
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
                    style="--nesting-level: 1; --root-level: 1;"
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
                          integer
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
                <div
                  aria-label="Schema row"
                  class="_row_9d8035"
                  data-has-chevron="true"
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
                    style="--nesting-level: 1; --root-level: 1;"
                  >
                    <div
                      class="_header_9d8035"
                    >
                      <span
                        aria-hidden="true"
                        class="_caret_ab251d "
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
                        aria-expanded="false"
                        class="_inline_9d8035"
                        style="cursor: pointer;"
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
                          array[object]
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      it("given initial level set to 1, should render top 3 levels", () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={1} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            aria-label="JSON schema viewer"
            class="_viewer_e7b391 json-schema-viewer"
            role="region"
            tabindex="0"
          >
            <div
              class="_container_e31247"
            >
              <div />
              <div
                class="_arrayHeader_e31247"
              >
                <div
                  class="_arrayLabel_e31247"
                >
                  array of:
                </div>
              </div>
              <div
                class="_stack_577e6e _root_577e6e "
                data-level="0"
                style="--parent-nesting-level: 0; --root-level: 1;"
              >
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
                    style="--nesting-level: 1; --root-level: 1;"
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
                          integer
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
                <div
                  aria-label="Schema row"
                  class="_row_9d8035"
                  data-has-chevron="true"
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
                    style="--nesting-level: 1; --root-level: 1;"
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
                          class="_name_9d8035"
                          data-test="property-name-foo"
                        >
                          foo
                        </span>
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
                <div
                  class="_stack_577e6e  "
                  data-level="1"
                  style="--parent-nesting-level: 1; --root-level: 1;"
                >
                  <div
                    aria-label="Schema row"
                    class="_row_9d8035"
                    data-has-chevron="false"
                    data-id="f1c21cde4de6f"
                    data-nested="true"
                    data-test="schema-row"
                    role="presentation"
                  >
                    <div
                      class="_indicators_9d8035"
                    />
                    <div
                      class="_content_9d8035"
                      style="--nesting-level: 2; --root-level: 1;"
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
                  <div
                    aria-label="Schema row"
                    class="_row_9d8035"
                    data-has-chevron="false"
                    data-id="c6321b8d80105"
                    data-nested="true"
                    data-test="schema-row"
                    role="presentation"
                  >
                    <div
                      class="_indicators_9d8035"
                    />
                    <div
                      class="_content_9d8035"
                      style="--nesting-level: 2; --root-level: 1;"
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
                            number
                          </span>
                        </button>
                        <span
                          class="_properties_3455dc"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });
    });
  });

  describe("nested object", () => {
    let schema: JSONSchema4;

    beforeEach(() => {
      schema = {
        type: "object",
        properties: {
          bar: {
            type: "object",
            properties: {
              barFoo: {
                type: "object",
                properties: {
                  barFooBar: {
                    type: "object",
                  },
                },
              },
              barBar: {
                type: "string",
              },
              barBaz: {
                type: "boolean",
              },
            },
          },
          foo: {
            type: "array",
            items: {
              type: "object",
              properties: {
                fooBar: {
                  type: "string",
                },
                fooFoo: {
                  type: "number",
                },
              },
            },
          },
        },
      };
    });

    describe("static", () => {
      it("given initial level set to -1, should render only top-level property", () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={-1} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            aria-label="JSON schema viewer"
            class="_viewer_e7b391 json-schema-viewer"
            role="region"
            tabindex="0"
          >
            <div
              class="_container_e31247"
            >
              <div />
              <div
                class="_stack_577e6e _root_577e6e "
                data-level="0"
                style="--parent-nesting-level: 0; --root-level: 1;"
              >
                <div
                  aria-label="Schema row"
                  class="_row_9d8035"
                  data-has-chevron="true"
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
                    style="--nesting-level: 1; --root-level: 1;"
                  >
                    <div
                      class="_header_9d8035"
                    >
                      <span
                        aria-hidden="true"
                        class="_caret_ab251d "
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
                        aria-expanded="false"
                        class="_inline_9d8035"
                        style="cursor: pointer;"
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
                          object
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
                <div
                  aria-label="Schema row"
                  class="_row_9d8035"
                  data-has-chevron="true"
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
                    style="--nesting-level: 1; --root-level: 1;"
                  >
                    <div
                      class="_header_9d8035"
                    >
                      <span
                        aria-hidden="true"
                        class="_caret_ab251d "
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
                        aria-expanded="false"
                        class="_inline_9d8035"
                        style="cursor: pointer;"
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
                          array[object]
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      it("given initial level set to 0, should render top 2 levels", () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={0} />);

        expect(wrapper.container.firstChild).toMatchSnapshot();
      });

      it("given initial level set to 1, should render top 3 levels", () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={1} />);

        expect(wrapper.container.firstChild).toMatchSnapshot();
      });

      it("given initial level set to 2, should render top 4 levels", () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={2} />);

        expect(wrapper.container.firstChild).toMatchSnapshot();
      });
    });
  });
});

describe("$ref resolving", () => {
  it("should render caret for schema with top-level $ref pointing at complex type", () => {
    const schema: JSONSchema4 = {
      $ref: "#/definitions/foo",
      definitions: {
        foo: {
          type: "string",
        },
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} />)).toMatchInlineSnapshot(`
      {
        "asFragment": [Function],
        "baseElement": <body>
          <div>
            <div
              aria-label="JSON schema viewer"
              class="_viewer_e7b391 json-schema-viewer"
              role="region"
              tabindex="0"
            >
              <div
                class="_container_e31247"
              >
                <div />
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
              </div>
            </div>
          </div>
        </body>,
        "container": <div>
          <div
            aria-label="JSON schema viewer"
            class="_viewer_e7b391 json-schema-viewer"
            role="region"
            tabindex="0"
          >
            <div
              class="_container_e31247"
            >
              <div />
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
            </div>
          </div>
        </div>,
        "debug": [Function],
        "findAllByAltText": [Function],
        "findAllByDisplayValue": [Function],
        "findAllByLabelText": [Function],
        "findAllByPlaceholderText": [Function],
        "findAllByRole": [Function],
        "findAllByTestId": [Function],
        "findAllByText": [Function],
        "findAllByTitle": [Function],
        "findByAltText": [Function],
        "findByDisplayValue": [Function],
        "findByLabelText": [Function],
        "findByPlaceholderText": [Function],
        "findByRole": [Function],
        "findByTestId": [Function],
        "findByText": [Function],
        "findByTitle": [Function],
        "getAllByAltText": [Function],
        "getAllByDisplayValue": [Function],
        "getAllByLabelText": [Function],
        "getAllByPlaceholderText": [Function],
        "getAllByRole": [Function],
        "getAllByTestId": [Function],
        "getAllByText": [Function],
        "getAllByTitle": [Function],
        "getByAltText": [Function],
        "getByDisplayValue": [Function],
        "getByLabelText": [Function],
        "getByPlaceholderText": [Function],
        "getByRole": [Function],
        "getByTestId": [Function],
        "getByText": [Function],
        "getByTitle": [Function],
        "queryAllByAltText": [Function],
        "queryAllByDisplayValue": [Function],
        "queryAllByLabelText": [Function],
        "queryAllByPlaceholderText": [Function],
        "queryAllByRole": [Function],
        "queryAllByTestId": [Function],
        "queryAllByText": [Function],
        "queryAllByTitle": [Function],
        "queryByAltText": [Function],
        "queryByDisplayValue": [Function],
        "queryByLabelText": [Function],
        "queryByPlaceholderText": [Function],
        "queryByRole": [Function],
        "queryByTestId": [Function],
        "queryByText": [Function],
        "queryByTitle": [Function],
        "rerender": [Function],
        "unmount": [Function],
      }
    `);
  });

  it("should render caret for top-level array with $ref items", () => {
    const schema: JSONSchema4 = {
      type: "array",
      items: {
        $ref: "#/foo",
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} />)).toMatchInlineSnapshot(`
      {
        "asFragment": [Function],
        "baseElement": <body>
          <div>
            <div
              aria-label="JSON schema viewer"
              class="_viewer_e7b391 json-schema-viewer"
              role="region"
              tabindex="0"
            >
              <div
                class="_container_e31247"
              >
                <div />
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
                          $ref(#/foo)[]
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      >
                        <span
                          class="_tooltip_4a015f"
                        >
                          <span
                            aria-label="Could not resolve '#/foo'"
                            class="_errorIcon_4a015f"
                            role="img"
                            title="Could not resolve '#/foo'"
                          >
                            <svg
                              aria-hidden="true"
                              height="16"
                              viewBox="0 0 20 20"
                              width="16"
                            >
                              <path
                                d="M10 2 1.5 17h17L10 2Zm0 3.6 5.35 9.4H4.65L10 5.6Zm-.8 2v4h1.6v-4h-1.6Zm0 5.2v1.6h1.6v-1.6h-1.6Z"
                                fill="currentColor"
                              />
                            </svg>
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  class="_stack_577e6e _root_577e6e "
                  data-level="0"
                  style="--parent-nesting-level: 0; --root-level: 1;"
                >
                  <div
                    aria-label="Schema row"
                    class="_row_9d8035"
                    data-has-chevron="false"
                    data-id="98538b996305d"
                    data-nested="false"
                    data-test="schema-row"
                    role="presentation"
                  >
                    <div
                      class="_indicators_9d8035"
                    />
                    <div
                      class="_content_9d8035"
                      style="--nesting-level: 1; --root-level: 1;"
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
                            class="_types_c734fe _text_c734fe"
                            data-test="property-type-ref"
                          >
                            #/foo
                          </span>
                        </button>
                        <span
                          class="_properties_3455dc"
                        >
                          <span
                            class="_tooltip_4a015f"
                          >
                            <span
                              aria-label="Could not resolve '#/foo'"
                              class="_errorIcon_4a015f"
                              role="img"
                              title="Could not resolve '#/foo'"
                            >
                              <svg
                                aria-hidden="true"
                                height="16"
                                viewBox="0 0 20 20"
                                width="16"
                              >
                                <path
                                  d="M10 2 1.5 17h17L10 2Zm0 3.6 5.35 9.4H4.65L10 5.6Zm-.8 2v4h1.6v-4h-1.6Zm0 5.2v1.6h1.6v-1.6h-1.6Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>,
        "container": <div>
          <div
            aria-label="JSON schema viewer"
            class="_viewer_e7b391 json-schema-viewer"
            role="region"
            tabindex="0"
          >
            <div
              class="_container_e31247"
            >
              <div />
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
                        $ref(#/foo)[]
                      </span>
                    </button>
                    <span
                      class="_properties_3455dc"
                    >
                      <span
                        class="_tooltip_4a015f"
                      >
                        <span
                          aria-label="Could not resolve '#/foo'"
                          class="_errorIcon_4a015f"
                          role="img"
                          title="Could not resolve '#/foo'"
                        >
                          <svg
                            aria-hidden="true"
                            height="16"
                            viewBox="0 0 20 20"
                            width="16"
                          >
                            <path
                              d="M10 2 1.5 17h17L10 2Zm0 3.6 5.35 9.4H4.65L10 5.6Zm-.8 2v4h1.6v-4h-1.6Zm0 5.2v1.6h1.6v-1.6h-1.6Z"
                              fill="currentColor"
                            />
                          </svg>
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div
                class="_stack_577e6e _root_577e6e "
                data-level="0"
                style="--parent-nesting-level: 0; --root-level: 1;"
              >
                <div
                  aria-label="Schema row"
                  class="_row_9d8035"
                  data-has-chevron="false"
                  data-id="98538b996305d"
                  data-nested="false"
                  data-test="schema-row"
                  role="presentation"
                >
                  <div
                    class="_indicators_9d8035"
                  />
                  <div
                    class="_content_9d8035"
                    style="--nesting-level: 1; --root-level: 1;"
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
                          class="_types_c734fe _text_c734fe"
                          data-test="property-type-ref"
                        >
                          #/foo
                        </span>
                      </button>
                      <span
                        class="_properties_3455dc"
                      >
                        <span
                          class="_tooltip_4a015f"
                        >
                          <span
                            aria-label="Could not resolve '#/foo'"
                            class="_errorIcon_4a015f"
                            role="img"
                            title="Could not resolve '#/foo'"
                          >
                            <svg
                              aria-hidden="true"
                              height="16"
                              viewBox="0 0 20 20"
                              width="16"
                            >
                              <path
                                d="M10 2 1.5 17h17L10 2Zm0 3.6 5.35 9.4H4.65L10 5.6Zm-.8 2v4h1.6v-4h-1.6Zm0 5.2v1.6h1.6v-1.6h-1.6Z"
                                fill="currentColor"
                              />
                            </svg>
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        "debug": [Function],
        "findAllByAltText": [Function],
        "findAllByDisplayValue": [Function],
        "findAllByLabelText": [Function],
        "findAllByPlaceholderText": [Function],
        "findAllByRole": [Function],
        "findAllByTestId": [Function],
        "findAllByText": [Function],
        "findAllByTitle": [Function],
        "findByAltText": [Function],
        "findByDisplayValue": [Function],
        "findByLabelText": [Function],
        "findByPlaceholderText": [Function],
        "findByRole": [Function],
        "findByTestId": [Function],
        "findByText": [Function],
        "findByTitle": [Function],
        "getAllByAltText": [Function],
        "getAllByDisplayValue": [Function],
        "getAllByLabelText": [Function],
        "getAllByPlaceholderText": [Function],
        "getAllByRole": [Function],
        "getAllByTestId": [Function],
        "getAllByText": [Function],
        "getAllByTitle": [Function],
        "getByAltText": [Function],
        "getByDisplayValue": [Function],
        "getByLabelText": [Function],
        "getByPlaceholderText": [Function],
        "getByRole": [Function],
        "getByTestId": [Function],
        "getByText": [Function],
        "getByTitle": [Function],
        "queryAllByAltText": [Function],
        "queryAllByDisplayValue": [Function],
        "queryAllByLabelText": [Function],
        "queryAllByPlaceholderText": [Function],
        "queryAllByRole": [Function],
        "queryAllByTestId": [Function],
        "queryAllByText": [Function],
        "queryAllByTitle": [Function],
        "queryByAltText": [Function],
        "queryByDisplayValue": [Function],
        "queryByLabelText": [Function],
        "queryByPlaceholderText": [Function],
        "queryByRole": [Function],
        "queryByTestId": [Function],
        "queryByText": [Function],
        "queryByTitle": [Function],
        "rerender": [Function],
        "unmount": [Function],
      }
    `);
  });
});
