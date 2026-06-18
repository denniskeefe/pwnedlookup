import express from "express";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3737;
const HIBP_API_KEY = process.env.HIBP_API_KEY;
if (!HIBP_API_KEY) { console.error("Error: HIBP_API_KEY environment variable is required"); process.exit(1); }

app.use(express.json());
app.use(express.static(join(__dirname, "public")));

async function hibpFetch(path) {
  const res = await fetch(`https://haveibeenpwned.com/api/v3${path}`, {
    headers: { "hibp-api-key": HIBP_API_KEY, "user-agent": "hibp-app/1.0" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw Object.assign(new Error(`HIBP error ${res.status}`), { status: res.status });
  return res.json();
}

app.post("/api/breaches", async (req, res) => {
  const { emails } = req.body;
  if (!Array.isArray(emails) || emails.length === 0)
    return res.status(400).json({ error: "emails array required" });

  try {
    const results = await Promise.all(
      emails.map(async (email) => {
        const breaches = await hibpFetch(`/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`);
        return { email, breaches: breaches || [] };
      })
    );
    res.json(results);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post("/api/pastes", async (req, res) => {
  const { emails } = req.body;
  if (!Array.isArray(emails) || emails.length === 0)
    return res.status(400).json({ error: "emails array required" });

  try {
    const results = await Promise.all(
      emails.map(async (email) => {
        const pastes = await hibpFetch(`/pasteaccount/${encodeURIComponent(email)}`);
        return { email, pastes: pastes || [] };
      })
    );
    res.json(results);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post("/api/password", async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "password required" });

  try {
    const hash = createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const r = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "user-agent": "hibp-app/1.0" },
    });
    const text = await r.text();
    const line = text.split("\r\n").find((l) => l.startsWith(suffix));
    const count = line ? parseInt(line.split(":")[1], 10) : 0;
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/breach/:name", async (req, res) => {
  try {
    const breach = await hibpFetch(`/breach/${encodeURIComponent(req.params.name)}`);
    if (!breach) return res.status(404).json({ error: "Breach not found" });
    res.json(breach);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`HIBP app running at http://localhost:${PORT}`));
