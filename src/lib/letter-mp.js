import rates from '../data/rates.json';
import sector from '../data/sector.json';

const R25 = rates.years['2025-26'];
const R26 = rates.years['2026-27'];
const m3Delta = (((R26.water_supply_per_cubic_metre_gbp - R25.water_supply_per_cubic_metre_gbp) / R25.water_supply_per_cubic_metre_gbp) * 100).toFixed(1);
const standingDelta = (((R26.water_supply_standing_gbp - R25.water_supply_standing_gbp) / R25.water_supply_standing_gbp) * 100).toFixed(1);

const ASKS = {
  catchup: `ensure catch-up investment in the water sector is funded by shareholders and bondholders, not by customers who cannot switch supplier`,
  transparency: `press Ofwat for clearer public reporting on internal dividend flows between regulated water companies and their parent holding structures`,
  protection: `press Ofwat and DEFRA on what consumer protection mechanisms will apply during the 2025-2030 investment period if service performance does not improve in line with the extra funding`,
  reform: `support reform of the water regulatory framework so that household customers have meaningful recourse, given that there is no retail market`,
  meeting: `let me know when your next constituency surgery is, or arrange a conversation, so I can explain the local impact in more detail`
};

function formalName(mp) {
  if (!mp || !mp.name) return '[Your MP]';
  // Strip trailing " MP" if present in fullTitle; use name as-is for full
  // salutation. Avoids guessing title/gender.
  return mp.name.trim();
}

export function generateMPLetter(input) {
  const {
    fullName = '',
    postcode = '',
    mp = null,
    previousMonthlyBill = '',
    currentMonthlyBill = '',
    personalContext = '',
    asks = {},
    siteOrigin = ''
  } = input;

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const name = fullName.trim() || '[Your name]';
  const pc = postcode.trim().toUpperCase() || '[Your postcode]';

  const mpName = mp ? mp.fullTitle || mp.name : '[Your MP]';
  const mpEmail = mp && mp.email ? mp.email : '[MP email]';
  const salutation = mp ? `Dear ${formalName(mp)}` : 'Dear [Your MP]';
  const constituency = mp ? mp.constituency : '[your constituency]';

  let impact = '';
  if (previousMonthlyBill && currentMonthlyBill) {
    const p = parseFloat(previousMonthlyBill);
    const c = parseFloat(currentMonthlyBill);
    if (!isNaN(p) && !isNaN(c) && p > 0) {
      const monthly = (c - p).toFixed(2);
      const annual = ((c - p) * 12).toFixed(2);
      impact = `My own monthly water bill has gone from £${p.toFixed(2)} to £${c.toFixed(2)}. That is £${monthly} a month, £${annual} a year.\n\n`;
    }
  }

  const context = personalContext.trim()
    ? `${personalContext.trim()}\n\n`
    : '';

  const selected = Object.entries(asks)
    .filter(([, v]) => v)
    .map(([k]) => ASKS[k])
    .filter(Boolean);

  const asksSection = selected.length > 0
    ? `Would you please:\n\n${selected.map((a, i) => `${i + 1}. ${a.charAt(0).toUpperCase() + a.slice(1)}.`).join('\n\n')}`
    : `I would appreciate a written response outlining what action you intend to take.`;

  return `${name}
${pc}

${today}

${mpName}
House of Commons
London SW1A 0AA

By email: ${mpEmail}

${salutation},

I am writing as a constituent in ${constituency} about the 2026 Southern Water price rise.

The metered water supply rate has gone up by ${m3Delta} per cent per cubic metre in one year. The standing charge is up ${standingDelta} per cent. For households that get water supply only from Southern Water, the average rise is 25.8 per cent. This follows a 46.7 per cent average rise the previous year. All of these figures are from Southern Water's own published documents.

${impact}I am not asking you to say the rise is unlawful. Ofwat approved it in the PR24 Final Determination. Southern Water appealed, not because the determination was too high, but because they wanted more. The CMA issued its final redeterminations in March 2026. The legal process has run its course.

My question is different. It is a question about fairness.

Across the water sector, Ofwat's most recent Monitoring Financial Resilience Report records total borrowings of £82.7 billion at 31 March 2025. Net debt was £69.5 billion the year before. Southern Water states that no dividends have gone to external shareholders since 2017, and that Macquarie has injected more than £1.6 billion of equity since 2021. Both of those statements check out against Ofwat's own reporting. What customers are being asked to do now is fund catch-up investment through steep annual rises with no option to switch supplier, because household water in England is a regional monopoly.

${context}This is a cross-party issue. A constituent of any political view can look at those numbers and reasonably ask whether a lawful system is also a fair one.

${asksSection}

I have also raised a formal complaint with Southern Water about my own bill. I will be escalating to the Consumer Council for Water if the response is inadequate. But the structural question is yours, not theirs.

Yours sincerely,

${name}
${pc}

---
Figures used in this letter:
- 2026-27 metered rates: Southern Water Household Charges page
- 46.7 per cent previous year rise: Southern Water customer bills announcement for 2026/27
- £82.7bn / £69.5bn sector totals: Ofwat Monitoring Financial Resilience Reports 2024-25 and 2023-24
- Macquarie equity: Southern Water dividend statement, cross-referenced with Ofwat MFR 2022-23
Full sources: ${siteOrigin || ''}/sources
`;
}
