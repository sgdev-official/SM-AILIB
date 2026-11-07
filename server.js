#!/usr/bin/env node
// sm-ailib - cross-client MCP memory / image / token-budget server.
// Transport: stdio (OpenCode, Claude Desktop/CLI).

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";

const HOME = process.env.SM_AILIB_HOME ? path.resolve(process.env.SM_AILIB_HOME) : path.join(os.homedir(), ".sm-ailib");
const MEMORY_FILE = path.join(HOME, "memory.json");
const MEMORY_CAP = 200;

const LEVELS = [
  { level: 0, key: "lazy", label: "Strict Lazy", maxTokens: 256, rules: "You are in Strict Lazy mode (sm-ailib level 0). Respond in one sentence. No prose, no summaries, no questions. Execute the task directly. No extra context, no audit." },
  { level: 1, key: "minimal", label: "Minimal Senior Dev", maxTokens: 2048, rules: "You are in Minimal Senior Dev mode (sm-ailib level 1). Direct code edits, no wall of text. Only what the task requires, no commentary." },
  { level: 2, key: "minimal", label: "Minimal Senior Dev", maxTokens: 4096, rules: "You are in Minimal Senior Dev mode (sm-ailib level 2). Direct code edits, no wall of text. Only what the task requires, no commentary." },
  { level: 3, key: "standard", label: "Standard", maxTokens: 8192, rules: "You are in Standard mode (sm-ailib level 3). Balanced output, clear reasoning before code, no audit noise." },
  { level: 4, key: "reasoning", label: "Maximum Reasoning", maxTokens: 16384, rules: "You are in Maximum Reasoning mode (sm-ailib level 4). Deep step-by-step reasoning, full context, for complex system engineering tasks." },
  { level: 5, key: "audit", label: "Maximum Audit", maxTokens: 32768, rules: "You are in Maximum Audit mode (sm-ailib level 5). Full reasoning plus audit: consider risks, edge cases, and correctness before and after changes." },
];

function readJSON(file, fallback) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } }
function writeJSON(file, data) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data)); }
function readMemory() { return readJSON(MEMORY_FILE, { entries: [] }); }
function writeMemory(m) { writeJSON(MEMORY_FILE, m); }
const textResult = (text) => ({ content: [{ type: "text", text }] });

async function main() {
  const server = new McpServer({
    name: "sm-ailib",
    version: "1.0.0",
    instructions: "sm-ailib: persistent memory (@sm_ailib_save/@sm_ailib_recall), zero-cost image generation (@sm_ailib_img), token-budget modes (@sm-ailib_0..5). Follow the sm-ailib skill when present.",
  });

  server.registerTool("sm_ailib_save", {
    description: "Persist user-requested durable memory/context into the sm-ailib memory store. Call when the user says remember/store/append context.",
    inputSchema: { content: z.string() },
  }, async ({ content }) => {
    const mem = readMemory();
    const entries = Array.isArray(mem.entries) ? mem.entries : [];
    entries.push({ id: randomUUID(), ts: new Date().toISOString(), content });
    writeMemory({ entries: entries.slice(-MEMORY_CAP) });
    return { content: [{ type: "text", text: JSON.stringify({ saved: true, count: entries.slice(-MEMORY_CAP).length }) }] };
  });

  server.registerTool("sm_ailib_recall", {
    description: "Recall saved sm-ailib memory entries. Call with a query when context is needed.",
    inputSchema: {
      query: z.string().optional(),
      limit: z.number().optional(),
    },
  }, async ({ query, limit }) => {
    const mem = readMemory();
    const entries = Array.isArray(mem.entries) ? mem.entries : [];
    const q = (query || "").toLowerCase();
    const n = Math.max(1, limit || 5);
    const hits = (q ? entries.filter((e) => String(e.content || "").toLowerCase().includes(q)) : entries).slice(-n);
    return { content: [{ type: "text", text: JSON.stringify({ entries: hits.map((e) => ({ id: e.id, ts: e.ts, content: e.content })), count: hits.length }) }] };
  });

  server.registerTool("sm_ailib_img", {
    description: "Zero-cost image generation: renders a prompt via Pollinations AI and saves it locally.",
    inputSchema: { prompt: z.string() },
  }, async ({ prompt }) => {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
    const res = await fetch(url);
    if (!res.ok) return { content: [{ type: "text", text: JSON.stringify({ error: "pollinations_failed", status: res.status }) }] };
    const buf = Buffer.from(await res.arrayBuffer());
    const dir = path.join(HOME, "images");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${randomUUID()}.jpg`);
    fs.writeFileSync(file, buf);
    const md = `![${prompt}](${url})`;
    return { content: [{ type: "text", text: JSON.stringify({ markdown: md, savedPath: file, url }) }] };
  });

  server.registerTool("sm_ailib_level", {
    description: "Get or set the sm-ailib token-budget mode (0-5).",
    inputSchema: { level: z.number().int().min(0).max(5).optional() },
  }, async ({ level }) => {
    const current = readJSON(path.join(HOME, "level.json"), { level: 3 });
    const next = typeof level === "number" ? level : (typeof current.level === "number" ? current.level : 3);
    const rec = LEVELS.find((l) => l.level === next) || LEVELS[LEVELS.length - 1];
    if (typeof level === "number") writeJSON(path.join(HOME, "level.json"), { level: next });
    return { content: [{ type: "text", text: JSON.stringify({ level: next, label: rec.label, maxTokens: rec.maxTokens, rules: rec.rules }) }] };
  });

  await server.connect(new StdioServerTransport());
}

main().catch((err) => { console.error("sm-ailib fatal", err); process.exit(1); });

