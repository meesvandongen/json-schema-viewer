import * as React from "react";

import styles from "./Caret.module.css";

export interface ICaret {
  isExpanded: boolean;
}

export const Caret: React.FunctionComponent<ICaret> = ({ isExpanded }) => (
  <span
    className={`${styles.caret} ${isExpanded ? styles.expanded : ""}`}
    role="presentation"
    aria-hidden="true"
  >
    <svg className={styles.chevron} viewBox="0 0 12 12" focusable="false" aria-hidden="true">
      <path
        d="M4 2.5 8 6l-4 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

Caret.displayName = "JsonSchemaViewer.Caret";
