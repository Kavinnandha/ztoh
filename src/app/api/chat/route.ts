import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages, pageContent } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const lastMessage = messages[messages.length - 1];
        const userQuestion = lastMessage.content;

        const prompt = `
      You are a helpful AI assistant for a website.
      The user is currently viewing a page with the following content:
      
      ---
      ${pageContent}
      ---
      
      User Question: ${userQuestion}
      
      Answer the user's question based on the page content provided above. 
      If the answer is not in the page content, you can use your general knowledge but mention that it's not explicitly on the page.
      Keep your answer concise and helpful.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ role: "assistant", content: text });
    } catch (error) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            { error: "Failed to process chat request" },
            { status: 500 }
        );
    }
}
