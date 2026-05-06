// Proxies POST booking submissions to the Apps Script Web App.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHoZPrD6ue8kPhoo_Hu0G5pAomHe9Exrp3lSaBerWiX9RLsKecKp3hp1-egAZXptsVDg/exec";

export const config = { api: { bodyParser: false } };

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  try {
    const body = await readBody(req);
    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      redirect: "follow",
    });
    const text = await upstream.text();
    res.status(200).send(text);
  } catch (err) {
    res.status(502).json({ error: "upstream", detail: String(err) });
  }
}
