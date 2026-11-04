import { Plugin } from "@opencode/plugin";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const LEVELS = [
  { level: 0, maxTokens: 256, rules: "You are in Strict Lazy mode (sm-ailib level 0). Respond in one sentence. No prose, no summaries, no questions. Execute the task directly. No extra context, no audit." },
  { level: 1, maxTokens: 2048, rules: "You are in Minimal Senior Dev mode (sm-ailib level 1). Direct code edits, no wall of text. Only what the task requires, no commentary." },
  { level: 2, maxTokens: 4096, rules: "You are in Minimal Senior Dev mode (sm-ailib level 2). Direct code edits, no wall of text. Only what the task requires, no commentary." },
  { level: 3, maxTokens: 8192, rules: "You are in Standard mode (sm-ailib level 3). Balanced output, clear reasoning before code, no audit noise." },
  { level: 4, maxTokens: 16384, rules: "You are in Maximum Reasoning mode (sm-ailib level 4). Deep step-by-step reasoning, full context, for complex system engineering tasks." },
  { level: 5, maxTokens: 32768, rules: "You are in Maximum Audit mode (sm-ailib level 5). Full reasoning plus audit: consider risks, edge cases, and correctness before and after changes." },
];

export default Plugin.define({
  id: "sm-ailib",
  setup(ctx) {
    return ctx.session.hook("context", (event) => {
      const home = process.env.SM_AILIB_HOME ? path.resolve(process.env.SM_AILIB_HOME) : path.join(os.homedir(), ".sm-ailib");
      const state = readJSON(path.join(home, "level.json"), { level: 3 });
      const rec = LEVELS.find((l) => l.level === (typeof state.level === "number" ? state.level : 3)) || LEVELS[3];
      event.options.maxTokens = rec.maxTokens;
      event.system.push({ type: "text", text: rec.rules });
    });
  },
});

function readJSON(file, fallback) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } }
