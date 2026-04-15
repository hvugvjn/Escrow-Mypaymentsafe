import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import { type User } from "@shared/schema";

// Initialize Gemini client (free tier)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");

/**
 * Service to handle Pax Lifecycle Marketing
 * Powered by Google Gemini 1.5 Flash
 */
export class MarketingService {
  private isDryRun = process.env.AI_DRY_RUN === "true";

  /**
   * Generates a personalized "Success Chime" for a registered user
   * Handles 3-day onboarding and Day 14 re-engagement
   */
  async generateUserChime(user: User, day: 1 | 2 | 3 | 14): Promise<{ subject: string; body: string }> {
    // Fallback if no API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "mock-key") {
      return this.getFallbackMessage(user, day);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const persona = `You are the User Success Lead at PAX, a premium global escrow platform. 
Your tone is professional, helpful, and results-oriented. 
Your goal is to ensure the user understands how to safely use PAX for high-value projects.
Avoid mention of local Indian certifications (Udyam). Focus on global trust and security.`;

    let context = "";
    if (day === 1) {
      context = "This is Day 1 (Welcome). Explain how Pax works: Safe milestones, secure escrow, and direct chat. Keep it and a feature overview.";
    } else if (day === 2) {
      context = `This is Day 2 (Personalized). Focus on their role as a ${user.role || 'Member'}.
      If they are a CLIENT: Explain how to fund their first project with zero risk.
      If they are a TALENT: Explain how to secure their payment before they start work.
      Profile Progress: ${user.profileCompleted ? 'Complete' : 'Incomplete'}.`;
    } else if (day === 3) {
      context = "This is Day 3 (Trust). Focus on the 'Pax Guarantee'—how we protect both sides and handle disputes fairly. Explain the escrow security logic.";
    } else if (day === 14) {
      context = "This is Day 14 (Re-engagement). The user has been inactive. Highlight the benefits: 'People are benefiting day by day from Pax security.' Encourage them to return and start a new project.";
    }

    const prompt = `${persona}
    
    Target User: ${user.firstName || 'Pax Member'}
    Role: ${user.role}
    Phase: ${context}

    Write a high-end email subject and body (under 4 sentences). Return it strictly in this JSON format:
    {
      "subject": "string",
      "body": "string"
    }`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Clean up markdown code blocks if Gemini adds them
      if (text.startsWith("```")) {
        text = text.replace(/^```json/, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(text);

      if (this.isDryRun) {
        console.log(`[PAX_GROWTH_DRY_RUN] To: ${user.email} (Day ${day})`);
        console.log(`Subject: ${parsed.subject}`);
        console.log(`Body: ${parsed.body}\n-------------------`);
      }

      return parsed;
    } catch (err) {
      console.error("Gemini Generation Error:", err);
      return this.getFallbackMessage(user, day);
    }
  }

  private getFallbackMessage(user: User, day: number) {
    if (day === 1) {
      return {
        subject: "Welcome to PAX – Secure Your First Project",
        body: `Hi ${user.firstName || 'there'},\n\nWelcome to Pax, the secure milestone escrow platform. You can now create projects, manage milestones, and ensure zero-risk payments.\n\nBest,\nSuccess Team @ PAX`
      };
    }
    // Simple fallback for other days
    return {
      subject: "Boosting your success on PAX",
      body: `Hi ${user.firstName || 'there'},\n\nWe noticed you haven't completed your profile yet. Finishing it helps you secure better projects on Pax.\n\nBest,\nSuccess Team @ PAX`
    };
  }
}

export const marketingService = new MarketingService();
