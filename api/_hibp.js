import { createHash } from "crypto";

export function getApiKey(req) {
  return req.headers["x-hibp-key"] || process.env.HIBP_API_KEY;
}

export async function hibpFetch(path, apiKey) {
  if (!apiKey) throw Object.assign(new Error("No API key provided"), { status: 401 });
  const res = await fetch(`https://haveibeenpwned.com/api/v3${path}`, {
    headers: { "hibp-api-key": apiKey, "user-agent": "hibp-app/1.0" },
  });
  if (res.status === 404) return null;
  if (res.status === 401) throw Object.assign(new Error("Invalid HIBP API key"), { status: 401 });
  if (res.status === 429) throw Object.assign(new Error("Rate limited — wait before retrying"), { status: 429 });
  if (!res.ok) throw Object.assign(new Error(`HIBP error ${res.status}`), { status: res.status });
  return res.json();
}

export async function checkPassword(password) {
  const hash = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "user-agent": "hibp-app/1.0" },
  });
  if (!res.ok) throw new Error(`Pwned Passwords API error: ${res.status}`);
  const text = await res.text();
  const line = text.split("\r\n").find((l) => l.startsWith(suffix));
  return line ? parseInt(line.split(":")[1], 10) : 0;
}

export function sendError(res, err) {
  res.status(err.status || 500).json({ error: err.message });
}
