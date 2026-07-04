import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../site/app.js", import.meta.url), "utf8");
const sandbox = {
  module: { exports: {} },
  console,
  Blob,
  URL
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const { scoreAudit, recommendations, offerForScore } = sandbox.module.exports;

const weakAudit = {
  businessName: "Weak Co",
  location: "Denver, CO",
  category: "Home services",
  website: "http://weak.example",
  reviewCount: 4,
  rating: 3.8,
  reviewVelocity: 0,
  monthlyVisits: 120,
  hasGBP: false,
  hasServicePages: false,
  hasSchema: false,
  hasBooking: false,
  hasReviewWorkflow: false,
  hasFAQ: false
};

const strongAudit = {
  businessName: "Strong Co",
  location: "Denver, CO",
  category: "Home services",
  website: "https://strong.example",
  reviewCount: 180,
  rating: 4.9,
  reviewVelocity: 8,
  monthlyVisits: 4200,
  hasGBP: true,
  hasServicePages: true,
  hasSchema: true,
  hasBooking: true,
  hasReviewWorkflow: true,
  hasFAQ: true
};

const weakScore = scoreAudit(weakAudit);
assert.equal(offerForScore(weakScore.total), "Starter Fix");
assert.ok(weakScore.total < 55);
assert.ok(recommendations(weakAudit, weakScore).length >= 5);

const strongScore = scoreAudit(strongAudit);
assert.equal(offerForScore(strongScore.total), "Care Plan");
assert.ok(strongScore.total >= 78);
assert.ok(strongScore.categories.visibility > weakScore.categories.visibility);
assert.ok(strongScore.categories.automation > weakScore.categories.automation);

console.log("audit-engine tests passed");
