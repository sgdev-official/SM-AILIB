# sm-ailib — Install Guide

Full install guide for the sm-ailib MCP bundle (memory + images + token modes for text-only AI).

## 0. What you install

- `server.js` — MCP server (Node + `@modelcontextprotocol/sdk`, stdio).
- `plugin/server.js` — OpenCode plugin: enforces per-mode `maxTokens` + system rules via `session.hook("context")`.
- `skill/SKILL.md` — Skill with triggers, modes, token rules, image rule.
- `install.mjs` — one-shot installer that merges MCP/plugin config, installs skill + plugin, writes Claude config.

## 1. Prerequisites

- Node.js 18+ (`node --version`).
- The bundle lives at `SM_AILIB_HOME` (default: `C:\Users\Shubhomoy\.sm-ailib`).

```sh
cd C:\Users\Shubhomoy\.sm-ailib
npm install
node server.js
```

Server starts on stdio (MCP transport) — no HTTP port needed.

## 2. OpenCode

### MCP server

Add to `~/.config/opencode/opencode.json` (or your OpenCode global config):

```jsonc
{
  "mcp": {
    "servers": {
      "sm-ailib": {
        "type": "local",
        "command": ["node", "C:\\Users\\Shubhomoy\\.sm-ailib\\server.js"],
        "cwd": "C:\\Users\\Shubhomoy\\.sm-ailib",
        "environment": {
          "SM_AILIB_HOME": "C:\\Users\\Shubhomoy\\.sm-ailib"
        }
      }
    }
  }
}
```

### Plugin

Add to the `plugins` array:

```jsonc
{ "path": "./plugins/sm-ailib" }
```

Plugin entry: `C:\Users\Shubhomoy\.sm-ailib\plugin\server.js`.

### Skill

Installed to the agent skill dir, e.g. `~/.agents/skills/sm-ailib/SKILL.md`.

### Restart + verify

- Restart OpenCode (`opencode` CLI).
- Check MCP status: the `sm-ailib` server should show **connected**.
- Tools available: `sm_ailib_save`, `sm_ailib_recall`, `sm_ailib_img`, `sm_ailib_level`.

## 3. Claude Code / Claude Desktop

### Claude Code (CLI)

```sh
claude mcp add sm-ailib --env SM_AILIB_HOME=/Users/Shubhomoy/.sm-ailib -- node /Users/Shubhomoy/.sm-ailib/server.js
```

### Claude Desktop / manual JSON

`config/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sm-ailib": {
      "command": "node",
      "args": ["/Users/Shubhomoy/.sm-ailib/server.js"],
      "env": {
        "SM_AILIB_HOME": "/Users/Shubhomoy/.sm-ailib"
      }
    }
  }
}
```

Restart the client, then run `/mcp` (Claude) or list tools to verify.

## 4. Modes quick reference

| Mode | Alias | maxTokens | Character |
|---|---|---|---|
| 0 | Strict Lazy | 256 | One sentence. |
| 1 | Minimal Senior Dev | 2048 | Direct code edits, no fluff. |
| 2 | Minimal Senior Dev | 4096 | Deeper edits. |
| 3 | Standard | 8192 | Balanced. |
| 4 | Maximum Reasoning | 16384 | Full reasoning. |
| 5 | Maximum Audit | 32768 | Full reasoning + audit. |

## 5. Deploy the landing page (static)

The sm-ailib landing page lives at `plugin/website/index.html` (black + yellow, glowing rotating rings, frosted glass, Material Symbols icons).

Deploy as a static site (Surge example):

```sh
mkdir -p /tmp/sma-ilib-site
cp plugin/website/index.html /tmp/sma-ilib-site/index.html
surge /tmp/sma-ilib-site sm-ailib.sgdev.qd.je
```

## 6. Test

```sh
node test/sm-ailib.test.mjs
```

All four tools should pass.
