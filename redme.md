# sm-ailib — readme

Cross-client MCP + skill bundle giving text-only AI models memory, image generation, and token budgets.

## What it does

- **Memory**: `@sm-ailib_save <content>` persists; `@sm-ailib_recall <query>` retrieves.
- **Images**: `@sm_ailib_img <prompt>` → Pollinations AI → saved locally.
- **Modes**: `@sm-ailib_0` … `@sm-ailib_5` → token limits + system rules.

## Quickstart

```sh
cd /Users/Shubhomoy/.sm-ailib
npm install
node server.js          # MCP server (stdio) - run via OpenCode/Claude
node test/sm-ailib.test.mjs   # smoke test of all tools
node install.mjs        # write host configs (opencode, skill, plugin, claude desktop)
```

## Data

- Memory: `~/.sm-ailib/memory.json`
- Level: `~/.sm-ailib/level.json`
- Images: `~/.sm-ailib/images/`

## Limits

- Memory capped at 200 entries.
- Modes map to semantic `maxTokens` (provider support varies).
- Image generation depends on the Pollinations endpoint.

## Licence

Apache License 2.0 — see `licence.txt`.
