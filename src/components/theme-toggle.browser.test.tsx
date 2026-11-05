import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { page } from "vitest/browser";

import { ThemeProvider } from "./theme-provider";
import { ThemeMenuItems, ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import "@/app/globals.css";

const storageKey = "theme-menu-test";

beforeEach(() => localStorage.removeItem(storageKey));
afterEach(() => {
  localStorage.removeItem(storageKey);
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.style.removeProperty("color-scheme");
  vi.restoreAllMocks();
});

it.each([
  ["system", "System", "Dark"],
  ["dark", "Dark", "Light"],
  ["light", "Light", "System"],
])(
  "checks the saved %s theme and closes after a new selection",
  async (theme, label, nextLabel) => {
    const consoleError = vi.spyOn(console, "error");
    localStorage.setItem(storageKey, theme);
    render(
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey={storageKey}
      >
        <ThemeToggle />
      </ThemeProvider>,
    );

    await page.getByRole("button", { name: "Toggle theme" }).click();
    const selected = await screen.findByRole("menuitemradio", { name: label });
    await waitFor(() =>
      expect(selected).toHaveAttribute("aria-checked", "true"),
    );
    expect(
      screen.getAllByRole("menuitemradio", { checked: true }),
    ).toHaveLength(1);

    const height = matchMedia("(hover: none) and (pointer: coarse)").matches
      ? 44
      : 32;
    await waitFor(() =>
      expect(selected.getBoundingClientRect().height).toBe(height),
    );
    expect(getComputedStyle(selected).paddingLeft).toBe("32px");
    const dot = selected.querySelector(
      '[data-slot="dropdown-menu-radio-item-indicator"] svg',
    );
    if (!dot) throw new Error("Missing selected theme dot");
    expect(dot.getBoundingClientRect().width).toBe(8);
    expect(dot.getBoundingClientRect().right).toBeLessThan(
      selected.getBoundingClientRect().left + 32,
    );
    expect(getComputedStyle(dot).fill).toBe(getComputedStyle(dot).color);

    await page.getByRole("menuitemradio", { name: nextLabel }).click();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(localStorage.getItem(storageKey)).toBe(nextLabel.toLowerCase());

    await page.getByRole("button", { name: "Toggle theme" }).click();
    await waitFor(() =>
      expect(
        screen.getByRole("menuitemradio", { name: nextLabel }),
      ).toHaveAttribute("aria-checked", "true"),
    );
    expect(
      screen.getAllByRole("menuitemradio", { checked: true }),
    ).toHaveLength(1);
    expect(consoleError.mock.calls.flat().join(" ")).not.toMatch(
      /uncontrolled.*controlled|controlled.*uncontrolled/,
    );
  },
);

it("keeps the theme group controlled when its menu mounts before the preference", async () => {
  const consoleError = vi.spyOn(console, "error");
  render(
    <ThemeProvider defaultTheme="system" storageKey={storageKey}>
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Account</DropdownMenuTrigger>
        <DropdownMenuContent>
          <ThemeMenuItems />
        </DropdownMenuContent>
      </DropdownMenu>
    </ThemeProvider>,
  );
  const system = await screen.findByRole("menuitemradio", { name: "System" });
  await waitFor(() => expect(system).toHaveAttribute("aria-checked", "true"));
  expect(consoleError.mock.calls.flat().join(" ")).not.toMatch(
    /uncontrolled.*controlled|controlled.*uncontrolled/,
  );
});
