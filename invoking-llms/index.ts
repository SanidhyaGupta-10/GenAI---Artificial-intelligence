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
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: "Explain the importance of fast language models"
                }
            ]
        });
    console.log(chatCompletion?.choices?.[0]?.message?.content);
};

main();
