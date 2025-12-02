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
You are a friendly and helpful AI assistant for a website.
Answer questions based *only* on the page content provided below.

---
${pageContent}
---

User Question: ${userQuestion}

**INSTRUCTIONS:**

1. **Understand the user's intent:**
   - If the user sends a **greeting** ("hi", "hello", "hey", "good morning", etc.) or simple **small talk** ("how are you?", "what's up?", "what are you doing?"), reply in a warm, natural, conversational way.
   - Do **not** send them to contact support for greetings or small talk.

2. **If the user asks a real question:**
   - If the answer exists in the page content, respond clearly using that information.

3. **If the answer is NOT in the page content (and it's not small talk):**
   - Do **NOT** say "not mentioned" or "I don't know".
   - Instead:
      a) Identify the **main topic** from the question  
         (e.g., "What is the course timing?" → "course timing").
      b) Extract the phone number and email from the page content.
      c) Reply using this exact format:

         "Please contact us directly on [Phone] or [Email] for details about [Topic]."

**Examples:**
- User: "Hello"
  Assistant: "Hello! How can I help you today?"

- User: "Hi, what's up?"
  Assistant: "Hi there! I'm here and ready to help. What would you like to know?"

- User: "What are the fees?"
  (fees not in content)
  Assistant: "Please contact us directly on +91 95643 21000 or mathsmuthu.j@gmail.com for details about the fees."
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