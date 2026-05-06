import crypto from "crypto";

const SECRET = process.env.OTP_SECRET || "thrang-otp-secret-change-me";

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  let email, otp, token;
  try {
    ({ email, otp, token } = JSON.parse(await readBody(req)));
  } catch {
    return res.status(400).json({ error: "invalid body" });
  }

  try {
    const { payload, sig } = JSON.parse(Buffer.from(token, "base64").toString());
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");

    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return res.status(400).json({ valid: false, error: "invalid token" });
    }

    const [storedEmail, storedOtp, expiresStr] = payload.split(":");

    if (storedEmail !== email.trim().toLowerCase()) {
      return res.status(400).json({ valid: false, error: "email mismatch" });
    }
    if (storedOtp !== String(otp).trim()) {
      return res.status(400).json({ valid: false, error: "wrong code" });
    }
    if (Date.now() > parseInt(expiresStr)) {
      return res.status(400).json({ valid: false, error: "code expired" });
    }

    res.status(200).json({ valid: true });
  } catch {
    return res.status(400).json({ valid: false, error: "verification failed" });
  }
}
