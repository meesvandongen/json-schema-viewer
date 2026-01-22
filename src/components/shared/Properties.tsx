import type { Dictionary } from "@stoplight/types";
import type { SchemaNode } from "@stoplight/json-schema-tree";
import * as React from "react";

import { useJSVOptionsContext } from "../../contexts";
import { ErrorIndicator } from "./Error";
import styles from "./Properties.module.css";

export interface IProperties {
  required: boolean;
  deprecated: boolean;
  validations: Dictionary<unknown>;
  schemaNode?: SchemaNode;
}

export const useHasProperties = ({
  required,
  deprecated,
  validations: { readOnly, writeOnly },
}: IProperties) => {
  const { viewMode } = useJSVOptionsContext();

  const showVisibilityValidations = viewMode === "standalone" && !!readOnly !== !!writeOnly;

  return deprecated || showVisibilityValidations || required;
};

export const Properties: React.FunctionComponent<IProperties> = ({
  required,
  deprecated,
  validations: { readOnly, writeOnly },
  schemaNode,
}) => {
  const { viewMode } = useJSVOptionsContext();

  // Show readOnly writeOnly validations only in standalone mode and only if just one of them is present
  const showVisibilityValidations = viewMode === "standalone" && !!readOnly !== !!writeOnly;
  const visibility = showVisibilityValidations ? (
    readOnly ? (
      <span className={`${styles.pill} ${styles.muted}`} data-test="property-read-only" title="This property is read-only">
        read-only
      </span>
    ) : (
      <span className={`${styles.pill} ${styles.muted}`} data-test="property-write-only" title="This property is write-only">
        write-only
      </span>
    )
  ) : null;

  return (
    <span className={styles.properties}>
      {deprecated ? (
        <span className={`${styles.pill} ${styles.warning}`} data-test="property-deprecated" title="This property is deprecated and may be removed in future versions">
          deprecated
        </span>
      ) : null}
      {visibility}
      {required && (
        <span className={`${styles.pill} ${styles.warning}`} data-test="property-required" title="This property is required">
          required
        </span>
      )}
      {schemaNode && <ErrorIndicator schemaNode={schemaNode} />}
    </span>
  );
};
