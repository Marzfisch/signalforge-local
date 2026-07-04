const CATEGORY_WEIGHTS = {
  visibility: 0.32,
  trust: 0.24,
  conversion: 0.24,
  automation: 0.20
};

const DEMO_VALUES = {
  businessName: "Summit Family Dental",
  location: "Fort Collins, CO",
  category: "Healthcare clinic",
  website: "https://example-dental.test",
  reviewCount: "42",
  rating: "4.6",
  reviewVelocity: "2",
  monthlyVisits: "900",
  constraint: "We get referrals but do not show up consistently for emergency dentist searches.",
  email: "owner@example-dental.test"
};

const STORAGE_KEY = "signalforge.local.leads";

function numeric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function checkbox(form, name) {
  return Boolean(form.elements[name]?.checked);
}

function collectAudit(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data.reviewCount = numeric(data.reviewCount);
  data.rating = numeric(data.rating);
  data.reviewVelocity = numeric(data.reviewVelocity);
  data.monthlyVisits = numeric(data.monthlyVisits);
  data.hasGBP = checkbox(form, "hasGBP");
  data.hasServicePages = checkbox(form, "hasServicePages");
  data.hasSchema = checkbox(form, "hasSchema");
  data.hasBooking = checkbox(form, "hasBooking");
  data.hasReviewWorkflow = checkbox(form, "hasReviewWorkflow");
  data.hasFAQ = checkbox(form, "hasFAQ");
  return data;
}

function scoreAudit(data) {
  const visibility = Math.min(100,
    (data.hasGBP ? 24 : 0) +
    (data.hasServicePages ? 24 : 0) +
    (data.hasSchema ? 18 : 0) +
    (data.hasFAQ ? 14 : 0) +
    Math.min(20, data.monthlyVisits / 75)
  );

  const trust = Math.min(100,
    Math.min(36, data.reviewCount * 0.8) +
    Math.max(0, Math.min(34, (data.rating - 3.5) * 24)) +
    Math.min(30, data.reviewVelocity * 6)
  );

  const conversion = Math.min(100,
    (data.hasBooking ? 38 : 0) +
    (data.hasFAQ ? 18 : 0) +
    (data.hasServicePages ? 18 : 0) +
    (data.website && data.website.startsWith("https://") ? 14 : 0) +
    Math.min(12, data.monthlyVisits / 150)
  );

  const automation = Math.min(100,
    (data.hasReviewWorkflow ? 45 : 0) +
    (data.hasBooking ? 22 : 0) +
    (data.hasFAQ ? 13 : 0) +
    (data.hasSchema ? 10 : 0) +
    Math.min(10, data.reviewVelocity * 2)
  );

  const total = Math.round(
    visibility * CATEGORY_WEIGHTS.visibility +
    trust * CATEGORY_WEIGHTS.trust +
    conversion * CATEGORY_WEIGHTS.conversion +
    automation * CATEGORY_WEIGHTS.automation
  );

  return {
    total,
    categories: {
      visibility: Math.round(visibility),
      trust: Math.round(trust),
      conversion: Math.round(conversion),
      automation: Math.round(automation)
    }
  };
}

function recommendations(data, scores) {
  const items = [];

  if (!data.hasServicePages) {
    items.push("Create one focused page per core service and location. Start with the service most likely to produce high-value calls.");
  }
  if (!data.hasGBP) {
    items.push("Claim and complete the Google Business Profile, then align categories, services, hours, photos, and website links.");
  }
  if (!data.hasSchema) {
    items.push("Add LocalBusiness schema with name, address, phone, service area, opening hours, and same-as profile links.");
  }
  if (data.reviewVelocity < 4) {
    items.push("Install a review request workflow that asks satisfied customers within 24 hours and logs follow-up status.");
  }
  if (!data.hasBooking) {
    items.push("Put a call, booking, or quote action in the first mobile viewport and repeat it after proof sections.");
  }
  if (!data.hasFAQ) {
    items.push("Publish an FAQ section that answers buyer-intent searches in plain language and supports AI answer engines.");
  }
  if (scores.categories.automation < 65) {
    items.push("Automate weekly checks for review count, profile completeness, new content ideas, and unanswered customer questions.");
  }

  return items.slice(0, 6);
}

function offerForScore(score) {
  if (score < 55) {
    return "Starter Fix";
  }
  if (score < 78) {
    return "Growth Sprint";
  }
  return "Care Plan";
}

function loadLeads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLead(lead) {
  const leads = loadLeads();
  leads.unshift(lead);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads.slice(0, 200)));
  renderLeads();
}

function renderReport(data, scores) {
  const report = document.querySelector("#report");
  const recs = recommendations(data, scores);
  const offer = offerForScore(scores.total);

  report.innerHTML = `
    <div class="report-head">
      <div class="score-badge">${scores.total}</div>
      <div>
        <p class="eyebrow">Audit complete</p>
        <h3>${escapeHtml(data.businessName)} in ${escapeHtml(data.location)}</h3>
        <p>Recommended next offer: <strong>${offer}</strong>. The fastest growth leverage is ${primaryWeakness(scores.categories)}.</p>
      </div>
    </div>
    <div class="category-bars">
      ${Object.entries(scores.categories).map(([name, value]) => `
        <div>
          <div class="bar-label"><span>${titleCase(name)}</span><span>${value}/100</span></div>
          <div class="bar"><span style="width:${value}%"></span></div>
        </div>
      `).join("")}
    </div>
    <h3>Priority fixes</h3>
    <ul class="recommendations">
      ${recs.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
    <div class="hero-actions">
      <button class="button primary" type="button" id="download-report">Download report</button>
      <a class="button secondary" href="mailto:${encodeURIComponent(data.email || "")}?subject=${encodeURIComponent("SignalForge Local audit next steps")}&body=${encodeURIComponent(emailBody(data, scores, recs, offer))}">Draft follow-up email</a>
    </div>
  `;

  document.querySelector("#download-report").addEventListener("click", () => {
    downloadJson(`${slug(data.businessName)}-audit.json`, {
      createdAt: new Date().toISOString(),
      data,
      scores,
      recommendations: recs,
      recommendedOffer: offer
    });
  });
}

function renderLeads() {
  const leads = loadLeads();
  const container = document.querySelector("#lead-table");

  if (!leads.length) {
    container.innerHTML = '<div class="empty-state">No local leads captured yet.</div>';
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Business</th>
          <th>Score</th>
          <th>Offer</th>
          <th>Email</th>
          <th>Captured</th>
        </tr>
      </thead>
      <tbody>
        ${leads.map((lead) => `
          <tr>
            <td><strong>${escapeHtml(lead.businessName)}</strong><br>${escapeHtml(lead.location)}</td>
            <td>${lead.score}</td>
            <td>${escapeHtml(lead.offer)}</td>
            <td>${escapeHtml(lead.email || "Not provided")}</td>
            <td>${new Date(lead.createdAt).toLocaleString()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function emailBody(data, scores, recs, offer) {
  return [
    `Hi ${data.businessName} team,`,
    "",
    `I ran your SignalForge Local audit and scored the business at ${scores.total}/100.`,
    `The best next step is the ${offer}.`,
    "",
    "Top fixes:",
    ...recs.map((rec) => `- ${rec}`),
    "",
    "Reply with the service and location you most want to grow, and I can send a concrete implementation scope."
  ].join("\n");
}

function primaryWeakness(categories) {
  const [name] = Object.entries(categories).sort((a, b) => a[1] - b[1])[0];
  return `${titleCase(name)} readiness`;
}

function titleCase(value) {
  return value.replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "signalforge";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function resetDemo(form) {
  Object.entries(DEMO_VALUES).forEach(([key, value]) => {
    if (form.elements[key]) {
      form.elements[key].value = value;
    }
  });
  ["hasGBP"].forEach((name) => {
    form.elements[name].checked = true;
  });
  ["hasServicePages", "hasSchema", "hasBooking", "hasReviewWorkflow", "hasFAQ"].forEach((name) => {
    form.elements[name].checked = false;
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#audit-form");
    renderLeads();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = collectAudit(form);
      const scores = scoreAudit(data);
      const offer = offerForScore(scores.total);
      const lead = {
        businessName: data.businessName,
        location: data.location,
        category: data.category,
        website: data.website,
        email: data.email,
        score: scores.total,
        offer,
        createdAt: new Date().toISOString()
      };

      saveLead(lead);
      renderReport(data, scores);

      if (window.fetch && location.protocol.startsWith("http")) {
        try {
          await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lead, audit: data, scores })
          });
        } catch {
          // Local storage remains the reliable zero-cost fallback.
        }
      }
    });

    document.querySelector("#reset-demo").addEventListener("click", () => resetDemo(form));
    document.querySelector("#export-leads").addEventListener("click", () => downloadJson("signalforge-leads.json", loadLeads()));
    document.querySelector("#clear-leads").addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      renderLeads();
    });
  });
}

if (typeof module !== "undefined") {
  module.exports = { scoreAudit, recommendations, offerForScore };
}
