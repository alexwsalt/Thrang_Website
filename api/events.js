// Proxies GET requests to the Apps Script Web App so browser extensions
// can't block the third-party redirect chain to googleusercontent.com.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHoZPrD6ue8kPhoo_Hu0G5pAomHe9Exrp3lSaBerWiX9RLsKecKp3hp1-egAZXptsVDg/exec";

export default async function handler(req, res) {
  try {
    const upstream = await fetch(APPS_SCRIPT_URL + "?action=getEvents", {
      method: "GET",
      redirect: "follow",
    });
    const text = await upstream.text();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(text);
  } catch (err) {
    res.status(502).json({ error: "upstream", detail: String(err) });
  }
}
