import {
  isReferenceNode,
  isRegularNode,
  type ReferenceNode,
  type SchemaNode,
  SchemaNodeKind,
} from "@stoplight/json-schema-tree";
import * as React from "react";

import { isFlattenableNode } from "../../tree";
import { getInternalSchemaError } from "../../utils/getInternalSchemaError";
import styles from "./Error.module.css";

function useRefNode(schemaNode: SchemaNode) {
  return React.useMemo<ReferenceNode | null>(() => {
    if (isReferenceNode(schemaNode)) {
      return schemaNode;
    }

    if (
      isRegularNode(schemaNode) &&
      (isFlattenableNode(schemaNode) ||
        (schemaNode.primaryType === SchemaNodeKind.Array && schemaNode.children?.length === 1))
    ) {
      return (schemaNode.children?.find(isReferenceNode) as ReferenceNode | undefined) ?? null;
    }

    return null;
  }, [schemaNode]);
}

export const ErrorIndicator: React.FC<{ schemaNode: SchemaNode }> = ({ schemaNode }) => {
  const refNode = useRefNode(schemaNode);
  const error = getInternalSchemaError(schemaNode) ?? refNode?.error;

  if (typeof error !== "string") return null;

  return (
    <span className={styles.tooltip}>
      <span className={styles.errorIcon} role="img" aria-label={error} title={error}>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path
            d="M10 2 1.5 17h17L10 2Zm0 3.6 5.35 9.4H4.65L10 5.6Zm-.8 2v4h1.6v-4h-1.6Zm0 5.2v1.6h1.6v-1.6h-1.6Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </span>
  );
};

export { ErrorIndicator as Error };
