import { tavily } from "@tavily/core";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

const tools = [
  {
    type: "function",
    function: {
      name: "webSearch",
      description: "Search the web for up-to-date information",
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

// Persistent conversation memory
const messages = [
  {
    role: "system",
    content: "You are a helpful assistant. Use webSearch when needed.",
  },
];

async function runBot() {
  while (true) {
    const userInput = prompt("\nAsk something (type 'exit' to quit): ");

    if (!userInput) continue;
    if (userInput.toLowerCase() === "exit") break;

    messages.push({
      role: "user",
      content: userInput,
    });

    let toolLoop = true;

    while (toolLoop) {
      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        temperature: 0,
        messages,
        tools,
        tool_choice: "auto",
      });

      const message = response.choices[0].message;

      // If no tool call → final answer
      if (!message.tool_calls) {
        console.log("\n=== ASSISTANT ===");
        console.log(message.content);

        messages.push({
          role: "assistant",
          content: message.content,
        });

        toolLoop = false;
        break;
      }

      // Add assistant tool request
      messages.push({
        role: "assistant",
        content: message.content || null,
        tool_calls: message.tool_calls,
      });

      // Execute tools
      for (const toolCall of message.tool_calls) {
        const { name, arguments: args } = toolCall.function;

        let result = "Tool execution failed";

        try {
          const parsedArgs = JSON.parse(args || "{}");

          if (name === "webSearch") {
            const search = await tvly.search(parsedArgs.query);
            result = search.results
              .map((r) => r.content)
              .join("\n\n");
          }
        } catch (err) {
          result = `Error: ${err.message}`;
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    }
  }

  console.log("Bot stopped.");
}

runBot().catch(console.error);