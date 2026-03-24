import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { topic, difficulty, count } = await req.json();

    if (!topic || !difficulty || !count) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `Generate exactly ${count} multiple choice questions about "${topic}" at a "${difficulty}" difficulty level.
Respond ONLY with a raw JSON array of objects. Do not include markdown code block formatting like \`\`\`json.
Each object must have this exact structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The exact string from options that is correct"
}`;

    // TEMPORARILY DISABLED TO SAVE QUOTA
    const questions = [
      {
        question: `Mock Question 1 about ${topic} (${difficulty})`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A"
      },
      {
        question: `Mock Question 2 about ${topic} (${difficulty})`,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: "Option 2"
      }
    ];

    /*
    let geminiError = "API key not set";

    // Try Google AI Studio first
    const googleApiKey = process.env.GEMINI_API_KEY;
    if (googleApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(googleApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        // Clean markdown formatting if model didn't listen
        const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        questions = JSON.parse(cleanText);
        console.log("Successfully used Google Gemini API.");
      } catch (err) {
        geminiError = err.message;
        console.error("Google API failed, falling back to Groq.", err.message);
      }
    }

    // Fallback to Groq
    if (!questions) {
      const groqApiKey = process.env.GROQ_KEY;
      if (!groqApiKey) {
        throw new Error("No available API keys worked.");
      }
      try {
        const groq = new Groq({ apiKey: groqApiKey });
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.1-8b-instant", // Using a fast/available model
          temperature: 0.5,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "[]";
        const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        questions = JSON.parse(cleanText);
        console.log("Successfully used Groq API as fallback.");
      } catch (groqErr) {
        throw new Error(`Gemini Error: ${geminiError} | Groq Error: ${groqErr.message}`);
      }
    }
    */

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Generate API Error:", error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
