import { tavily } from "@tavily/core";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Create clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Define tool for web search
const tools = [
  {
    type: "function",
    function: {
      name: "webSearch",
      description: "Search the web",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
        },
        required: ["query"],
      },
    },
  },
];

// Chat memory
const messages = [
  { role: "system", content: "You are helpful. Use webSearch if needed." },
];

async function runBot() {
  while (true) {
    const input = prompt("Ask something (exit to quit): ");
    if (!input) continue;
    if (input.toLowerCase() === "exit") break;

    messages.push({ role: "user", content: input });

    while (true) {
      const res = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages,
        tools,
        tool_choice: "auto",
      });

      const msg = res.choices[0].message;

      // If no tool call → print answer
      if (!msg.tool_calls) {
        console.log("\nAssistant:", msg.content);
        messages.push({ role: "assistant", content: msg.content });
        break;
      }

      // Add assistant tool request
      messages.push(msg);

      // Execute each tool call
      for (const call of msg.tool_calls) {
        const args = JSON.parse(call.function.arguments || "{}");

        let result = "Error";

        if (call.function.name === "webSearch") {
          const search = await tvly.search(args.query);
          result = search.results.map(r => r.content).join("\n\n");
        }

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: result,
        });
      }
    }
  }
}

runBot();