import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

// Configure testing library to use data-test instead of data-testid
configure({ testIdAttribute: "data-test" });
