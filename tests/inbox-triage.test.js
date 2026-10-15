import test from "node:test";
import assert from "node:assert/strict";
import { InboxTriageEngine } from "../src/systems/inbox-triage/engine.js";

test("InboxTriageEngine: correctly categorizes billing issue and extracts invoice ID", async () => {
  const engine = new InboxTriageEngine();

  const ticket = {
    from: "billing.contact@acme.corp",
    subject: "Question about charge for invoice INV-99410",
    body: "Hi team, we were billed twice for invoice INV-99410. Could you please check our account?"
  };

  const result = await engine.triageMessage(ticket);

  assert.equal(result.success, true);
  assert.equal(result.triage.category, "Billing");
  assert.equal(result.extractedEntities.invoiceNumber, "INV-99410");
  assert.ok(result.action.draftReply.length > 20, "Draft reply should be generated");
  assert.equal(result.crmRecord.syncedToCrm, true);
});

test("InboxTriageEngine: detects urgent cancellation requests", async () => {
  const engine = new InboxTriageEngine();

  const ticket = {
    from: "angry.customer@example.com",
    subject: "Urgent cancellation request",
    body: "Your app crashed and I am very frustrated. Cancel my account and refund immediately."
  };

  const result = await engine.triageMessage(ticket);

  assert.equal(result.success, true);
  assert.equal(result.triage.priority, "P1-Urgent");
  assert.equal(result.triage.sentiment, "Frustrated");
  assert.equal(result.action.autoResolve, false, "High-risk cancellations should not be auto-resolved without review");
});
