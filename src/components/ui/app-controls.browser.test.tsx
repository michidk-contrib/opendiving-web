import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { page, userEvent } from "vitest/browser";
import { Plus } from "lucide-react";
import { Button, ButtonLink } from "./button";
import { Label } from "./label";
import { Switch } from "./switch";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "./dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { DatePicker } from "./date-picker";
import { DateTimePicker } from "./date-time-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import "@/app/globals.css";

afterEach(() => document.documentElement.classList.remove("dark"));

for (const dark of [false, true]) {
  describe(dark ? "dark app controls" : "light app controls", () => {
    it("keeps explicit icon sizes, spacing, and outline background", () => {
      document.documentElement.classList.toggle("dark", dark);
      render(
        <>
          <Button variant="outline" size="sm">
            <Plus data-testid="icon" className="mr-2 h-5 w-5" />
            Add
          </Button>
          <div data-testid="background" className="bg-background" />
        </>,
      );
      const button = screen.getByRole("button", { name: "Add" });
      const icon = screen.getByTestId("icon");
      expect(getComputedStyle(icon).width).toBe("20px");
      expect(getComputedStyle(icon).height).toBe("20px");
      expect(getComputedStyle(icon).marginRight).toBe("8px");
      expect(getComputedStyle(button).columnGap).toBe("normal");
      expect(getComputedStyle(button).backgroundColor).toBe(
        getComputedStyle(screen.getByTestId("background")).backgroundColor,
      );
      expect(getComputedStyle(button).translate).toBe("none");
    });

    it("keeps the off color and moves the switch thumb the full 16px", async () => {
      document.documentElement.classList.toggle("dark", dark);
      render(
        <>
          <Switch aria-label="Remember device" />
          <div data-testid="off" className="bg-muted-foreground" />
        </>,
      );
      const control = screen.getByRole("switch");
      expect(control.getBoundingClientRect().width).toBe(36);
      expect(control.getBoundingClientRect().height).toBe(20);
      expect(getComputedStyle(control).backgroundColor).toBe(
        getComputedStyle(screen.getByTestId("off")).backgroundColor,
      );
      await page.getByRole("switch").click();
      const thumb = control.querySelector('[data-slot="switch-thumb"]');
      if (!thumb) throw new Error("Missing switch thumb");
      await waitFor(() =>
        expect(getComputedStyle(thumb).translate).toBe("16px"),
      );
    });
  });
}

it("keeps label prose inline", () => {
  render(
    <Label>
      Read <a href="/privacy">privacy policy</a> before continuing.
    </Label>,
  );
  expect(getComputedStyle(screen.getByText(/Read/)).display).toBe("inline");
});

it("gives link buttons native navigation semantics and Enter handling", async () => {
  const click = vi.fn((event: React.MouseEvent) => event.preventDefault());
  render(
    <ButtonLink href="/dives" onClick={click}>
      Logbook
    </ButtonLink>,
  );
  const link = screen.getByRole("link", { name: "Logbook" });
  expect(link).toHaveAttribute("href", "/dives");
  await act(async () => link.focus());
  await userEvent.keyboard(" ");
  expect(click).not.toHaveBeenCalled();
  await userEvent.keyboard("{Enter}");
  expect(click).toHaveBeenCalledOnce();
});

it("lets application backdrop classes override geometry and color", async () => {
  render(
    <Dialog open>
      <DialogOverlay className="fixed inset-0 h-screen bg-transparent" />
      <DialogContent>
        <DialogTitle>Settings</DialogTitle>
      </DialogContent>
    </Dialog>,
  );
  await screen.findByRole("dialog");
  const overlay = document.querySelector('[data-slot="dialog-overlay"]');
  if (!overlay) throw new Error("Missing backdrop");
  expect(getComputedStyle(overlay).position).toBe("fixed");
  expect(getComputedStyle(overlay).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(overlay.getBoundingClientRect().height).toBe(window.innerHeight);
});

it("preserves destructive text while a menu item is highlighted", async () => {
  render(
    <DropdownMenu open>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        <div data-testid="red" className="text-destructive" />
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const item = await screen.findByRole("menuitem", { name: "Delete" });
  await page.getByRole("menuitem", { name: "Delete" }).hover();
  await waitFor(() => expect(item).toHaveAttribute("data-highlighted"));
  expect(getComputedStyle(item).color).toBe(
    getComputedStyle(screen.getByTestId("red")).color,
  );
});

it("preserves icon row spacing, label padding, and muted separators", async () => {
  render(
    <DropdownMenu open>
      <DropdownMenuTrigger>Account</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuItem>
            <Plus className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div data-testid="muted" className="bg-muted" />
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const item = await screen.findByRole("menuitem", { name: "Profile" });
  expect(getComputedStyle(item).columnGap).toBe("0px");
  expect(getComputedStyle(item).paddingLeft).toBe("8px");
  const icon = item.querySelector("svg");
  if (!icon) throw new Error("Missing menu icon");
  expect(getComputedStyle(icon).marginRight).toBe("8px");
  const label = screen.getByText("Appearance");
  expect(getComputedStyle(label).paddingLeft).toBe("8px");
  expect(getComputedStyle(label).paddingTop).toBe("6px");
  expect(getComputedStyle(screen.getByRole("separator")).backgroundColor).toBe(
    getComputedStyle(screen.getByTestId("muted")).backgroundColor,
  );
});

it("keeps popovers at least 16px from the viewport edge", async () => {
  await page.viewport(393, 800);
  render(
    <Popover open>
      <PopoverTrigger className="fixed right-0 top-10">
        Notifications
      </PopoverTrigger>
      <PopoverContent collisionPadding={16} align="end" className="w-80">
        Updates
      </PopoverContent>
    </Popover>,
  );
  const popup = await screen.findByText("Updates");
  await waitFor(() =>
    expect(popup.getBoundingClientRect().right).toBeLessThanOrEqual(377),
  );
  expect(popup.getBoundingClientRect().left).toBeGreaterThanOrEqual(16);
});

for (const Picker of [DatePicker, DateTimePicker]) {
  it(`keeps the same ${Picker.name} calendar open when focus returns to its text field`, async () => {
    render(<Picker value="2024-06-01" onChange={() => {}} />);
    await page.getByRole("textbox").click();
    const calendar = await screen.findByRole("grid");
    const day = calendar.querySelector<HTMLButtonElement>(
      "button:not([disabled])",
    );
    if (!day) throw new Error("Missing calendar day");
    await act(async () => day.focus());
    const popup = calendar.closest('[role="dialog"]');
    const closed = vi.fn();
    const observer = new MutationObserver((records) => {
      for (const record of records)
        if (record.attributeName === "data-closed") closed();
    });
    if (!popup) throw new Error("Missing calendar popup");
    observer.observe(popup, { attributes: true });
    try {
      await act(async () => screen.getByRole("textbox").focus());
      await waitFor(() => expect(screen.getByRole("textbox")).toHaveFocus());
      expect(popup).toHaveAttribute("data-open");
      expect(closed).not.toHaveBeenCalled();
      expect(screen.getByRole("grid")).toBe(calendar);
    } finally {
      observer.disconnect();
    }
  });
}
