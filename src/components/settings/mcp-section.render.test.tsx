import { beforeEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { McpSection } from "./mcp-section";

const state = vi.hoisted(() => ({
  instance: {
    config: null as { mcp_enabled: boolean } | null,
    isLoading: false,
  },
  getConnections: vi.fn(),
}));

vi.mock("@/hooks/useInstanceConfig", () => ({
  useInstanceConfig: () => state.instance,
}));
vi.mock("@/lib/api/mcp", () => ({
  mcpAPI: { getConnections: state.getConnections },
}));

beforeEach(() => {
  state.instance = { config: null, isLoading: false };
  state.getConnections.mockReset().mockResolvedValue([]);
});

it.each([
  ["off", { mcp_enabled: false }],
  // An API too old to carry the field has no MCP.
  ["not reported", {} as { mcp_enabled: boolean }],
])("is not found and asks nothing of the API where MCP is %s", (_, config) => {
  state.instance.config = config;
  render(<McpSection serverUrl="https://dive.example/api/v1/mcp" />);
  expect(
    screen.getByText("This instance does not offer MCP."),
  ).toBeInTheDocument();
  expect(state.getConnections).not.toHaveBeenCalled();
});

it("waits for the config before asking anything", () => {
  state.instance.isLoading = true;
  render(<McpSection serverUrl="https://dive.example/api/v1/mcp" />);
  expect(
    screen.queryByText("This instance does not offer MCP."),
  ).not.toBeInTheDocument();
  expect(state.getConnections).not.toHaveBeenCalled();
});

it("asks the connections endpoint when the config could not be read", async () => {
  render(<McpSection serverUrl="https://dive.example/api/v1/mcp" />);
  expect(
    await screen.findByText("No connected applications."),
  ).toBeInTheDocument();
  expect(
    screen.queryByText("This instance does not offer MCP."),
  ).not.toBeInTheDocument();
});

it("says MCP is unavailable when the config could not be read and the API has none", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  state.getConnections.mockRejectedValue({ response: { status: 404 } });
  render(<McpSection serverUrl="https://dive.example/api/v1/mcp" />);
  expect(await screen.findByText("MCP unavailable")).toBeInTheDocument();
});

it("offers the server address and connections where MCP is on", async () => {
  state.instance.config = { mcp_enabled: true };
  render(<McpSection serverUrl="https://dive.example/api/v1/mcp" />);
  expect(
    await screen.findByText("No connected applications."),
  ).toBeInTheDocument();
  expect(state.getConnections).toHaveBeenCalledTimes(1);
});
