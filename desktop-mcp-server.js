#!/usr/bin/env node

const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const robot = require("robotjs");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

const execFileAsync = promisify(execFile);

const server = new McpServer(
  {
    name: "opencode-desktop-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
      logging: {},
    },
  },
);

function toTextResult(payload, isError = false) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload),
      },
    ],
    isError,
  };
}

async function captureScreen() {
  const filePath = path.join(os.tmpdir(), `opencode-desktop-${Date.now()}.png`);

  try {
    // `gnome-screenshot` works in this Wayland session where ImageMagick `import` does not.
    await execFileAsync("gnome-screenshot", ["-f", filePath], { env: process.env });
    return await fs.readFile(filePath, { encoding: "base64" });
  } finally {
    await fs.rm(filePath, { force: true });
  }
}

server.tool("get_screen_size", "Gets the screen dimensions", {}, async () => {
  try {
    return toTextResult({ success: true, result: robot.getScreenSize() });
  } catch (error) {
    return toTextResult({ success: false, error: error.message }, true);
  }
});

server.tool("screen_capture", "Captures the current screen content", {}, async () => {
  try {
    const image = await captureScreen();
    return {
      content: [
        {
          type: "text",
          text: "Screenshot captured.",
        },
        {
          type: "image",
          mimeType: "image/png",
          data: image,
        },
      ],
    };
  } catch (error) {
    return toTextResult({ success: false, error: error.message }, true);
  }
});

server.tool(
  "keyboard_press",
  "Presses a keyboard key or key combination",
  {
    key: z.string().describe("Key to press (e.g., 'enter', 'a', 'control')"),
    modifiers: z.array(z.enum(["control", "shift", "alt", "command"]))
      .default([])
      .describe("Modifier keys to hold while pressing the key"),
  },
  async ({ key, modifiers = [] }) => {
    try {
      if (modifiers.length === 0) {
        robot.keyTap(key);
      } else {
        robot.keyTap(key, modifiers);
      }

      return toTextResult({ success: true });
    } catch (error) {
      return toTextResult({ success: false, error: error.message }, true);
    }
  },
);

server.tool(
  "keyboard_type",
  "Types text at the current cursor position",
  {
    text: z.string().describe("Text to type"),
  },
  async ({ text }) => {
    try {
      robot.typeString(text);
      return toTextResult({ success: true });
    } catch (error) {
      return toTextResult({ success: false, error: error.message }, true);
    }
  },
);

server.tool(
  "mouse_click",
  "Performs a mouse click",
  {
    button: z.enum(["left", "right", "middle"]).default("left").describe("Mouse button to click"),
    double: z.boolean().default(false).describe("Whether to perform a double click"),
  },
  async ({ button = "left", double = false }) => {
    try {
      robot.mouseClick(button, double);
      return toTextResult({ success: true });
    } catch (error) {
      return toTextResult({ success: false, error: error.message }, true);
    }
  },
);

server.tool(
  "mouse_move",
  "Moves the mouse to specified coordinates",
  {
    x: z.number().describe("X coordinate"),
    y: z.number().describe("Y coordinate"),
  },
  async ({ x, y }) => {
    try {
      robot.moveMouse(x, y);
      return toTextResult({ success: true });
    } catch (error) {
      return toTextResult({ success: false, error: error.message }, true);
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in desktop MCP:", error);
  process.exit(1);
});
