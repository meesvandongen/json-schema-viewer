import { isPlainObject } from "@stoplight/json";
import { isRegularNode, type RegularNode } from "@stoplight/json-schema-tree";
import { useSetAtom } from "jotai";
import { isEmpty } from "lodash";
import * as React from "react";

import { COMBINER_NAME_MAP } from "../../consts";
import { useJSVOptionsContext } from "../../contexts";
import { useIsOnScreen } from "../../hooks/useIsOnScreen";
import { isComplexArray, isDictionaryNode, visibleChildren } from "../../tree";
import { extractVendorExtensions } from "../../utils/extractVendorExtensions";
import { showPathCrumbsAtom } from "../PathCrumbs/state";
import {
  Description,
  getValidationsFromSchema,
  Validations,
  Error as ErrorIndicator,
} from "../shared";
import { ChildStack } from "../shared/ChildStack";
import { SchemaRow, type SchemaRowProps } from "./SchemaRow";
import { useChoices } from "./useChoices";
import topStyles from "../shared/TopLevelSchemaRow.module.css";
import { Dropdown } from "../shared/Dropdown";

export const TopLevelSchemaRow = ({
  schemaNode,
  skipDescription,
}: Pick<SchemaRowProps, "schemaNode"> & { skipDescription?: boolean }) => {
  const { renderExtensionAddon } = useJSVOptionsContext();

  const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
  const childNodes = React.useMemo(
    () => visibleChildren(selectedChoice?.type ?? schemaNode),
    [selectedChoice, schemaNode],
  );
  const nestingLevel = 0;

  const nodeId = (() => {
    if (isPlainObject(schemaNode.fragment) && isPlainObject(schemaNode.fragment["x-stoplight"])) {
      const id = schemaNode.fragment["x-stoplight"].id;
      return typeof id === "string" ? id : undefined;
    }
    return undefined;
  })();
  const [totalVendorExtensions, vendorExtensions] = React.useMemo(
    () => extractVendorExtensions(schemaNode.fragment),
    [schemaNode.fragment],
  );
  const hasVendorProperties = totalVendorExtensions > 0;

  // regular objects are flattened at the top level
  if (isRegularNode(schemaNode) && isPureObjectNode(schemaNode)) {
    return (
      <div className={topStyles.container}>
        <ScrollCheck />
        {!skipDescription ? <Description value={schemaNode.annotations.description} /> : null}
        {/* Show top-level internal schema error if present */}
        <ErrorIndicator schemaNode={schemaNode} />
        {hasVendorProperties && renderExtensionAddon
          ? renderExtensionAddon({ schemaNode, nestingLevel, vendorExtensions })
          : null}
        <ChildStack
          schemaNode={schemaNode}
          childNodes={childNodes}
          currentNestingLevel={nestingLevel}
          parentNodeId={nodeId}
        />
      </div>
    );
  }

  if (isRegularNode(schemaNode) && choices.length > 1) {
    const combiner =
      isRegularNode(schemaNode) && schemaNode.combiners?.length ? schemaNode.combiners[0] : null;

    return (
      <div className={topStyles.container}>
        <ScrollCheck />
        {schemaNode.annotations.description !== schemaNode.parent?.fragment.description && (
          <Description value={schemaNode.annotations.description} />
        )}
        {selectedChoice && (
          <div className={topStyles.choiceBar}>
            <Dropdown
              aria-label="Pick a type"
              value={String(choices.indexOf(selectedChoice))}
              onChange={(val: string) => {
                const choice = choices[Number(val)];
                if (choice) {
                  setSelectedChoice(choice);
                }
              }}
            >
              {choices.map((choice, index) => (
                <option key={`${choice.title}-${index}`} value={String(index)}>
                  {choice.title}
                </option>
              ))}
            </Dropdown>

            {combiner && combiner in COMBINER_NAME_MAP ? (
              <div className={topStyles.combiner}>{`(${COMBINER_NAME_MAP[combiner]})`}</div>
            ) : null}
          </div>
        )}
        {childNodes.length > 0 ? (
          <ChildStack
            schemaNode={schemaNode}
            childNodes={childNodes}
            currentNestingLevel={nestingLevel}
            parentNodeId={nodeId}
          />
        ) : combiner && selectedChoice ? (
          <SchemaRow schemaNode={selectedChoice.type} nestingLevel={nestingLevel} />
        ) : null}
      </div>
    );
  }

  if (
    isComplexArray(schemaNode) &&
    schemaNode.children[0] &&
    isPureObjectNode(schemaNode.children[0])
  ) {
    const validations = isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {};
    return (
      <div className={topStyles.container}>
        <ScrollCheck />
        <Description value={schemaNode.annotations.description} />

        <div className={topStyles.arrayHeader}>
          <div className={topStyles.arrayLabel}>array of:</div>
          {!isEmpty(validations) && <Validations validations={validations} />}
        </div>

        {childNodes.length > 0 ? (
          <ChildStack
            schemaNode={schemaNode}
            childNodes={childNodes}
            currentNestingLevel={nestingLevel}
            parentNodeId={nodeId}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={topStyles.container}>
      <ScrollCheck />
      <SchemaRow schemaNode={schemaNode} nestingLevel={nestingLevel} />
    </div>
  );
};

function ScrollCheck() {
  const elementRef = React.useRef<HTMLDivElement>(null);

  const isOnScreen = useIsOnScreen(elementRef);
  const setShowPathCrumbs = useSetAtom(showPathCrumbsAtom);
  React.useEffect(() => {
    setShowPathCrumbs(!isOnScreen);
  }, [isOnScreen, setShowPathCrumbs]);

  return <div ref={elementRef} />;
}

function isPureObjectNode(schemaNode: RegularNode) {
  return (
    schemaNode.primaryType === "object" &&
    schemaNode.types?.length === 1 &&
    !isDictionaryNode(schemaNode)
  );
}
