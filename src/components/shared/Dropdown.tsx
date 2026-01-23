import * as React from "react";
import styles from "./Dropdown.module.css";

export type DropdownProps<T extends string | number = string> =
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> & {
    value: T;
    onChange: (value: T) => void;
  };

export const Dropdown = <T extends string | number = string>({
  value,
  onChange,
  children,
  className,
  ...rest
}: DropdownProps<T>) => {
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) =>
    onChange((e.target.value as unknown) as T);

  const combinedClassName = className ? [styles.select, className].filter(Boolean).join(" ") : undefined;

  return (
    <select className={combinedClassName} value={String(value)} onChange={handleChange} {...rest}>
      {children}
    </select>
  );
};

export default Dropdown;
