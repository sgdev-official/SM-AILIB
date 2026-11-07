#!/usr/bin/env node
// Installer for the sm-ailib bundle. Merges MCP + plugin config into the
// host apps, installs the skill, backs up existing files first.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const ROOT = "C:/Users/Shubhomoy/.sm-ailib";
const OPencode_HOME = path.join(os.homedir(), ".config/opencode");
const OPencode_CFG = path.join(OPencode_HOME, "opencode.json");
const SKILL_DIR = path.join(os.homedir(), ".agents/skills/sm-ailib");
const SKILL_SRC = path.join(ROOT, "skill/SKILL.md");
const PLUGIN_DIR = path.join(OPencode_HOME, "plugins/sm-ailib");
const PLUGIN_SRC = path.join(ROOT, "plugin/server.js");
const CLAUDE_CFG = path.join(os.homedir(), "AppData/Roaming/Claude/claude_desktop_config.json");

function backup(file) {
  if (fs.existsSync(file)) fs.copyFileSync(file, file + ".bak");
}

function readJSON(file, fallback) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } }
function writeJSON(file, data) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

const opencode = readJSON(OPencode_CFG, {});
opencode.mcp = opencode.mcp || {};
opencode.mcp.servers = opencode.mcp.servers || {};
opencode.mcp.servers["sm-ailib"] = {
  type: "local",
  command: ["node", path.join(ROOT, "server.js")],
  cwd: ".",
  environment: { SM_AILIB_HOME: path.join(ROOT) }, 
};
if (!Array.isArray(opencode.plugins)) opencode.plugins = [];
if (!opencode.plugins.includes("./plugins/sm-ailib")) opencode.plugins.push("./plugins/sm-ailib");

backup(OPencode_CFG);
writeJSON(OPencode_CFG, opencode);

fs.mkdirSync(SKILL_DIR, { recursive: true });
fs.copyFileSync(SKILL_SRC, path.join(SKILL_DIR, "SKILL.md"));

fs.mkdirSync(PLUGIN_DIR, { recursive: true });
fs.copyFileSync(PLUGIN_SRC, path.join(PLUGIN_DIR, "server.js"));

fs.mkdirSync(path.dirname(CLAUDE_CFG), { recursive: true });
fs.writeFileSync(CLAUDE_CFG, JSON.stringify({
  mcpServers: {
    "sm-ailib": { command: "node", args: [path.join(ROOT, "server.js")], env: { SM_AILIB_HOME: path.join(ROOT) } },
  },
}, null, 2));

console.log("sm-ailib installed");
console.log(" opencode config:", OPencode_CFG);
console.log(" skill:", path.join(SKILL_DIR, "SKILL.md"));
console.log(" plugin:", path.join(PLUGIN_DIR, "server.js"));
console.log(" claude config:", CLAUDE_CFG);
