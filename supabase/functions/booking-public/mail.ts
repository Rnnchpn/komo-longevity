// Gabarits d'e-mails et fichier calendrier (.ics) de la réservation KŌMØ.
// Aucun contenu médical : date, lieu, préparation pratique et lien de gestion.

export type Booking = {
  id: string; status: string; offer_code: string; offer_label: string; duration_minutes: number;
  price_cents: number | null; currency: string; starts_at: string; ends_at: string; timezone: string;
  center_slug: string; center_name: string; center_place: string | null; address: string | null; access_note: string | null;
  page_path: string; team_email: string; first_name: string; last_name: string; email: string; phone: string | null;
  source: string | null; created_at: string;
};

const INK = "#102e37", IVORY = "#f6f4ef", GOLD = "#b59f7f", MUTED = "#61777a", LINE = "#e3e6e0";

export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function fmt(iso: string, tz: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: tz || "Europe/Paris", ...opts }).format(new Date(iso));
}
export const dayLong = (b: Booking) => fmt(b.starts_at, b.timezone, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const dayShort = (b: Booking) => fmt(b.starts_at, b.timezone, { weekday: "short", day: "numeric", month: "short" });
export const hour = (b: Booking) => fmt(b.starts_at, b.timezone, { hour: "2-digit", minute: "2-digit" }).replace(":", " h ");
const hourCompact = (b: Booking) => fmt(b.starts_at, b.timezone, { hour: "2-digit", minute: "2-digit" });
const price = (b: Booking) => b.price_cents == null ? null : new Intl.NumberFormat("fr-FR", { style: "currency", currency: b.currency || "EUR", maximumFractionDigits: 0 }).format(b.price_cents / 100);
const place = (b: Booking) => [b.center_name, b.center_place].filter(Boolean).join(" · ");
const addressLine = (b: Booking) => b.address || "Adresse exacte et accès confirmés par notre équipe avant votre venue.";

function layout(title: string, inner: string, foot = true) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:${IVORY};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffefa;border:1px solid ${LINE};border-radius:18px;overflow:hidden">
<tr><td style="background:${INK};padding:26px 30px;color:${IVORY}"><div style="font-size:22px;letter-spacing:.18em;font-weight:600">KŌMØ</div><div style="font-size:10px;letter-spacing:.24em;color:#bdd5cf;margin-top:6px">LONGEVITY IN MOTION</div></td></tr>
<tr><td style="padding:30px">${inner}</td></tr>
${foot ? `<tr><td style="padding:18px 30px 26px;border-top:1px solid ${LINE};font-size:11px;line-height:1.6;color:${MUTED}">KŌMØ Longevity · contact@komolongevity.com<br>Ce message ne contient aucune information médicale. Pour toute question, répondez simplement à cet e-mail.</td></tr>` : ""}
</table></td></tr></table></body></html>`;
}
const h1 = (t: string) => `<h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;font-weight:600">${t}</h1>`;
const p = (t: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6">${t}</p>`;
const btn = (href: string, label: string) => `<p style="margin:22px 0"><a href="${esc(href)}" style="display:inline-block;background:${INK};color:${IVORY};text-decoration:none;padding:13px 22px;border-radius:999px;font-size:14px;font-weight:600">${esc(label)}</a></p>`;
function card(rows: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border:1px solid ${LINE};border-radius:14px">${rows.map(([k, v], i) =>
    `<tr><td style="padding:12px 16px;${i ? `border-top:1px solid ${LINE};` : ""}font-size:11px;letter-spacing:.12em;color:${MUTED};text-transform:uppercase;width:34%;vertical-align:top">${esc(k)}</td><td style="padding:12px 16px;${i ? `border-top:1px solid ${LINE};` : ""}font-size:15px;line-height:1.45">${v}</td></tr>`).join("")}</table>`;
}
function rowsFor(b: Booking): [string, string][] {
  const r: [string, string][] = [
    ["Rendez-vous", esc(b.offer_label)],
    ["Date", `<strong>${esc(dayLong(b))}</strong><br>${esc(hour(b))} · ${b.duration_minutes} min`],
    ["Lieu", `${esc(place(b))}<br><span style="color:${MUTED};font-size:13px">${esc(addressLine(b))}</span>`],
  ];
  const pr = price(b);
  if (pr) r.push(["Tarif", `${esc(pr)}, réglé sur place`]);
  return r;
}
const prepList = `<ul style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.7">
<li>Une tenue souple qui permet de bouger librement.</li>
<li>Vos chaussures habituelles : nous les notons et vous les remettrez à chaque contrôle, pour comparer à l'identique.</li>
<li>Arrivez 10 minutes avant l'heure.</li>
<li>Si vous en avez, vos derniers examens d'imagerie du dos ou des articulations.</li></ul>`;

const textRows = (b: Booking) => [
  `Rendez-vous : ${b.offer_label}`, `Date : ${dayLong(b)}, ${hour(b)} (${b.duration_minutes} min)`,
  `Lieu : ${place(b)} — ${addressLine(b)}`, price(b) ? `Tarif : ${price(b)}, réglé sur place` : "",
].filter(Boolean).join("\n");

export function emailConfirmPatient(b: Booking, manage: string) {
  const subject = `Votre bilan KŌMØ Motion est confirmé · ${dayShort(b)} à ${hour(b)}`;
  const html = layout(subject, h1(`Bonjour ${esc(b.first_name)}, c'est confirmé.`) +
    p("Votre rendez-vous KŌMØ Motion est réservé. Le fichier joint l'ajoute à votre agenda.") + card(rowsFor(b)) +
    `<h2 style="margin:22px 0 10px;font-size:16px">Pour bien préparer votre venue</h2>` + prepList +
    p("Sur place, vous scannerez un QR code pour remplir un court questionnaire pendant les mesures.") +
    btn(manage, "Modifier ou annuler") +
    `<p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED}">Annulation gratuite jusqu'à 24 h avant. Ce lien est personnel : ne le transférez pas.</p>`);
  const text = `Bonjour ${b.first_name},\n\nVotre rendez-vous KŌMØ Motion est confirmé.\n\n${textRows(b)}\n\nPour bien préparer votre venue :\n- une tenue souple ;\n- vos chaussures habituelles (les mêmes à chaque contrôle) ;\n- arrivez 10 minutes avant ;\n- si vous en avez, vos derniers examens d'imagerie du dos ou des articulations.\n\nModifier ou annuler (gratuit jusqu'à 24 h avant) : ${manage}\n\nKŌMØ Longevity · contact@komolongevity.com`;
  return { subject, html, text };
}

export function emailTeam(b: Booking) {
  const subject = `Nouveau RDV · ${b.center_name} · ${dayShort(b)} ${hourCompact(b)} · ${b.first_name} ${b.last_name.toUpperCase()}`;
  const rows: [string, string][] = [
    ["Patient", `<strong>${esc(b.first_name)} ${esc(b.last_name.toUpperCase())}</strong>`],
    ["E-mail", `<a href="mailto:${esc(b.email)}" style="color:${INK}">${esc(b.email)}</a>`],
    ["Téléphone", esc(b.phone || "Non communiqué")],
    ["Prestation", esc(b.offer_label)],
    ["Créneau", `${esc(dayLong(b))}<br>${esc(hour(b))} · ${b.duration_minutes} min`],
    ["Lieu", esc(place(b))],
    ["Origine", esc(b.source || "site")],
  ];
  const html = layout(subject, h1("Nouveau rendez-vous en ligne") + card(rows) +
    p("Le fichier .ics joint ajoute le créneau à ton agenda. Répondre à cet e-mail écrit directement au patient.") +
    `<p style="margin:0;font-size:12px;color:${MUTED}">Le dossier PULSE se crée au cabinet, le jour du bilan.</p>`, false);
  const text = `Nouveau rendez-vous en ligne\n\nPatient : ${b.first_name} ${b.last_name.toUpperCase()}\nE-mail : ${b.email}\nTéléphone : ${b.phone || "non communiqué"}\nPrestation : ${b.offer_label}\nCréneau : ${dayLong(b)}, ${hour(b)} (${b.duration_minutes} min)\nLieu : ${place(b)}\nOrigine : ${b.source || "site"}`;
  return { subject, html, text };
}

export function emailReminder(b: Booking, page: string) {
  const subject = `Rappel · votre bilan KŌMØ Motion demain à ${hour(b)}`;
  const html = layout(subject, h1(`À demain, ${esc(b.first_name)}.`) + card(rowsFor(b)) + prepList +
    p(`Un empêchement ? Répondez à cet e-mail ou utilisez le lien reçu lors de votre réservation. Pour reprendre un autre créneau : <a href="${esc(page)}" style="color:${INK}">${esc(page.replace(/^https:\/\//, ""))}</a>.`));
  const text = `Bonjour ${b.first_name},\n\nRappel de votre rendez-vous demain.\n\n${textRows(b)}\n\nTenue souple, chaussures habituelles, arrivée 10 minutes avant.\n\nUn empêchement ? Répondez à cet e-mail.\n\nKŌMØ Longevity`;
  return { subject, html, text };
}

export function emailCancelPatient(b: Booking, page: string) {
  const subject = `Rendez-vous annulé · ${dayShort(b)} à ${hour(b)}`;
  const html = layout(subject, h1("Votre rendez-vous est annulé.") +
    p(`Le créneau du <strong>${esc(dayLong(b))} à ${esc(hour(b))}</strong> (${esc(place(b))}) est libéré. Le fichier joint le retire de votre agenda.`) +
    btn(page, "Choisir un autre créneau"));
  const text = `Bonjour ${b.first_name},\n\nVotre rendez-vous du ${dayLong(b)} à ${hour(b)} (${place(b)}) est annulé.\n\nChoisir un autre créneau : ${page}\n\nKŌMØ Longevity`;
  return { subject, html, text };
}

export function emailCancelTeam(b: Booking, late: boolean) {
  const subject = `Annulation${late ? " tardive" : ""} · ${b.center_name} · ${dayShort(b)} ${hourCompact(b)} · ${b.first_name} ${b.last_name.toUpperCase()}`;
  const html = layout(subject, h1(late ? "Annulation à moins de 24 h" : "Rendez-vous annulé par le patient") +
    card([["Patient", `${esc(b.first_name)} ${esc(b.last_name.toUpperCase())} · ${esc(b.email)}`], ["Créneau", `${esc(dayLong(b))} · ${esc(hour(b))}`], ["Prestation", esc(b.offer_label)]]) +
    p("Le créneau est de nouveau proposé en ligne."), false);
  const text = `${late ? "Annulation à moins de 24 h" : "Rendez-vous annulé"}\n\n${b.first_name} ${b.last_name.toUpperCase()} (${b.email})\n${dayLong(b)}, ${hour(b)} · ${b.offer_label}\n\nLe créneau est de nouveau proposé en ligne.`;
  return { subject, html, text };
}

export function emailFollowup(b: Booking, link: string) {
  const subject = "Votre contrôle KŌMØ Motion : place à la trajectoire";
  const html = layout(subject, h1(`${esc(b.first_name)}, mesurons ce qui a changé.`) +
    p("Votre premier bilan a fixé votre point de départ. Le contrôle reprend exactement les mêmes mesures, avec les mêmes appareils et vos mêmes chaussures, pour comparer à l'identique et ajuster votre programme.") +
    p("L'idéal : 6 semaines après votre premier bilan, puis à 12 semaines.") +
    btn(link, "Réserver mon contrôle"));
  const text = `Bonjour ${b.first_name},\n\nVotre premier bilan a fixé votre point de départ. Le contrôle reprend les mêmes mesures, avec les mêmes appareils, pour comparer à l'identique et ajuster votre programme. L'idéal : 6 semaines après le premier bilan, puis à 12 semaines.\n\nRéserver mon contrôle : ${link}\n\nKŌMØ Longevity`;
  return { subject, html, text };
}

// --- Calendrier (RFC 5545) ---
const icsDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
function fold(line: string) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 74) return line;
  const out: string[] = []; let cur = "", len = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (len + n > 73) { out.push(cur); cur = " " + ch; len = 1 + n; } else { cur += ch; len += n; }
  }
  out.push(cur);
  return out.join("\r\n");
}
export function buildIcs(b: Booking, mode: "REQUEST_PUBLISH" | "CANCEL") {
  const cancel = mode === "CANCEL";
  const location = [place(b), b.address].filter(Boolean).join(", ");
  const desc = cancel ? "Rendez-vous annulé." : `${b.offer_label} (${b.duration_minutes} min). Tenue souple, chaussures habituelles, arrivée 10 minutes avant. Contact : ${b.team_email}`;
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//KOMO Longevity//Reservation//FR", "CALSCALE:GREGORIAN",
    `METHOD:${cancel ? "CANCEL" : "PUBLISH"}`, "BEGIN:VEVENT",
    `UID:${b.id}@komolongevity.com`, `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(b.starts_at)}`, `DTEND:${icsDate(b.ends_at)}`,
    `SUMMARY:${icsText(`KŌMØ Motion · ${b.center_name}`)}`, `LOCATION:${icsText(location)}`, `DESCRIPTION:${icsText(desc)}`,
    `STATUS:${cancel ? "CANCELLED" : "CONFIRMED"}`, `SEQUENCE:${cancel ? 1 : 0}`,
    ...(cancel ? [] : ["BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:KŌMØ Motion", "TRIGGER:-PT2H", "END:VALARM"]),
    "END:VEVENT", "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
