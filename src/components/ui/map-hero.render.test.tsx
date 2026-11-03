import { createRef } from "react";
import { describe, expect, it } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { IndexHero } from "./map-hero";

describe("IndexHero", () => {
  // The dive list moves focus to its heading when something above the list
  // removes itself, and a heading takes focus only with a `tabindex`.
  it("makes the heading a focus target only when given a ref", () => {
    const headingRef = createRef<HTMLHeadingElement>();
    const { unmount } = render(
      <IndexHero
        title="Dives"
        subtitle="Your logbook"
        actions={<button>Log new dive</button>}
        headingRef={headingRef}
      />,
    );
    act(() => headingRef.current?.focus());
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
    unmount();

    render(
      <IndexHero
        title="Trips"
        subtitle="Your trips"
        actions={<button>New trip</button>}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveAttribute(
      "tabindex",
    );
  });
});

describe("page information", () => {
  const description = "Track your equipment and service history";
  const renderInfo = () => {
    render(<IndexHero title="Gear" description={description} />);
    return screen.getByRole("button", { name: "About this page" });
  };

  it("shows the full description on hover and dismisses it with Escape", async () => {
    const user = userEvent.setup();
    const button = renderInfo();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const previousFocus = document.activeElement;
    await user.hover(button);
    const popover = await screen.findByRole("dialog");
    expect(popover).toHaveTextContent(description);
    expect(document.activeElement).toBe(previousFocus);
    expect(popover).not.toHaveTextContent("About this page");

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("opens on keyboard activation and returns focus after Escape", async () => {
    const user = userEvent.setup();
    renderInfo();
    await user.tab();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("dialog")).toHaveTextContent(description);
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "About this page" }),
    ).toHaveFocus();
  });

  it("keeps the description open when moving into it and dismisses outside", async () => {
    const user = userEvent.setup();
    const button = renderInfo();
    await user.hover(button);
    await user.hover(await screen.findByRole("dialog"));
    expect(screen.getByRole("dialog")).toHaveTextContent(description);
    await user.click(document.body);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("still opens on a touch tap", async () => {
    const button = renderInfo();
    fireEvent.pointerEnter(button, { pointerType: "touch" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.pointerDown(button, { pointerType: "touch" });
    fireEvent.pointerUp(button, { pointerType: "touch" });
    fireEvent.click(button);
    expect(await screen.findByRole("dialog")).toHaveTextContent(description);
  });
});
