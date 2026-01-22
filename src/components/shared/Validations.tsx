import { isRegularNode, type RegularNode } from "@stoplight/json-schema-tree";
import type { Dictionary } from "@stoplight/types";
import capitalize from "lodash/capitalize.js";
import keys from "lodash/keys.js";
import omit from "lodash/omit.js";
import pick from "lodash/pick.js";
import uniq from "lodash/uniq.js";
import * as React from "react";

import styles from "./Validations.module.css";

export interface IValidations {
  validations: Dictionary<unknown>;
  hideExamples?: boolean;
}

type ValidationFormat = {
  name: string;
  values: string[];
};

export const numberValidationNames = [
  "minimum",
  "maximum",
  "minLength",
  "maxLength",
  "minItems",
  "maxItems",
  "exclusiveMinimum",
  "exclusiveMaximum",
];

type NumberValidationNames = typeof numberValidationNames;

const exampleValidationNames = ["examples"];

const excludedValidations = ["exclusiveMinimum", "exclusiveMaximum", "readOnly", "writeOnly"];

const numberValidationFormatters: Record<string, (value: unknown) => string> = {
  minimum: (value) => `>= ${value}`,
  exclusiveMinimum: (value) => `> ${value}`,
  minItems: (value) => `>= ${value} items`,
  minLength: (value) => `>= ${value} characters`,
  maximum: (value) => `<= ${value}`,
  exclusiveMaximum: (value) => `< ${value}`,
  maxItems: (value) => `<= ${value} items`,
  maxLength: (value) => `<= ${value} characters`,
};

const createStringFormatter = (nowrap: boolean | undefined) => (value: unknown) => {
  return nowrap && typeof value === "string" ? value : JSON.stringify(value);
};

const createValidationsFormatter =
  (name: string, options?: { exact?: boolean; nowrap?: boolean }) =>
  (value: unknown[] | unknown): ValidationFormat | null => {
    const values = Array.isArray(value) ? value : [value];
    if (values.length) {
      return {
        name: options?.exact ? name : values.length > 1 ? `${name}s` : `${name}`,
        values: values.map(createStringFormatter(options?.nowrap)),
      };
    }
    return null;
  };

const validationFormatters: Record<string, (value: unknown) => ValidationFormat | null> = {
  enum: createValidationsFormatter("Allowed value", { nowrap: true }),
  examples: createValidationsFormatter("Example", { nowrap: true }),
  multipleOf: createValidationsFormatter("Multiple of", { exact: true }),
  pattern: createValidationsFormatter("Match pattern", { exact: true, nowrap: true }),
  default: createValidationsFormatter("Default", { exact: true, nowrap: true }),
  style: createValidationsFormatter("Style", { exact: true, nowrap: true }),
};

const oasFormats = {
  int32: {
    minimum: 0 - 2 ** 31,
    maximum: 2 ** 31 - 1,
  },
  int64: {
    minimum: Number.MIN_SAFE_INTEGER,
    maximum: Number.MAX_SAFE_INTEGER,
  },
  float: {
    minimum: 0 - 2 ** 128,
    maximum: 2 ** 128 - 1,
  },
  double: {
    minimum: 0 - Number.MAX_VALUE,
    maximum: Number.MAX_VALUE,
  },
  byte: {
    pattern: "^[\\w\\d+\\/=]*$",
  },
};

function isOasFormat(format: string): format is keyof typeof oasFormats {
  return format in oasFormats;
}

function filterOutOasFormatValidations(format: string, values: Dictionary<unknown>) {
  if (!isOasFormat(format)) {
    return values;
  }

  const newValues = { ...values };

  for (const [key, value] of Object.entries(oasFormats[format])) {
    if (value === newValues[key]) {
      delete newValues[key];
    }
  }

  return newValues;
}

export const Validations: React.FunctionComponent<IValidations> = ({
  validations,
  hideExamples,
}) => {
  const numberValidations = pick(validations, numberValidationNames);
  const keyValueValidations = omit(validations, [
    ...keys(numberValidations),
    ...excludedValidations,
    ...(hideExamples ? exampleValidationNames : []),
  ]);

  const numberEntries = Object.entries(numberValidations);
  const keyValueEntries = keys(keyValueValidations).filter(
    (key) => Object.keys(validationFormatters).includes(key) && (keyValueValidations as Dictionary<unknown>)[key] !== void 0,
  );

  if (!numberEntries.length && !keyValueEntries.length) {
    return null;
  }

  return (
    <div className={styles.validationsGroup} data-test="property-validation">
      <NumberValidations entries={numberEntries} />
      <KeyValueValidations keysList={keyValueEntries} validations={keyValueValidations} />
    </div>
  );
};

const NumberValidations = ({
  entries,
}: {
  entries: Array<[NumberValidationNames[number], unknown]>;
}) => {
  if (!entries.length) {
    return null;
  }
  return (
    <div className={styles.numberRow}>
      {entries
        .map(([key, value]) => {
          const formatter = numberValidationFormatters[key];
          return formatter ? formatter(value) : null;
        })
        .filter((value): value is string => value !== null)
        .map((value, i) => {
          const entry = entries[i];
          return entry ? <Value key={`${entry[0]}-${value}`} name={value} /> : null;
        })}
    </div>
  );
};

const KeyValueValidations = ({
  keysList,
  validations,
}: {
  keysList: string[];
  validations: Dictionary<unknown>;
}) => (
  <>
    {keysList.map((key) => {
      const formatter = validationFormatters[key];
      const validationValue = validations[key];
      if (formatter && validationValue !== undefined) {
        const validation = formatter(validationValue);
        if (validation) {
          return <KeyValueValidation key={key} name={validation.name} values={validation.values} />;
        }
      }
      return null;
    })}
  </>
);

const KeyValueValidation = ({ name, values }: { name: string; values: string[] }) => (
  <div className={styles.validationRow}>
    <span>{capitalize(name)}:</span>
    <span className={styles.values}>
      {uniq(values).map((value) => (
        <Value key={value} name={value} />
      ))}
    </span>
  </div>
);

const Value = ({ name }: { name: string }) => <span className={styles.value}>{name}</span>;

export function validationCount(schemaNode: RegularNode) {
  const validations = getValidationsFromSchema(schemaNode);
  const validationKeys = keys(omit(validations, excludedValidations));
  return uniq(
    validationKeys.map((key) => ([...numberValidationNames].includes(key) ? "number" : key)),
  ).length;
}

const getArrayValidations = (schemaNode: RegularNode) => {
  const firstChild = schemaNode.children?.[0];
  if (firstChild && isRegularNode(firstChild)) {
    if (firstChild.enum !== null) {
      return { enum: firstChild.enum };
    } else if (firstChild.fragment.pattern !== void 0) {
      return { pattern: firstChild.fragment.pattern };
    }
  }
  return null;
};

export function getValidationsFromSchema(schemaNode: RegularNode) {
  const arrayValidations = schemaNode.primaryType === "array" ? getArrayValidations(schemaNode) : null;
  
  return {
    ...(schemaNode.enum !== null
      ? { enum: schemaNode.enum }
      : arrayValidations),
    ...("annotations" in schemaNode
      ? {
          ...(schemaNode.annotations.default !== void 0
            ? { default: schemaNode.annotations.default }
            : null),
          ...(schemaNode.annotations.examples
            ? { examples: schemaNode.annotations.examples }
            : null),
        }
      : null),
    ...getFilteredValidations(schemaNode),
  };
}

function getFilteredValidations(schemaNode: RegularNode) {
  if (schemaNode.format !== null) {
    return filterOutOasFormatValidations(schemaNode.format, schemaNode.validations);
  }

  return schemaNode.validations;
}
