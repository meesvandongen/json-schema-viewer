import { useAtom } from "jotai";
import * as React from "react";

import { useJSVOptionsContext } from "../../contexts";
import styles from "../shared/PathCrumbs.module.css";
import { pathCrumbsAtom, showPathCrumbsAtom } from "./state";

export const PathCrumbs = ({ parentCrumbs = [] }: { parentCrumbs?: string[] }) => {
  const [showPathCrumbs] = useAtom(showPathCrumbsAtom);
  const [pathCrumbs] = useAtom(pathCrumbsAtom);
  const { disableCrumbs } = useJSVOptionsContext();

  if (disableCrumbs) {
    return null;
  }

  const parentCrumbElems: React.ReactNode[] = [];
  parentCrumbs.forEach((crumb) => {
    parentCrumbElems.push(
      <span key={`parent-${crumb}`}>
        {crumb}
        <span className={styles.divider}> / </span>
      </span>,
    );
  });

  const pathCrumbElems: React.ReactNode[] = [];
  pathCrumbs.forEach((crumb, i) => {
    const next = pathCrumbs[i + 1];
    const key = `crumb-${crumb}-${i}`;
    if (next) {
      pathCrumbElems.push(
        <span key={key}>
          {crumb}
          <span className={styles.divider}> / </span>
        </span>,
      );
    } else {
      pathCrumbElems.push(
        <span key={key} className={styles.active}>
          {crumb}
        </span>,
      );
    }
  });

  // only show when have a path, and only when we've scrolled enough such that a portion of the JSV is no longer visible
  if (!showPathCrumbs || (!parentCrumbElems.length && !pathCrumbElems.length)) {
    return null;
  }

  return (
    <div className={styles.crumbs}>
      {parentCrumbElems}
      {pathCrumbElems}
    </div>
  );
};
