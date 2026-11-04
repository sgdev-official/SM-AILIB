# sm-ailib — architecture

## Scope

Local MCP + skill bundle that gives text-only AI models three capabilities:
persistent memory, zero-cost image generation, and granular token budgets.

## Components

| Module | File | Role |
|---|---|---|
| Server | `server.js` | MCP stdio server (SDK): save / recall / img / level tools. Data in `<SM_AILIB_HOME>/memory.json`, level in `<SM_AILIB_HOME>/level.json`. |
| Plugin | `plugin/server.js` | OpenCode server plugin: `ctx.session.hook("context")` reads the level file and sets `event.options.maxTokens` + pushes the level rules into `event.system`. |
| Skill | `skill/SKILL.md` | Client-side trigger instructions for `@sm-ailib_save`, `@sm-ailib_img`, `@sm-ailib_<level>`. |
| Installer | `install.mjs` | Writes OpenCode MCP/plugin config, skill dir, Claude Desktop config. |
| Test | `test/sm-ailib.test.mjs` | MCP stdio client: listTools, level, save, recall, img. |

## Data flow

- User text → client (OpenCode/Claude) → skill triggers → MCP tool (`sm_ailib_save` writes JSON memory; `sm_ailib_recall` reads) or `sm_ailib_img` (Pollinations fetch → local file) or `sm_ailib_level` (state file → `maxTokens`).
- OpenCode prompt admission → plugin context hook → level rules + maxTokens override → model call.

## Modes

Level table maps to per-level `maxTokens` and rules strings (0: Lazy 256; 1: Minimal 2048; 2: Minimal 4096; 3: Standard 8192; 4: Reasoning 16384; 5: Audit 32768).

## Boundaries / limits

- Memory capped at 200 entries; images stored under `<SM_AILIB_HOME>/images/`.
- Image generation delegates to Pollinations AI; no local model.
- Token enforcement is semantic (`maxTokens`); provider-specific support varies.
