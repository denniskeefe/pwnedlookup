import { checkPassword, sendError } from "./_hibp.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "password required" });

  try {
    const count = await checkPassword(password);
    res.json({ count });
  } catch (e) {
    sendError(res, e);
  }
}
