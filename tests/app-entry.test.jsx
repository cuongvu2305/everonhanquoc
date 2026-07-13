import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import App from "../src/app/App.jsx";
import { Icon } from "../src/components/icons/Icon.jsx";

test("App is importable as a Vite module", () => {
  expect(App).toBeTypeOf("function");
});

test("Icon retains the legacy CSS wrapper around Lucide SVGs", () => {
  const { container } = render(<Icon name="MapPin" />);

  expect(container.querySelector("span.lucide-icon > svg")).not.toBeNull();
});
