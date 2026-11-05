import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import {
  OneTimePasswordField,
  OneTimePasswordFieldInput,
} from "./one-time-password-field";

function Field({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <OneTimePasswordField aria-label="Code" defaultValue={defaultValue}>
      {Array.from({ length: 6 }, (_, index) => (
        <OneTimePasswordFieldInput key={index} index={index} />
      ))}
    </OneTimePasswordField>
  );
}

const boxes = () => screen.getAllByRole("textbox");

// The touch workaround needs only `pointerType`.
const pointerDown = (target: Element, pointerType: string) => {
  const event = new Event("pointerdown", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  target.dispatchEvent(event);
  return event.defaultPrevented;
};

const mouseDown = (target: Element) => {
  const event = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event.defaultPrevented;
};

describe("OneTimePasswordField", () => {
  it("selects a filled digit after native touch focus so typing replaces it", () => {
    render(<Field defaultValue="1234" />);
    const input = boxes()[1];
    if (!(input instanceof HTMLInputElement))
      throw new Error("Expected an OTP input");
    pointerDown(input, "touch");
    input.focus();
    input.click();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(1);
    fireEvent.change(input, { target: { value: "7" } });
    expect(
      boxes()
        .map((box) => (box instanceof HTMLInputElement ? box.value : ""))
        .join(""),
    ).toBe("1734");
  });

  // iOS raises the keyboard only when the tap can focus the box natively.
  it("leaves native pointer focus available for touch and mouse", () => {
    render(<Field />);

    expect(pointerDown(boxes()[0], "touch")).toBe(false);
    expect(pointerDown(boxes()[0], "mouse")).toBe(false);
  });

  // A touch must keep its native mousedown focus, including past the current code.
  it("lets a tap's mousedown through to a box past the code", () => {
    render(<Field />);

    pointerDown(boxes()[3], "touch");
    expect(mouseDown(boxes()[3])).toBe(false);

    pointerDown(boxes()[3], "mouse");
    expect(mouseDown(boxes()[3])).toBe(true);
  });

  it("moves a tap past the code typed so far to the next empty box", () => {
    render(<Field />);

    pointerDown(boxes()[3], "touch");
    boxes()[3].focus();
    boxes()[3].click();

    expect(document.activeElement).toBe(boxes()[0]);
  });
});
