import * as React from "react";
import ReactMarkdown from "react-markdown";

import styles from "./Description.module.css";

export interface DescriptionProps {
  value: unknown;
}

export const Description: React.FunctionComponent<DescriptionProps> = ({ value }) => {
  const [showAll, setShowAll] = React.useState(false);

  if (typeof value !== "string" || value.trim().length === 0) return null;

  const paragraphs = value.split("\n\n");

  if (paragraphs.length <= 1 || showAll) {
    return (
      <div className={styles.description} data-test="property-description">
        <ReactMarkdown>{value}</ReactMarkdown>
      </div>
    );
  }

  const firstParagraph = paragraphs[0];

  return (
    <div className={styles.description} data-test="property-description">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p>
              <span>{children}</span>{" "}
              <button type="button" className={styles.showMore} onClick={() => setShowAll(true)}>
                Show all...
              </button>
            </p>
          ),
        }}
      >
        {firstParagraph}
      </ReactMarkdown>
    </div>
  );
};
