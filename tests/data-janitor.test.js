import test from "node:test";
import assert from "node:assert/strict";
import { DataJanitorEngine } from "../src/systems/data-janitor/engine.js";

test("DataJanitorEngine: cleans messy records, fixes email typos, normalizes phones, and deduplicates", () => {
  const janitor = new DataJanitorEngine();

  const messyCSV = `cust_name,email,mobile,rev,trans_date
jOhN dOE,john.doe@gmial.com,(555) 123-4567,"$1,500.00",2026-03-01
Sarah Smith,sarah.smith@company.com,+15559876543,850.50,2026-03-02
john doe,john.doe@gmail.com,5551234567,"$1,800.00",2026-03-03`;

  const result = janitor.cleanRecords(messyCSV);

  assert.equal(result.success, true);
  assert.equal(result.metrics.rawRecordCount, 3);
  assert.equal(result.metrics.cleanRecordCount, 2, "Expected duplicate John Doe record to be merged/deduped");
  assert.equal(result.metrics.duplicatesRemoved, 1);
  assert.ok(result.metrics.errorsRemediated >= 3, "Expected formatting corrections to be logged");

  const johnRecord = result.cleanedData.find(r => r.full_name === "John Doe");
  assert.ok(johnRecord, "John Doe should exist with proper casing");
  assert.equal(johnRecord.email, "john.doe@gmail.com", "Email typo @gmial.com must be fixed to @gmail.com");
  assert.equal(johnRecord.phone, "+15551234567", "Phone must be normalized to E.164");
  assert.equal(johnRecord.amount, 1800.00, "Higher revenue amount should be preserved upon merge");
});
