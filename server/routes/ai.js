import express from "express";
import OpenAI from "openai";
import protect from "../middleware/authMiddleware.js";
import Student from "../models/Student.js";
import ChatSession from "../models/ChatSession.js";

const router = express.Router();

console.log("🔑 GROQ_API_KEY loaded:", process.env.GROQ_API_KEY ? "✅ Yes" : "❌ No");
if (process.env.GROQ_API_KEY) {
  console.log("   First 10 chars:", process.env.GROQ_API_KEY.slice(0, 10) + "...");
}

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

router.post("/chat", protect, async (req, res) => {
  try {
    // The protect middleware already gives us the student in req.user
    const student = req.user;
    const { message } = req.body;

    const systemPrompt = `
You are an AI assistant for a university student portal.

STUDENT DETAILS:
- Name: ${student.name}
- Registration: ${student.regNo}
- Course: ${student.course}
- Fees Balance: ${student.feesBalance}

YOUR JOB:
- Help with course registration, hostel booking, fee payments, password resets.
- Give clear, step‑by‑step guidance.
- Be friendly and professional.

HUMAN CONNECTION RULES:
- If the student **explicitly asks to speak with a human officer** or you **cannot resolve the issue**, you must output a message starting with "CONNECT_HUMAN:" followed by the department.
- Departments are: admissions, finance, ict, general.
- Choose the department based on the issue:
  - Admissions, course registration → admissions
  - Fees, payments, financial aid → finance
  - Technical problems, password reset, system errors → ict
  - Other or unclear → general

Example outputs:
- CONNECT_HUMAN:admissions
- CONNECT_HUMAN:finance
- CONNECT_HUMAN:ict
- CONNECT_HUMAN:general

Do NOT add any other text when you output CONNECT_HUMAN:...
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    let reply = response.choices[0].message.content;

    // Check for human connection request
    if (reply.startsWith("CONNECT_HUMAN:")) {
      const department = reply.split(":")[1].trim().toLowerCase();

      // Create a new chat session
      const session = new ChatSession({
        studentId: student._id,
        department,
        status: "pending",
      });
      await session.save();

      return res.json({
        type: "human",
        reply: `✅ You are being connected to a ${department} officer. You will be notified when they join the chat.`,
        sessionId: session._id,
      });
    }

    // Normal AI response
    res.json({ type: "ai", reply });
  } catch (error) {
    console.error("AI error:", error);
    if (error.status === 401 && error.error?.message === "Invalid API Key") {
      res.status(500).json({
        type: "error",
        reply: "Invalid Groq API key. Please check your GROQ_API_KEY environment variable.",
      });
    } else {
      res.status(500).json({ type: "error", reply: "AI service is temporarily unavailable." });
    }
  }
});

export default router;