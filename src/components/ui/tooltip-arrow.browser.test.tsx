import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { page } from "vitest/browser";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import "@/app/globals.css";

it.each(["top", "bottom", "left", "right"] as const)(
  "joins the arrow to the %s tooltip with the same background",
  async (side) => {
    await page.viewport(600, 500);
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger
            render={
              <button style={{ position: "fixed", left: 280, top: 240 }} />
            }
          >
            Hover
          </TooltipTrigger>
          <TooltipContent side={side}>Create new</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const tooltip = await screen.findByRole("tooltip");
    const arrow = tooltip.querySelector<HTMLElement>(
      '[data-slot="tooltip-arrow"]',
    );
    expect(arrow).not.toBeNull();
    if (!arrow) throw new Error("Tooltip arrow is missing");

    await expect.poll(() => tooltip.dataset.side).toBe(side);
    await expect
      .poll(() => {
        const popup = tooltip.getBoundingClientRect();
        const tip = arrow.getBoundingClientRect();
        switch (side) {
          case "top":
            return tip.top < popup.bottom && tip.bottom > popup.bottom;
          case "bottom":
            return tip.top < popup.top && tip.bottom > popup.top;
          case "left":
            return tip.left < popup.right && tip.right > popup.right;
          case "right":
            return tip.left < popup.left && tip.right > popup.left;
        }
      })
      .toBe(true);

    expect(getComputedStyle(arrow).display).not.toBe("none");
    expect(getComputedStyle(arrow).backgroundColor).toBe(
      getComputedStyle(tooltip).backgroundColor,
    );
  },
);
