import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({ command: "node", args: ["C:/Users/Shubhomoy/.sm-ailib/server.js"] });
const client = new Client({ name: "sm-ailib-test", version: "1.0.0" });
await client.connect(transport);

const tools = await client.listTools();
console.log("TOOLS:", tools.tools.map((t) => t.name).join(", "));

const level = await client.callTool({ name: "sm_ailib_level", arguments: {} });
console.log("LEVEL:", JSON.stringify(level));

const saved = await client.callTool({ name: "sm_ailib_save", arguments: { content: "User preference: prefer black and yellow, small repo, shipping fast." } });
console.log("SAVE:", JSON.stringify(saved));

const recalled = await client.callTool({ name: "sm_ailib_recall", arguments: { query: "black and yellow", limit: 5 } });
console.log("RECALL:", JSON.stringify(recalled));

const img = await client.callTool({ name: "sm_ailib_img", arguments: { prompt: "a minimal black and yellow abstract shape, flat design" } });
console.log("IMG:", JSON.stringify(img));

await client.close();
