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

## Vor dem Livegang eintragen

In `js/main.js` (oben):

- `BOOKING_URL` — Calendly-Link für den 60-Min Deep Dive Call
- `GATEWAY1_URL` — Start-/Checkout-Link Gateway 1
- `WAITLIST_URL` — Formular Warteliste Rise of the Phoenix 2027

## Lokal ansehen

```bash
npx serve .
# oder
python3 -m http.server 8000
```

## Deployment (Vercel)

Repo bei Vercel importieren — Framework-Preset „Other“, kein Build-Command,
Output-Directory `./`. Fertig.
