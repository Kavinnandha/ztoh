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

    // UPDATED PROMPT HERE
    const prompt = `
      You are a helpful AI assistant for a website.
      The user is currently viewing a page with the following content:
      
      ---
      ${pageContent}
      ---
      
      User Question: ${userQuestion}
      
      INSTRUCTIONS:
      - Answer the user's question using ONLY the information available in the page content.
      - If the requested information is not present on the page, provide a positive and helpful redirection.
      - Do NOT use negative phrases like "I am unable to", "not available", or "cannot find".
      - Instead, confidently guide the user with phrases like:
          • "For details on this, please contact us at ..."
          • "You can get complete information by reaching out to ..."
      
      Keep your response concise, friendly, and helpful.
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