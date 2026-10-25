import {
  isRegularNode,
  SchemaTree as JsonSchemaTree,
  type RootNode,
  type SchemaTreeRefDereferenceFn,
} from "@stoplight/json-schema-tree";
import type { ErrorBoundaryForwardedProps, FallbackProps } from "@stoplight/react-error-boundary";
import { withErrorBoundary } from "@stoplight/react-error-boundary";
import cn from "classnames";
import { Provider, useSetAtom } from "jotai";
import * as React from "react";

import type { JSVOptions } from "../contexts";
import { JSVOptionsContextProvider } from "../contexts";
import { shouldNodeBeIncluded } from "../tree/utils";
import type { JSONSchema } from "../types";
import { PathCrumbs } from "./PathCrumbs";
import { TopLevelSchemaRow } from "./SchemaRow";
import { hoveredNodeAtom } from "./SchemaRow/state";
import shellStyles from "./shared/JsonSchemaViewerShell.module.css";
// viewer.css @imports theme.css; importing theme.css here as well would emit it twice.
import "../styles/viewer.css";

export type JsonSchemaProps = Partial<JSVOptions> & {
  schema: JSONSchema;
  emptyText?: string;
  className?: string;
  resolveRef?: SchemaTreeRefDereferenceFn;
  /** Controls the level of recursion of refs. Prevents overly complex trees and running out of stack depth. */
  maxRefDepth?: number;
  onTreePopulated?: (props: { rootNode: RootNode; nodeCount: number }) => void;
  maxHeight?: number;
  parentCrumbs?: string[];
  skipTopLevelDescription?: boolean;
};

const JsonSchemaViewerComponent = ({
  viewMode = "standalone",
  defaultExpandedDepth = 1,
  onGoToRef,
  renderRowAddon,
  renderExtensionAddon,
  hideExamples,
  renderRootTreeLines,
  disableCrumbs,
  nodeHasChanged,
  skipTopLevelDescription,
  ...rest
}: JsonSchemaProps & ErrorBoundaryForwardedProps) => {
  const options = React.useMemo(
    () => ({
      defaultExpandedDepth,
      viewMode,
      onGoToRef,
      renderRowAddon,
      renderExtensionAddon,
      hideExamples,
      renderRootTreeLines,
      disableCrumbs,
      nodeHasChanged,
    }),
    [
      defaultExpandedDepth,
      viewMode,
      onGoToRef,
      renderRowAddon,
      renderExtensionAddon,
      hideExamples,
      renderRootTreeLines,
      disableCrumbs,
      nodeHasChanged,
    ],
  );

  return (
    <JSVOptionsContextProvider value={options}>
      <Provider>
        <JsonSchemaViewerInner
          viewMode={viewMode}
          skipTopLevelDescription={skipTopLevelDescription}
          {...rest}
        />
      </Provider>
    </JSVOptionsContextProvider>
  );
};

const JsonSchemaViewerInner = ({
  schema,
  viewMode,
  className,
  resolveRef,
  maxRefDepth,
  emptyText = "No schema defined",
  onTreePopulated,
  maxHeight,
  parentCrumbs,
  skipTopLevelDescription,
}: Pick<
  JsonSchemaProps,
  | "schema"
  | "viewMode"
  | "className"
  | "resolveRef"
  | "maxRefDepth"
  | "emptyText"
  | "onTreePopulated"
  | "maxHeight"
  | "parentCrumbs"
  | "skipTopLevelDescription"
>) => {
  const setHoveredNode = useSetAtom(hoveredNodeAtom);
  const onMouseLeave = React.useCallback(() => {
    setHoveredNode(null);
  }, [setHoveredNode]);

  const { jsonSchemaTreeRoot, nodeCount } = React.useMemo(() => {
    const jsonSchemaTree = new JsonSchemaTree(schema, {
      mergeAllOf: true,
      refResolver: resolveRef,
      maxRefDepth,
    });

    let nodeCount = 0;

    jsonSchemaTree.walker.hookInto("filter", (node) => {
      if (shouldNodeBeIncluded(node, viewMode)) {
        nodeCount++;
        return true;
      }
      return false;
    });
    jsonSchemaTree.populate();

    return {
      jsonSchemaTreeRoot: jsonSchemaTree.root,
      nodeCount,
    };
  }, [schema, resolveRef, maxRefDepth, viewMode]);

  React.useEffect(() => {
    onTreePopulated?.({
      rootNode: jsonSchemaTreeRoot,
      nodeCount: nodeCount,
    });
  }, [jsonSchemaTreeRoot, onTreePopulated, nodeCount]);

  const isEmpty = React.useMemo(
    () => jsonSchemaTreeRoot.children.every((node) => !isRegularNode(node) || node.unknown),
    [jsonSchemaTreeRoot],
  );
  if (isEmpty) {
    return (
      <div
        className={cn(className, shellStyles.viewer, "json-schema-viewer")}
        data-test="empty-text"
      >
        <div className={shellStyles.empty}>{emptyText}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(shellStyles.viewer, "json-schema-viewer", className)}
      style={{
        maxHeight,
        overflowY: maxHeight ? "auto" : undefined,
        position: maxHeight ? "relative" : undefined,
      }}
      onMouseLeave={onMouseLeave}
      role="region"
      tabIndex={0}
      aria-label="JSON schema viewer"
    >
      <PathCrumbs parentCrumbs={parentCrumbs} />
      {jsonSchemaTreeRoot.children[0] && (
        <TopLevelSchemaRow
          schemaNode={jsonSchemaTreeRoot.children[0]}
          skipDescription={skipTopLevelDescription}
        />
      )}
    </div>
  );
};

const JsonSchemaFallbackComponent = ({ error }: FallbackProps) => {
  return (
    <div className={cn(shellStyles.viewer, "json-schema-viewer")}>
      <div style={{ color: "var(--jsv-danger)", fontWeight: 700 }}>Error</div>
      {error !== null ? `: ${error.message}` : null}
    </div>
  );
};

export const JsonSchemaViewer = withErrorBoundary<JsonSchemaProps>(JsonSchemaViewerComponent, {
  FallbackComponent: JsonSchemaFallbackComponent,
  recoverableProps: ["schema"],
});
