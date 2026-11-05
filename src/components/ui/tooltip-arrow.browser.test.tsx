import { expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { page } from "vitest/browser";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import "@/app/globals.css";

it.each(["top", "bottom", "left", "right"] as const)(
  "shows the %s tooltip without a pointer",
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
    await waitFor(() => expect(tooltip).toBeVisible());
    expect(tooltip).toHaveTextContent("Create new");
    expect(getComputedStyle(arrow).display).toBe("none");
  },
);
