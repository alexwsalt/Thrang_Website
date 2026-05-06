import crypto from "crypto";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwHoZPrD6ue8kPhoo_Hu0G5pAomHe9Exrp3lSaBerWiX9RLsKecKp3hp1-egAZXptsVDg/exec";

const SECRET = process.env.OTP_SECRET || "thrang-otp-secret-change-me";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  let email;
  try {
    ({ email } = JSON.parse(await readBody(req)));
  } catch {
    return res.status(400).json({ error: "invalid body" });
  }

  if (!email || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: "invalid email" });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  const payload = `${email.trim().toLowerCase()}:${otp}:${expires}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  const token = Buffer.from(JSON.stringify({ payload, sig })).toString("base64");

  try {
    const params = new URLSearchParams({ action: "sendOtp", email: email.trim(), otp });
    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      redirect: "follow",
    });
    if (!upstream.ok) throw new Error(`Apps Script returned ${upstream.status}`);
  } catch (err) {
    return res.status(502).json({ error: "could not send email", detail: String(err) });
  }

  res.status(200).json({ token });
}
