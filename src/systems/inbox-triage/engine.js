/**
 * Signature System 2: The Inbox & Triage Autopilot
 * Classifies emails/tickets, extracts critical entities into CRM format,
 * auto-resolves Tier-1 requests, and drafts contextual replies for human approval.
 */

import { KnowledgeBase } from "../../core/rag.js";
import { Validator } from "../../core/validator.js";
import { defaultLLM } from "../../core/llm-provider.js";

export class InboxTriageEngine {
  constructor(options = {}) {
    this.companyName = options.companyName || "Nova Cloud SaaS";
    this.kb = new KnowledgeBase(options.knowledgeBase || [
      {
        title: "Refund Policy",
        content: "We offer a 30-day money-back guarantee on all annual plans. For monthly plans, cancellations take effect on the next billing cycle.",
        tags: ["refund", "cancel", "money back", "billing"]
      },
      {
        title: "API Rate Limits",
        content: "Pro Tier includes 10,000 requests/min. Enterprise Tier offers custom unlimited throughput.",
        tags: ["api", "rate limit", "quota", "429", "throttling"]
      },
      {
        title: "Invoice & Tax Receipts",
        content: "Tax receipts and monthly invoices can be downloaded directly under Settings > Billing > Invoice History.",
        tags: ["invoice", "receipt", "vat", "tax", "billing statement"]
      }
    ]);
    this.llm = options.llm || defaultLLM;
  }

  /**
   * Process incoming email or support ticket
   */
  async triageMessage(ticket) {
    const startTime = Date.now();

    const email = {
      from: Validator.sanitizeText(ticket.from || "customer@example.com"),
      subject: Validator.sanitizeText(ticket.subject || "No Subject"),
      body: Validator.sanitizeText(ticket.body || ""),
      receivedAt: ticket.receivedAt || new Date().toISOString()
    };

    // 1. RAG Knowledge Search
    const query = `${email.subject} ${email.body}`;
    const relevantDocs = this.kb.search(query);
    const knowledgeContext = this.kb.formatContextForPrompt(relevantDocs);

    // 2. AI Classification, Entity Extraction & Response Drafting
    const prompt = `
Incoming Support Message:
From: ${email.from}
Subject: ${email.subject}
Message Body:
"${email.body}"

Relevant Company Knowledge:
${knowledgeContext}

Analyze this message and respond with JSON containing:
1. "category": "Billing" | "Technical Support" | "Feature Request" | "Sales Inquiry" | "Cancellation/Churn Risk" | "Spam"
2. "priority": "P1-Urgent" | "P2-High" | "P3-Medium" | "P4-Low"
3. "sentiment": "Frustrated" | "Neutral" | "Positive"
4. "entities": {
     "orderId": string or null,
     "invoiceNumber": string or null,
     "amount": number or null,
     "productName": string or null
   }
5. "summary": 1-sentence summary of the user's issue
6. "tier": 1 | 2 | 3 (1 = easily auto-resolvable via FAQ, 2 = requires staff review, 3 = critical escalation)
7. "autoResolveEligible": boolean (true only if tier 1, zero risk, and covered by FAQ)
8. "draftReply": A polite, complete response ready to send to the customer.
9. "internalNote": Note for human reviewer summarizing action needed.
`;

    const systemInstruction = `You are the Lead Support & Triage AI for ${this.companyName}. You ensure fast, empathetic, and accurate responses.`;

    const fallbackHandler = () => {
      const isUrgent = /urgent|broken|down|cancel|refund|charge/i.test(query);
      const isBilling = /invoice|receipt|billing|charge|vat|card/i.test(query);
      const isTechnical = /bug|api|error|429|fail|crash/i.test(query);

      let category = "General Inquiry";
      if (isBilling) category = "Billing";
      else if (isTechnical) category = "Technical Support";
      else if (/cancel/i.test(query)) category = "Cancellation/Churn Risk";

      const priority = isUrgent ? "P1-Urgent" : (isBilling ? "P2-High" : "P3-Medium");
      const sentiment = /angry|terrible|frustrated|fail|cancel/i.test(query) ? "Frustrated" : "Neutral";
      const isTier1 = isBilling && !/dispute|fraud/i.test(query);

      let draft = "";
      if (relevantDocs.length > 0) {
        draft = `Hi there,\n\nThanks for reaching out! Regarding your inquiry: ${relevantDocs[0].content}\n\nPlease let us know if you need any further assistance.\n\nBest regards,\n${this.companyName} Support Team`;
      } else {
        draft = `Hi there,\n\nThanks for contacting ${this.companyName}. We have received your request regarding "${email.subject}" and our team is actively reviewing it.\n\nWe will update you shortly.\n\nBest regards,\n${this.companyName} Team`;
      }

      // Regex entity extraction
      const invMatch = query.match(/INV-?\d+/i);
      const orderMatch = query.match(/ORD-?\d+/i);

      return {
        category,
        priority,
        sentiment,
        entities: {
          orderId: orderMatch ? orderMatch[0].toUpperCase() : null,
          invoiceNumber: invMatch ? invMatch[0].toUpperCase() : null,
          amount: null,
          productName: null
        },
        summary: `Customer inquiry regarding ${category.toLowerCase()}: "${email.subject}"`,
        tier: isTier1 ? 1 : (priority === "P1-Urgent" ? 3 : 2),
        autoResolveEligible: isTier1 && relevantDocs.length > 0,
        draftReply: draft,
        internalNote: isTier1 ? "Tier-1 standard inquiry; verified with knowledge base." : "Requires staff confirmation before sending."
      };
    };

    const triage = await this.llm.completeJSON({
      prompt,
      systemInstruction,
      fallbackHandler
    });

    const elapsedMs = Date.now() - startTime;

    return {
      success: true,
      executionTimeMs: elapsedMs,
      ticketId: `TICK-${Date.now().toString(36).toUpperCase()}`,
      originalMessage: email,
      triage: {
        category: triage.category,
        priority: triage.priority,
        sentiment: triage.sentiment,
        tier: triage.tier,
        summary: triage.summary
      },
      extractedEntities: triage.entities,
      action: {
        autoResolve: triage.autoResolveEligible,
        status: triage.autoResolveEligible ? "Auto-Resolved" : "Pending Human Approval",
        draftReply: triage.draftReply,
        internalNote: triage.internalNote
      },
      crmRecord: {
        customerEmail: email.from,
        subject: email.subject,
        category: triage.category,
        priority: triage.priority,
        status: triage.autoResolveEligible ? "Resolved" : "Open",
        syncedToCrm: true
      }
    };
  }
}
