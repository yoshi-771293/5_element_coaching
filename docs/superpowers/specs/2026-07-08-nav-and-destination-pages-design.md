# Nav + Destination Pages — Design

## Problem

The funnel (`index.html`) has three CTAs (Deep Dive Call, Gateway 1, Waitlist) whose links
resolve to `href="#"` via placeholder constants in `js/main.js`. There is no way to contact
the business, and no logo/brand mark anywhere on the page. The site needs working
destinations behind every button without turning the single-path funnel into a standard
multi-page marketing site with a competing nav menu.

## Decisions (from brainstorming)

- **Nav stays minimal.** Header is logo-only, no menu links — the funnel's persuasion
  sequence should not offer exits. A text wordmark placeholder stands in for the logo until
  a proper transparent-background asset exists (current `logo/ver_01.png` is a baked-in
  mockup render, not usable as-is).
- **Contact is reachable only via the footer**, next to the existing Impressum/Datenschutz
  placeholders — not from the header.
- **Booking and Gateway 1 have no real product yet.** Both get placeholder "opening soon"
  pages with a lightweight interest-capture form, not a real Calendly embed or checkout.
- **All forms submit to one shared placeholder webhook constant.** The user's real
  automation webhook is expected Thu/Fri (this week); until then every form points at a
  single `WEBHOOK_URL = '#'` constant so swapping it later is a one-line change.
- **No build step.** Plain static HTML pages, consistent with the existing "no build,
  deploy directly" architecture documented in the README.

## Architecture

Five HTML documents total, all sharing `css/style.css` and a new `js/forms.js`:

- `index.html` (existing funnel — gets header added, footer gets a Kontakt link, CTA hrefs
  fixed)
- `contact.html` — name/email/message form
- `waitlist.html` — name/email form ("Rise of the Phoenix" 2027 waitlist)
- `booking.html` — "Deep Dive Call" placeholder + interest form
- `gateway1.html` — "Gateway 1" placeholder + interest form

Header and footer markup is duplicated across the 5 files rather than templated, matching
the project's no-build-tooling constraint. This is a small, rarely-changed block, so the
duplication cost is acceptable.

## Header component (all pages)

Fixed-position bar, transparent over content, matching the existing dark/gold palette.
Contains only a text wordmark (placeholder for the future logo) linking to `index.html`.
No menu items.

## Footer component (all pages)

Existing phoenix icon + "The World of the Phoenix" brand line stay as-is. Nav row becomes:
`Kontakt · Impressum · Datenschutz`. Impressum and Datenschutz remain `href="#"`
placeholders — real legal text is out of scope here (requires the business owner to
supply/approve it; German Impressum and Datenschutzerklärung are legally required before
go-live).

## Destination pages

Each of `contact.html`, `waitlist.html`, `booking.html`, `gateway1.html` is a single-screen
(non-scrolling-journey) page: header, a short headline + supporting copy in the site's
existing voice, a form, footer. `booking.html` and `gateway1.html` explicitly say the full
experience is "opening soon" and frame the form as "get notified" rather than "book now" /
"start now".

Form fields:
- `contact.html`: name, email, message
- `waitlist.html`: name, email
- `booking.html`: name, email
- `gateway1.html`: name, email

## Data flow — forms

`js/forms.js` defines one constant, `WEBHOOK_URL = '#'`, and a single handler attached to
every `<form data-webhook-form>` on the page. On submit:

1. Prevent default navigation.
2. Reject silently if the honeypot field (a visually-hidden extra input) is filled.
3. `fetch(WEBHOOK_URL, { method: 'POST', body: new FormData(form) })`.
4. Regardless of whether the fetch resolves or rejects (webhook CORS behavior is unknown
   until the real endpoint exists), show an inline "Danke — wir melden uns." message and
   hide the form.

This is optimistic-success by necessity: a placeholder endpoint (`#`) cannot be POSTed to
meaningfully, so real verification only becomes possible once the real webhook URL is
substituted in. This limitation is intentional and documented in a code comment at the
`WEBHOOK_URL` declaration.

## Buttons

`js/main.js`'s existing `data-booking` / `data-gateway1` / `data-waitlist` rewiring is
replaced: these attributes now point at the internal pages (`booking.html`, `gateway1.html`,
`waitlist.html`) instead of external placeholder URLs. Existing `:hover` styles are kept;
`:focus-visible` states are added for keyboard accessibility.

## Out of scope (explicitly deferred)

- Real Calendly embed / real Gateway 1 checkout
- Impressum / Datenschutz legal copy
- Logo background removal / final nav logo asset
- Actual webhook wiring (user provides the real URL later this week)
- Deploying to GitHub/Vercel (separate step, after pages are built and verified locally)

## Verification

Serve locally (`preview_start`), click every CTA on `index.html`, confirm each lands on the
correct destination page, submit each form and confirm the inline thank-you state appears,
check keyboard-only navigation reaches and activates every button.
