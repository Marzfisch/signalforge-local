export async function onRequestPost(context) {
  const body = await context.request.json();
  const lead = normalizeLead(body);

  if (context.env.DB) {
    await context.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        business_name TEXT NOT NULL,
        location TEXT NOT NULL,
        category TEXT NOT NULL,
        website TEXT NOT NULL,
        email TEXT,
        score INTEGER NOT NULL,
        offer TEXT NOT NULL,
        payload TEXT NOT NULL
      )
    `).run();

    await context.env.DB.prepare(`
      INSERT INTO leads (id, created_at, business_name, location, category, website, email, score, offer, payload)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      lead.id,
      lead.createdAt,
      lead.businessName,
      lead.location,
      lead.category,
      lead.website,
      lead.email,
      lead.score,
      lead.offer,
      JSON.stringify(body)
    ).run();
  }

  return Response.json({ ok: true, leadId: lead.id }, { status: 201 });
}

export async function onRequestGet(context) {
  if (!context.env.DB) {
    return Response.json({ leads: [] });
  }

  const result = await context.env.DB.prepare(`
    SELECT id, created_at, business_name, location, category, website, email, score, offer
    FROM leads
    ORDER BY created_at DESC
    LIMIT 100
  `).all();

  return Response.json({ leads: result.results });
}

function normalizeLead(body) {
  const source = body.lead || body;
  const createdAt = source.createdAt || new Date().toISOString();
  const id = `${Date.now()}-${crypto.randomUUID()}`;

  return {
    id,
    createdAt,
    businessName: String(source.businessName || "").slice(0, 140),
    location: String(source.location || "").slice(0, 140),
    category: String(source.category || "").slice(0, 100),
    website: String(source.website || "").slice(0, 240),
    email: String(source.email || "").slice(0, 180),
    score: Number(source.score || 0),
    offer: String(source.offer || "Starter Fix").slice(0, 80)
  };
}
