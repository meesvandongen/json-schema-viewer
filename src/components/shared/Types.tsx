import {
  isBooleanishNode,
  isReferenceNode,
  isRegularNode,
  type RegularNode,
  type SchemaCombinerName,
  type SchemaNode,
  SchemaNodeKind,
} from "@stoplight/json-schema-tree";
import * as React from "react";

import { printName } from "../../utils";
import { getApplicableFormats } from "../../utils/getApplicableFormats";
import styles from "./Types.module.css";

function shouldRenderName(type: SchemaNodeKind | SchemaCombinerName | "$ref"): boolean {
  return type === SchemaNodeKind.Array || type === SchemaNodeKind.Object || type === "$ref";
}

function getTypes(schemaNode: RegularNode): Array<SchemaNodeKind | SchemaCombinerName> {
  return [schemaNode.types, schemaNode.combiners].reduce<
    Array<SchemaNodeKind | SchemaCombinerName>
  >((values, value) => {
    if (value === null) {
      return values;
    }

    values.push(...value);
    return values;
  }, []);
}

export const Types: React.FunctionComponent<{ schemaNode: SchemaNode }> = ({ schemaNode }) => {
  if (isReferenceNode(schemaNode)) {
    return (
      <span className={`${styles.types} ${styles.text}`} data-test="property-type-ref">
        {schemaNode.value ?? "$ref"}
      </span>
    );
  }

  if (isBooleanishNode(schemaNode)) {
    return (
      <span className={`${styles.types} ${styles.muted} ${styles.text}`} data-test="property-type">
        {schemaNode.fragment ? "any" : "never"}
      </span>
    );
  }

  if (!isRegularNode(schemaNode)) {
    return null;
  }

  const formats = getApplicableFormats(schemaNode);
  const types = getTypes(schemaNode);

  if (types.length === 0) {
    return (
      <span className={`${styles.types} ${styles.muted} ${styles.text}`} data-test="property-type">
        {formats === null ? "any" : `<${formats[1]}>`}
      </span>
    );
  }

  const rendered = types.map((type, i, { length }): React.ReactNode => {
    let printedName: string | undefined;
    if (shouldRenderName(type)) {
      printedName = printName(schemaNode);
    }

    printedName ??= type + (formats === null || formats[0] !== type ? "" : `<${formats[1]}>`);

    return (
      <React.Fragment key={type}>
        <span
          className={`${styles.types} ${styles.muted} ${styles.text}`}
          data-test="property-type"
        >
          {printedName}
        </span>

        {i < length - 1 && <span className={styles.muted}>{" or "}</span>}
      </React.Fragment>
    );
  });

  return rendered.length > 1 ? <span className={styles.types}>{rendered}</span> : <>{rendered}</>;
};
Types.displayName = "JsonSchemaViewer.Types";
