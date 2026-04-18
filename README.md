# Medway Water

A civic explainer for Kent residents about the 2026 Southern Water price rise.
Three things: the arithmetic (explainer), a complaint letter to Southern Water,
a letter to your MP.

Not a campaign. Not a petition. Not affiliated with any party.

## Principles

- Every factual claim cites a primary source, verified on the date of audit.
- Nothing stored. All form state lives in the browser.
- MP data is fetched live from Parliament's own API. There is no hardcoded
  MP list and therefore no staleness.
- Rates are verified against Southern Water's published charges page. They
  change once a year on 1 April.

## Stack

- Astro 5 in static output mode. No adapter needed.
- Vanilla CSS. No utility framework.
- Client-side JS for letter rendering and live API calls.
- Deploys to Cloudflare Pages as a pure static site.

## Mobile-first

Fluid type scales via `clamp`. Running text at 17px on small screens. Single
column. Tap targets above 44px. Forms stack to one column below 30rem. No
horizontal scroll. No layout shift on load.

## Typography and colour

- Display: Fraunces variable, weights 400/600/800, opsz 9-144. Google Fonts.
- Body: IBM Plex Sans Condensed, weights 400/500/600. Google Fonts.
- Mono: IBM Plex Mono, 400/500. For rate tables, citations, and the letter
  preview.
- Palette: warm paper (`#f6f1e9`), near-black ink (`#1a1614`), quinacridone
  red accent (`#a8281f`), muted navy for secondary.

The accent is deliberately not Labour red and not Conservative blue. The
site has to read as cross-party.

## Live MP lookup

Two public APIs, both CORS-open, both without keys:

1. `https://api.postcodes.io/postcodes/{postcode}` returns a postcode record
   including `parliamentary_constituency_2024`.
2. `https://members-api.parliament.uk/api/Members/Search?Location={name}`
   returns the current MP, and `/api/Members/{id}/Contact` returns the
   parliamentary email.

Both verified via preflight on 2026-04-18. The site makes two calls when the
user enters their postcode. No MP data is ever stored in this repo.

## Rates

`src/data/rates.json` holds the 2025-26 and 2026-27 figures, fetched from
Southern Water's own published page. When Southern Water publishes the
2027-28 scheme (usually February each year), update both blocks in that
file and bump `next_refresh_due`. Single-file edit.

## Sector figures

`src/data/sector.json` holds Ofwat's published sector totals. Refresh when
Ofwat publishes the next Monitoring Financial Resilience Report, usually
November each year.

## Kent water supply is split

Wastewater is Southern Water everywhere in Kent. Water supply is Southern
Water in parts, and South East Water in others. The complaint page includes
a supplier gate so the user confirms who their supplier actually is. Do not
assume.

## Local development

```bash
npm install
npm run dev
```

Runs on `http://localhost:4321`.

## Build

```bash
npm run build
```

Output in `./dist`, ready for Cloudflare Pages.

## Deploy

1. Push to a new GitHub repo.
2. Cloudflare dashboard, Pages, Connect to Git.
3. Framework preset: Astro.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy. Cloudflare gives you a `*.pages.dev` subdomain automatically.

No environment variables. No secrets. No backend.

## Maintenance

- Annually, April: refresh `rates.json` with Southern Water's new charges.
- Annually, November: refresh `sector.json` with the new Ofwat MFR figures.
- Quarterly: audit `citations.json` URLs. Update `accessed` dates. Flag
  any dead links.
- Never: manually edit MP data. It is live.

## What is not on this site

- Claims that are not personally verified against primary sources.
- Arguments based on secondary reporting where the original could not be
  traced.
- Calls to non-payment. Non-payment has real credit consequences.
- Any framing that tells the reader what to conclude politically.

## Licence

MIT. Fork it. Improve it. Change the supplier from Southern Water to
whichever regional monopoly is overcharging your area.
