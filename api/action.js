const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyIGgOBX9paKooqeGJOeQ8mo17Ts4OL5oc2ZHCHo-dw6VmjUJ4MO0hDTmGANVDJuI25_g/exec";

export default async function handler(req, res) {
  const { action, eventId } = req.query;
  if (!action || !eventId) return res.status(400).send("Bad request");
  if (action !== "accept" && action !== "decline") return res.status(400).send("Invalid action");

  try {
    const url = `${APPS_SCRIPT_URL}?action=${action}&eventId=${encodeURIComponent(eventId)}`;
    const upstream = await fetch(url, { redirect: "follow" });
    const html = await upstream.text();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (err) {
    res.status(502).send("<p>Error contacting booking system: " + String(err) + "</p>");
  }
}
