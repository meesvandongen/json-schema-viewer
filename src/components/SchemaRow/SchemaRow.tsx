import {
  isMirroredNode,
  isReferenceNode,
  isRegularNode,
  type SchemaNode,
} from "@stoplight/json-schema-tree";
import type { ChangeType } from "@stoplight/types";
import { useSetAtom } from "jotai";
import last from "lodash/last.js";
import * as React from "react";

import { COMBINER_NAME_MAP } from "../../consts";
import { useJSVOptionsContext } from "../../contexts";
import { getNodeId, getOriginalNodeId } from "../../hash";
import { isPropertyRequired, visibleChildren } from "../../tree";
import { extractVendorExtensions } from "../../utils/extractVendorExtensions";
import { Caret, Description, getValidationsFromSchema, Types, Validations } from "../shared";
import { ChildStack } from "../shared/ChildStack";
import { Properties, useHasProperties } from "../shared/Properties";
import styles from "../shared/SchemaRow.module.css";
import { hoveredNodeAtom } from "./state";
import { useChoices } from "./useChoices";

export interface SchemaRowProps {
  schemaNode: SchemaNode;
  nestingLevel: number;
  parentNodeId?: string;
  parentChangeType?: ChangeType;
}

export const SchemaRow: React.FunctionComponent<SchemaRowProps> = React.memo(
  ({ schemaNode, nestingLevel, parentNodeId, parentChangeType }) => {
    const {
      defaultExpandedDepth,
      renderRowAddon,
      renderExtensionAddon,
      onGoToRef,
      hideExamples,
      renderRootTreeLines,
      nodeHasChanged,
      viewMode,
    } = useJSVOptionsContext();

    const setHoveredNode = useSetAtom(hoveredNodeAtom);

    const nodeId = getNodeId(schemaNode, parentNodeId);

    // @ts-expect-error originalFragment does exist...
    const originalNodeId = schemaNode.originalFragment?.$ref
      ? getOriginalNodeId(schemaNode, parentNodeId)
      : nodeId;
    const mode = viewMode === "standalone" ? undefined : viewMode;
    const hasChanged = nodeHasChanged?.({ nodeId: originalNodeId, mode });

    const [isExpanded, setExpanded] = React.useState<boolean>(
      !isMirroredNode(schemaNode) && nestingLevel <= defaultExpandedDepth,
    );

    const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
    const typeToShow = selectedChoice?.type ?? schemaNode;
    const description = isRegularNode(typeToShow) ? typeToShow.annotations.description : null;

    const childNodes = React.useMemo(() => visibleChildren(typeToShow), [typeToShow]);
    const combiner =
      isRegularNode(schemaNode) && schemaNode.combiners?.length ? schemaNode.combiners[0] : null;
    const isCollapsible = childNodes.length > 0;

    const required = isPropertyRequired(schemaNode);
    const deprecated = isRegularNode(schemaNode) && schemaNode.deprecated;
    const validations = isRegularNode(schemaNode) ? schemaNode.validations : {};
    const hasProperties = useHasProperties({ required, deprecated, validations });

    const [totalVendorExtensions, vendorExtensions] = React.useMemo(
      () => extractVendorExtensions(schemaNode.fragment),
      [schemaNode.fragment],
    );
    const hasVendorProperties = totalVendorExtensions > 0;

    const annotationRootOffset = renderRootTreeLines ? 0 : 8;
    let annotationLeftOffset = -20 - annotationRootOffset;
    if (nestingLevel > 1) {
      // annotationLeftOffset -= 27;
      annotationLeftOffset =
        -1 * 29 * Math.max(nestingLevel - 1, 1) -
        Math.min(nestingLevel, 2) * 2 -
        16 -
        annotationRootOffset;

      if (!renderRootTreeLines) {
        annotationLeftOffset += 27;
      }
    }
    
    // Determine if this row should show tree lines
    const rootLevel = renderRootTreeLines ? 0 : 1;
    const isNested = nestingLevel > rootLevel;

    if (parentChangeType === "added" && hasChanged && hasChanged.type === "removed") {
      return null;
    }

    if (parentChangeType === "removed" && hasChanged && hasChanged.type === "added") {
      return null;
    }

    return (
      <>
        <div
          className={styles.row}
          data-id={originalNodeId}
          data-test="schema-row"
          data-change-type={hasChanged ? hasChanged.type : undefined}
          data-nested={isNested ? 'true' : 'false'}
          data-has-chevron={isCollapsible ? 'true' : 'false'}
          aria-label="Schema row"
          role="presentation"
        >
          <div className={styles.indicators}>
            {hasChanged && hasChanged.isBreaking && (
              <span className={styles.breakingIcon} title="Breaking change">
                !
              </span>
            )}
            {hasChanged && (
              <span 
                className={styles.changeBar} 
                title={
                  hasChanged.type === 'added' ? 'Added' :
                  hasChanged.type === 'removed' ? 'Removed' :
                  hasChanged.type === 'modified' ? 'Modified' :
                  undefined
                }
              />
            )}
          </div>
          <div className={styles.content} style={{ 
            ['--nesting-level' as string]: nestingLevel,
            ['--root-level' as string]: rootLevel
          }}>
            <div className={styles.header}>
              {isCollapsible ? <Caret isExpanded={isExpanded} /> : null}
              <button
                type="button"
                className={styles.inline}
                aria-expanded={isCollapsible ? isExpanded : undefined}
                onMouseEnter={() => setHoveredNode(selectedChoice?.type ?? null)}
                onFocus={() => setHoveredNode(selectedChoice?.type ?? null)}
                onClick={isCollapsible ? () => setExpanded(!isExpanded) : undefined}
                style={{ cursor: isCollapsible ? 'pointer' : 'default' }}
              >
                {schemaNode.subpath.length > 0 && shouldShowPropertyName(schemaNode) && (
                  <span
                    className={styles.name}
                    data-test={`property-name-${last(schemaNode.subpath)}`}
                  >
                    {last(schemaNode.subpath)}
                  </span>
                )}

                {choices.length === 1 && <Types schemaNode={typeToShow} />}

                {onGoToRef && isReferenceNode(schemaNode) && schemaNode.external ? (
                  <button
                    type="button"
                    className={styles.pillLink}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onGoToRef(schemaNode);
                    }}
                  >
                    (go to ref)
                  </button>
                ) : null}

                {schemaNode.subpath.length > 1 && schemaNode.subpath[0] === "patternProperties" ? (
                  <span className={styles.pillLink}>(pattern property)</span>
                ) : null}

                {choices.length > 1 && selectedChoice && (
                  <select
                    aria-label="Pick a type"
                    value={String(choices.indexOf(selectedChoice))}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    onChange={(event) => {
                      const choice = choices[Number(event.target.value)];
                      if (choice) {
                        setSelectedChoice(choice);
                      }
                    }}
                  >
                    {choices.map((choice, index) => (
                      <option key={`${choice.title}-${index}`} value={String(index)}>
                        {combiner ? `${COMBINER_NAME_MAP[combiner]}: ` : ""}
                        {choice.title}
                      </option>
                    ))}
                  </select>
                )}
              </button>
              {hasProperties && <div className={styles.divider} aria-hidden />}
              <Properties required={required} deprecated={deprecated} validations={validations} schemaNode={schemaNode} />
            </div>
            {typeof description === "string" &&
              (!combiner || schemaNode.parent?.fragment.description !== description) &&
              description.length > 0 && <Description value={description} />}
            <Validations
              validations={isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {}}
              hideExamples={hideExamples}
            />
            {hasVendorProperties && renderExtensionAddon ? (
              <div className={styles.vendor}>
                {renderExtensionAddon({ schemaNode, nestingLevel, vendorExtensions })}
              </div>
            ) : null}
          </div>
          {renderRowAddon ? <div>{renderRowAddon({ schemaNode, nestingLevel })}</div> : null}
        </div>
        {isCollapsible && isExpanded ? (
          <ChildStack
            schemaNode={schemaNode}
            childNodes={childNodes}
            currentNestingLevel={nestingLevel}
            parentNodeId={nodeId}
            parentChangeType={
              parentChangeType ? parentChangeType : hasChanged ? hasChanged?.type : undefined
            }
          />
        ) : null}
      </>
    );
  },
);

function shouldShowPropertyName(schemaNode: SchemaNode) {
  return (
    schemaNode.subpath.length === 2 &&
    (schemaNode.subpath[0] === "properties" || schemaNode.subpath[0] === "patternProperties")
  );
}
