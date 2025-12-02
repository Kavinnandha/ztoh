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
      You are answering questions based *only* on the provided page content below.

      ---
      ${pageContent}
      ---
      
      User Question: ${userQuestion}
      
      **INSTRUCTIONS:**
      1. **Search:** Check if the answer exists in the content above.
      2. **Found:** If the answer is present, answer clearly.
      3. **Not Found:** If the answer is NOT in the content, **do not** say "it is not mentioned" or "I don't know". 
         Instead, follow this strict format:
         
         a) Extract the **core topic** from the user's question (e.g., convert "what is the course timing?" to "course timing").
         b) Find the phone number and email in the text.
         c) Output the response using this exact template:
            "Please contact us directly on [Phone] or [Email] for details about [Topic]."

      **Example of Not Found Behavior:**
      - User asks: "What are the fees?"
      - Content: (Fees are missing, but phone is 555-0199)
      - Your Answer: "Please contact us directly on 555-0199 for details about the fees."
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