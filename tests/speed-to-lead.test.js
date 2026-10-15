import test from "node:test";
import assert from "node:assert/strict";
import { SpeedToLeadEngine } from "../src/systems/speed-to-lead/engine.js";

test("SpeedToLeadEngine: processes high-urgency lead and generates booking URL", async () => {
  const engine = new SpeedToLeadEngine();

  const payload = {
    name: "Marcus Vance",
    phone: "(555) 432-1098",
    email: "marcus.v@example.com",
    serviceRequested: "Emergency Root Canal",
    message: "Severe dental pain since this morning. Do you have emergency availability today?",
    source: "whatsapp"
  };

  const result = await engine.processInquiry(payload);

  assert.equal(result.success, true);
  assert.equal(result.speedToLeadTargetMet, true);
  assert.equal(result.qualification.qualified, true);
  assert.ok(result.qualification.intentScore > 80, "Expected high intent score for urgent query");
  assert.ok(result.bookingLink.includes("cal.com"), "Booking link must be generated");
  assert.ok(result.outboundMessage.text.length > 20, "Outbound message should be synthesized");
  assert.equal(result.lead.phone, "+15554321098", "Phone number must be E.164 normalized");
});

test("SpeedToLeadEngine: identifies spam inquiries", async () => {
  const engine = new SpeedToLeadEngine();

  const payload = {
    name: "Spam Bot",
    phone: "123456",
    email: "spambot@spammer.org",
    serviceRequested: "SEO Backlinks",
    message: "Buy cheap crypto backlink services for your website today!",
    source: "web_form"
  };

  const result = await engine.processInquiry(payload);

  assert.equal(result.success, true);
  assert.equal(result.qualification.qualified, false);
  assert.equal(result.qualification.intentLevel, "Low");
});
