import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";
import { type Lead, type InsertLead } from "@shared/schema";

// Initialize Anthropic client (will fail gracefully if key is missing)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "mock-key",
});

/**
 * Service to handle automated marketing activities
 */
export class MarketingService {
  private isDryRun = process.env.AI_DRY_RUN === "true";

  /**
   * Process a list of leads (e.g. from an Apollo CSV)
   */
  async importLeads(csvData: any[]): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;

    for (const row of csvData) {
      try {
        const lead: InsertLead = {
          email: row.email || row.Email,
          firstName: row.firstName || row.First_Name || row['First Name'],
          lastName: row.lastName || row.Last_Name || row['Last Name'],
          company: row.company || row.Company || row['Company Name'],
          location: row.location || row.City || row.Country || row.Location,
          linkedinUrl: row.linkedinUrl || row.Linkedin_Url || row['LinkedIn URL'],
          skills: row.skills || row.Keywords || row.Industry,
          source: 'APOLLO_CSV'
        };

        if (lead.email) {
          await storage.createLead(lead);
          imported++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error("Error importing lead row:", err);
        skipped++;
      }
    }

    return { imported, skipped };
  }

  /**
   * AI-powered personalization logic using Claude 3 Haiku
   * Professional "Head of Growth" persona
   */
  async generatePersonalizedMessage(lead: Lead): Promise<{ subject: string; body: string }> {
    // If no API key, return a mock
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_key_here") {
      return {
        subject: `PAX Escrow for ${lead.firstName || 'your business'}`,
        body: `Hi ${lead.firstName || "there"},\n\nI noticed your work in ${lead.location || "the industry"}. We're building PAX to ensure freelancers like you get paid securely and on time.\n\nBest,\nHead of Growth @ PAX`
      };
    }

    const systemPrompt = `You are the Head of Growth at PAX, a high-end escrow platform for global talent. 
Your tone is extremely professional, direct, and zero-risk focused. 
You are reaching out to high-value leads from Apollo.io. 
Your goal is to solve their payment security problems. 
Do NOT mention being "Udyam verified" or specific local certifications.
Keep the email under 4 sentences.`;

    const userPrompt = `Lead Name: ${lead.firstName} ${lead.lastName}
Company: ${lead.company}
Skills/Industry: ${lead.skills}
Location: ${lead.location}

Write a personalized subject line and email body. Return it in this JSON format:
{
  "subject": "string",
  "body": "string"
}`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const content = response.content[0].type === "text" ? response.content[0].text : "";
      const parsed = JSON.parse(content);

      if (this.isDryRun) {
        console.log(`[AI_DRY_RUN] To: ${lead.email}`);
        console.log(`Subject: ${parsed.subject}`);
        console.log(`Body: ${parsed.body}\n-------------------`);
      }

      return parsed;
    } catch (err) {
      console.error("AI Generation Error:", err);
      throw new Error("Failed to generate personalized message");
    }
  }
}

export const marketingService = new MarketingService();
