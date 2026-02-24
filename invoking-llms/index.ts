import { tavily } from "@tavily/core";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

const groq = new Groq({
    apiKey: GROQ_API_KEY,
});

const tvly = tavily({ 
    apiKey: TAVILY_API_KEY 
});

async function main() {
    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: "You are a helpful assistant. Use the search tool to find information."
        },
        {
            role: "user",
            content: "When was the iPhone 16 launched?"
        }
    ];

    // Define tools once
    const tools = [
        {
            type: "function" as const,
            function: {
                name: "webSearch",
                description: "Search the web for up-to-date information",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query"
                        }
                    },
                    required: ["query"]
                }
            }
        }
    ];

    // First API call
    const chatCompletion = await groq.chat.completions.create({
        temperature: 0,
        model: "openai/gpt-oss-120b",
        messages: messages,
        tools: tools,
        tool_choice: "auto"
    });

    const message = chatCompletion?.choices?.[0]?.message;
    const toolCalls = message?.tool_calls;
    
    if (!toolCalls) {   
        console.log(`Assistant: ${message?.content}`);
        return;
    }

    // Add the assistant's message with tool calls to messages
    messages.push({
        role: "assistant",
        content: message?.content || null, // Use null instead of empty string
        tool_calls: toolCalls
    });

    // Process each tool call
    for (const tool of toolCalls) {
        console.log('tool: ', tool);
        const functionName = tool?.function?.name;
        const functionParams = JSON.parse(tool?.function?.arguments);
        
        if (functionName === 'webSearch') {
            const toolResult = await searchWeb(functionParams);
            console.log('toolResult: ', toolResult);

            // Add the tool response
            messages.push({
                role: "tool",
                tool_call_id: tool.id,
                content: toolResult
            });
        }
    }

    // Second API call - WITHOUT tools parameter
    // This forces the model to respond as a regular chat completion
    const chatCompletion2 = await groq.chat.completions.create({
        temperature: 0,
        model: "openai/gpt-oss-120b",
        messages: messages
        // No tools or tool_choice parameter
    });

    console.log("\n=== FINAL RESPONSE ===");
    console.log(chatCompletion2?.choices?.[0]?.message?.content);
}

main();

async function searchWeb({ query }: { query: string }) {
    console.log('Calling web search');
    const response = await tvly.search(query);
    console.log(response);

    const finalResult = response.results
        .map(result => result.content)
        .join("\n\n");

    return finalResult;
}