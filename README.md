# The World of the Phoenix — Cinematic Funnel

Premium-Cinematic-Funnel für den **Founder Circle** mit den **4 Gateways** und dem
Warteliste-Teaser für **Rise of the Phoenix**.

## Aufbau

Eine einzige cinematische Scroll-Journey (`index.html`), Szene für Szene wie ein
Netflix-Trailer aufgebaut:

1. Hero — „Aktiviere deine innere Schöpferkraft“
2. Spiegel-Momente (Identifikation statt Überzeugung)
3. Der Raum — Founder Circle Einladung
4. Founder Circle — 1:1 VIP Mentoring + Deep Dive Call CTA
5. Die geballte Urkraft der Elemente
6. The 4 Gateways of Human Consciousness (Water · Fire · Air · Earth)
7. Reise-Start — Gateway 1 „Im Zeichen des Sturms“
8. The World of the Phoenix — verschlossene Türen
9. Rise of the Phoenix — Signature-Programm, Warteliste 2027

## Technik

- **Statisch, kein Build-Schritt** — direkt auf Vercel deploybar
- **GSAP + ScrollTrigger** — Szenen-Reveals, Parallax, Ken-Burns-Zooms
- **Lenis** — cinematisches Smooth-Scrolling
- **Three.js** — schwebender Goldstaub-Partikelhintergrund
- **Google Fonts** — Cinzel (Headlines) + Cormorant Garamond (Statements/Fließtext)

## Design-System

| Token | Wert |
|---|---|
| Cinematic Ink Black | `#14100D` |
| Pristine (Basistext) | `#F4F3EA` |
| Parsnip Gold (Headlines) | `#D8C06A` |
| Butterum (Highlights) | `#C98B4A` |
| Phoenix Bronze | `#8A5B3D` |
| Gateway 1 Water | `#7FAFBE` / CTA `#2F6F63` |
| Gateway 2 Fire | `#C98B4A` / CTA `#B45A34` |
| Gateway 3 Air | `#B7B1BE` / CTA `#F3E6B2` |
| Gateway 4 Earth | `#A8C56A` / CTA `#496B43` |

## Seiten

Neben `index.html` (die Scroll-Journey) gibt es vier einfache Ein-Screen-Seiten, die die
Funnel-CTAs auffangen:

- `contact.html` — Kontaktformular (auch aus dem Footer erreichbar)
- `waitlist.html` — Warteliste Rise of the Phoenix 2027
- `booking.html` — Platzhalter für den Deep Dive Call, bis ein echter Calendly-Link existiert
- `gateway1.html` — Platzhalter für Gateway 1, bis der echte Kurs live ist

Alle vier laden `js/forms.js` statt der schweren GSAP/Lenis/Three.js-Bundles.

## Vor dem Livegang eintragen

In `js/forms.js` (oben):

- `WEBHOOK_URL` — die echte Automatisierungs-Webhook-URL, sobald sie bereitsteht. Bis
  dahin ist sie `'#'` und jedes Formular zeigt sofort die Erfolgsmeldung an, ohne eine
  echte Anfrage zu senden.

Impressum und Datenschutz im Footer sind noch `#`-Platzhalter — hier fehlt noch echter
Rechtstext (Pflicht vor Livegang, siehe Code-Review).

## Lokal ansehen

```bash
npx serve .
# oder
python3 -m http.server 8000
```

## Deployment (Vercel)

Repo bei Vercel importieren — Framework-Preset „Other“, kein Build-Command,
Output-Directory `./`. Fertig.
