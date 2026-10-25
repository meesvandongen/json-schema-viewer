import type { SchemaNode } from "@stoplight/json-schema-tree";
import type { ChangeType } from "@stoplight/types";
import * as React from "react";

import { useJSVOptionsContext } from "../../contexts";
import { SchemaRow, type SchemaRowProps } from "../SchemaRow";
import styles from "./ChildStack.module.css";

type ChildStackProps = {
  schemaNode: SchemaNode;
  childNodes: readonly SchemaNode[];
  currentNestingLevel: number;
  className?: string;
  parentNodeId?: string;
  RowComponent?: React.FC<SchemaRowProps>;
  parentChangeType?: ChangeType;
};

export const ChildStack = React.memo(
  ({
    childNodes,
    currentNestingLevel,
    className,
    RowComponent = SchemaRow,
    parentNodeId,
    parentChangeType,
  }: ChildStackProps) => {
    const { renderRootTreeLines } = useJSVOptionsContext();
    const rootLevel = renderRootTreeLines ? 0 : 1;
    const isRootLevel = currentNestingLevel < rootLevel;

    return (
      <div
        className={`${styles.stack} ${isRootLevel ? styles.root : ""} ${className ?? ""}`}
        data-level={currentNestingLevel}
        style={{
          ["--parent-nesting-level" as string]: currentNestingLevel,
          ["--root-level" as string]: rootLevel,
        }}
      >
        {childNodes.map((childNode: SchemaNode) => (
          <RowComponent
            key={childNode.id}
            schemaNode={childNode}
            nestingLevel={currentNestingLevel + 1}
            parentNodeId={parentNodeId}
            parentChangeType={parentChangeType}
          />
        ))}
      </div>
    );
  },
);
