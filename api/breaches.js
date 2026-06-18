import { getApiKey, hibpFetch, sendError } from "./_hibp.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { emails } = req.body;
  if (!Array.isArray(emails) || emails.length === 0)
    return res.status(400).json({ error: "emails array required" });

  try {
    const apiKey = getApiKey(req);
    const results = await Promise.all(
      emails.map(async (email) => {
        const breaches = await hibpFetch(
          `/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
          apiKey
        );
        return { email, breaches: breaches || [] };
      })
    );
    res.json(results);
  } catch (e) {
    sendError(res, e);
  }
}
