import test from "node:test";
import assert from "node:assert/strict";
import { BottleneckAudit } from "../src/audit/bottleneck-audit.js";

test("BottleneckAudit: computes operational ROI and blueprint", () => {
  const input = {
    companyName: "Acme Legal Partners",
    industry: "B2B Professional Services",
    monthlyLeads: 100,
    currentResponseHours: 5,
    averageDealValue: 3000,
    weeklyAdminHours: 20,
    hourlyAdminRate: 45
  };

  const audit = BottleneckAudit.analyze(input);

  assert.equal(audit.companyName, "Acme Legal Partners");
  assert.ok(audit.findings.annualHoursSaved > 0, "Hours saved must be greater than zero");
  assert.ok(audit.findings.totalAnnualImpact > 10000, "Annual impact should reflect realistic positive gain");
  assert.equal(audit.blueprint.length, 3, "Blueprint should cover all 3 operational stages");

  const mdReport = BottleneckAudit.toMarkdownReport(audit);
  assert.ok(mdReport.includes("Acme Legal Partners"));
  assert.ok(mdReport.includes("Total Projected Annual Value"));
});
