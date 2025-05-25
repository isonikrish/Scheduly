import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { nlp } = data;
    const now = new Date();
    //nlp is expected to be a natural language string like "tomorrow at 8 am"
    const prompt = `
You are a date extraction assistant. 
Given a natural language input describing a date and time (e.g., "tomorrow at 8 am") and the current date/time in Asia/Kolkata timezone, 
return ONLY the exact date and time as an ISO 8601 string in UTC format.

Do NOT return any code, explanations, or additional text.

Current date/time in Asia/Kolkata timezone: ${now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}

Input: "${nlp}"

Output (ISO 8601 UTC date/time string only):`;


    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanDate = response.trim();

    return NextResponse.json(
      {
        msg: cleanDate,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { msg: "Invalid format or internal error" },
      { status: 400 }
    );
  }
}
