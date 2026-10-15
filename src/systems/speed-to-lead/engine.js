/**
 * Signature System 1: The Speed-to-Lead Engine
 * Qualifies leads in sub-60 seconds, answers initial FAQs via RAG,
 * and generates a prioritized calendar booking slot.
 */

import { KnowledgeBase } from "../../core/rag.js";
import { Validator } from "../../core/validator.js";
import { defaultLLM } from "../../core/llm-provider.js";

export class SpeedToLeadEngine {
  constructor(options = {}) {
    this.clientName = options.clientName || "Apex Dental & Aesthetics";
    this.calendarUrl = options.calendarUrl || "https://cal.com/apex-demo/consultation";
    this.kb = new KnowledgeBase(options.knowledgeBase || [
      {
        title: "Pricing & Insurance",
        content: "We accept Delta Dental, Cigna, MetLife, and private pay. Consultations start at $150 or free with qualifying insurance.",
        tags: ["price", "insurance", "cost", "coverage"]
      },
      {
        title: "Working Hours & Location",
        content: "Open Mon-Fri 8am-6pm, Sat 9am-2pm. Located at 450 Lexington Ave, Suite 400.",
        tags: ["hours", "open", "location", "address", "saturday"]
      },
      {
        title: "Emergency Care",
        content: "Same-day emergency appointments are guaranteed if booked before 2pm.",
        tags: ["emergency", "urgent", "pain", "broken"]
      }
    ]);
    this.llm = options.llm || defaultLLM;
  }

  /**
   * Process inbound lead from Web Form, WhatsApp, or SMS
   */
  async processInquiry(leadPayload) {
    const startTime = Date.now();

    // 1. Sanitize & Normalize Inbound Data
    const contact = {
      name: Validator.sanitizeText(leadPayload.name || "Valued Client"),
      phone: Validator.normalizePhone(leadPayload.phone),
      email: Validator.isValidEmail(leadPayload.email) ? leadPayload.email.trim() : null,
      message: Validator.sanitizeText(leadPayload.message || ""),
      source: leadPayload.source || "web_form",
      serviceRequested: leadPayload.serviceRequested || "General Consultation",
      budget: leadPayload.budget || null
    };

    // 2. RAG Knowledge Retrieval for specific user questions
    const relevantDocs = this.kb.search(contact.message);
    const knowledgeContext = this.kb.formatContextForPrompt(relevantDocs);

    // 3. AI Lead Qualification & Response Generation
    const prompt = `
Inbound Lead:
Name: ${contact.name}
Phone: ${contact.phone}
Email: ${contact.email}
Requested Service: ${contact.serviceRequested}
Budget: ${contact.budget || "Not specified"}
User Message: "${contact.message}"

Company Knowledge Base:
${knowledgeContext}

Analyze the lead and return a JSON object with:
1. "qualified": boolean (true if genuine inquiry, not spam or job application)
2. "intentScore": number from 1 to 100
3. "intentLevel": "High" | "Medium" | "Low"
4. "reasoning": brief explanation of score
5. "faqAnswer": concise answer to any question asked in the message based on the knowledge base
6. "suggestedAction": "Book Call" | "Send Followup" | "Flag for Manual Review"
7. "draftResponse": A warm, professional, high-converting WhatsApp/SMS response under 100 words inviting them to book a time slot.
`;

    const systemInstruction = `You are the Speed-to-Lead AI assistant for ${this.clientName}. Your goal is to reply in seconds, answer user questions accurately using the knowledge base, qualify the lead, and secure an appointment.`;

    const fallbackHandler = () => {
      const isUrgent = /pain|emergency|asap|today|tomorrow|broken/i.test(contact.message);
      const isSpam = /crypto|seo service|guest post|backlink/i.test(contact.message);
      const intentScore = isSpam ? 10 : (isUrgent ? 95 : 82);

      let faqAnswer = "";
      if (relevantDocs.length > 0) {
        faqAnswer = relevantDocs[0].content;
      }

      const calLink = this._generateBookingLink(contact);

      const draftResponse = isSpam
        ? "Thank you for reaching out. We do not accept unsolicited solicitations."
        : `Hi ${contact.name.split(" ")[0]}! Thanks for contacting ${this.clientName}. ${faqAnswer ? faqAnswer + " " : ""}We'd love to get you on the schedule. You can pick a convenient time on our calendar here: ${calLink} — let us know if you need anything else!`;

      return {
        qualified: !isSpam,
        intentScore,
        intentLevel: intentScore > 80 ? "High" : (intentScore > 40 ? "Medium" : "Low"),
        reasoning: isUrgent ? "High urgency keywords detected in message." : "Clear customer inquiry matching services.",
        faqAnswer: faqAnswer || "Standard consultation available.",
        suggestedAction: isSpam ? "Flag for Manual Review" : "Book Call",
        draftResponse
      };
    };

    const aiAnalysis = await this.llm.completeJSON({
      prompt,
      systemInstruction,
      fallbackHandler
    });

    // 4. Generate Dynamic Booking URL with Prefilled Parameters
    const bookingLink = this._generateBookingLink(contact);

    // Ensure booking link is embedded in draft response if qualified
    let finalMessage = aiAnalysis.draftResponse;
    if (aiAnalysis.qualified && !finalMessage.includes("http")) {
      finalMessage += `\n\nBook your slot directly here: ${bookingLink}`;
    }

    const elapsedMs = Date.now() - startTime;

    return {
      success: true,
      executionTimeMs: elapsedMs,
      speedToLeadTargetMet: elapsedMs < 60000, // < 60 seconds guarantee
      lead: contact,
      qualification: {
        qualified: aiAnalysis.qualified,
        intentScore: aiAnalysis.intentScore,
        intentLevel: aiAnalysis.intentLevel,
        reasoning: aiAnalysis.reasoning,
        suggestedAction: aiAnalysis.suggestedAction
      },
      faqContextUsed: relevantDocs.map(d => d.title),
      bookingLink,
      outboundMessage: {
        channel: contact.source === "whatsapp" ? "WhatsApp" : "SMS/Email",
        recipient: contact.phone || contact.email,
        text: finalMessage.trim()
      }
    };
  }

  _generateBookingLink(contact) {
    const params = new URLSearchParams();
    if (contact.name) params.set("name", contact.name);
    if (contact.email) params.set("email", contact.email);
    if (contact.phone) params.set("phone", contact.phone);
    params.set("utm_source", "flow_forge_speed_to_lead");
    return `${this.calendarUrl}?${params.toString()}`;
  }
}
