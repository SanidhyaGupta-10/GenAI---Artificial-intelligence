// console.log("GenAI is fun!");

import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const groq = new Groq({
    apiKey: GROQ_API_KEY,
});

async function main() {
    const chatCompletion = await groq.chat.completions
        .create({
            // Temperature is a parameter that controls the randomness of the output 
            temperature: 0.9,
            // Top P (nucleus sampling) is a parameter that controls the diversity of the output 
            // top_p: 0.9,
            // Stop is a parameter that controls the end of the output 
            stop: ['11'],
            // Max Completion Tokens is a parameter that controls the maximum number of tokens in the output 
            max_completion_tokens: 100,
            // Model Selection 
            model: "llama-3.3-70b-versatile",
            // messages is an array of objects 
            messages: [
                // System Prompting 
                {
                    role: "system",
                    content: "You are Jarvis, a helpful assistant."
                },
                // User Prompting 
                {
                    role: "user",
                    content: "Hello What's up?"
                }
            ]
        });
    console.log(chatCompletion?.choices?.[0]?.message?.content);
};

main();
