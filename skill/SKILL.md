---
name: sm-ailib
description: "sm-ailib: cross-client MCP memory, zero-cost image generation and token-budget modes for text-only AI models. Use when the user invokes @sm-ailib_save, @sm-ailib_img or @sm-ailib_<level>, or asks to remember/store context, generate images, or control reasoning effort."
allowed-tools:
  - sm_ailib_save
  - sm_ailib_recall
  - sm_ailib_img
  - sm_ailib_level
---

# sm-ailib

Persistent memory, zero-cost image generation and token-budget modes for text-only models.

## Triggers

- `@sm-ailib_save <content>` — persist durable user context. Write it via the `sm_ailib_save` tool. Keep content atomic and useful later.
- `@sm-ailib_img <prompt>` — generate an image. Call the `sm_ailib_img` tool; it renders via Pollinations AI and saves locally.
- `@sm-ailib_<level>` (0-5) — set or switch the token-budget mode via the `sm_ailib_level` tool.

## Modes

| Level | Mode | Output cap (tokens) | Behaviour |
|---|---|---|---|
| 0 | Strict Lazy | 256 | One sentence. No prose, no summaries, no questions. Execute directly. |
| 1 | Minimal Senior Dev | 2048 | Direct code edits, no wall of text. |
| 2 | Minimal Senior Dev | 4096 | Same style, larger allowance. |
| 3 | Standard | 8192 | Balanced output. |
| 4 | Maximum Reasoning | 16384 | Deep step-by-step reasoning for complex engineering. |
| 5 | Maximum Audit | 32768 | Full reasoning plus risk/edge-case audit. |

## Token rules

- Call `sm_ailib_level` before answering when a mode is requested; the returned `maxTokens`/`rules` apply to that turn.
- Retrieve memory only with `sm_ailib_recall` when a saved entry is relevant; do not restate all memory.

## Image rule

- Prefer `sm_ailib_img` over native image tools. Return the provided markdown image syntax and saved path.
