import rates from '../data/rates.json';

const R25 = rates.years['2025-26'];
const R26 = rates.years['2026-27'];

const pct = (a, b) => (((b - a) / a) * 100).toFixed(1);

const PARAGRAPHS = {
  breakdown: `Please provide a full itemised breakdown of how this bill was calculated, showing meter readings at both ends of the period, the days charged at each rate, and how any period spanning 1 April 2026 was split between the 2025-26 and 2026-27 tariffs.`,

  scheme_match: `Please confirm, in writing, that every rate applied to this bill matches the figures in your Household Charges Scheme 2026-27, specifically £${R26.water_supply_per_cubic_metre_gbp.toFixed(3)} per cubic metre for water supply and £${R26.water_supply_standing_gbp.toFixed(2)} annual standing charge.`,

  meter_test: `Please test the meter for accuracy given the scale of the increase, and confirm the date and result of the test.`,

  social_tariff: `Please confirm in writing whether I qualify for your social tariff and hardship fund, along with the application process and expected response time.`
};

export function generateComplaintLetter(input) {
  const {
    fullName = '',
    address = '',
    postcode = '',
    accountNumber = '',
    billPeriodFrom = '',
    billPeriodTo = '',
    previousBill = '',
    currentBill = '',
    concerns = {}
  } = input;

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const name = fullName.trim() || '[Your name]';
  const addr = address.trim() || '[Your address]';
  const pc = postcode.trim().toUpperCase() || '[Your postcode]';

  const acctLine = accountNumber.trim()
    ? `Account number: ${accountNumber.trim()}`
    : 'Account number: to confirm on request';

  const periodLine = (billPeriodFrom && billPeriodTo)
    ? `Billing period: ${fmt(billPeriodFrom)} to ${fmt(billPeriodTo)}`
    : 'Billing period: as per attached bill';

  let impact = '';
  if (previousBill && currentBill) {
    const p = parseFloat(previousBill);
    const c = parseFloat(currentBill);
    if (!isNaN(p) && !isNaN(c) && p > 0) {
      const delta = (((c - p) / p) * 100).toFixed(1);
      impact = `The previous bill for this period was £${p.toFixed(2)}. The current bill is £${c.toFixed(2)}. That is an increase of ${delta}%.\n\n`;
    }
  }

  const selected = Object.entries(concerns)
    .filter(([, checked]) => checked)
    .map(([k]) => PARAGRAPHS[k])
    .filter(Boolean);

  const asks = selected.length > 0
    ? `I would like the following, in writing, within 10 working days:\n\n${selected.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}\n`
    : 'I would like a response within 10 working days.\n';

  const m3Delta = pct(R25.water_supply_per_cubic_metre_gbp, R26.water_supply_per_cubic_metre_gbp);
  const standingDelta = pct(R25.water_supply_standing_gbp, R26.water_supply_standing_gbp);

  return `${name}
${addr}
${pc}

${today}

Southern Water
Customer Services
PO Box 41
Worthing BN13 3NZ

By email: customerservices@southernwater.co.uk

FORMAL COMPLAINT, STAGE 1
${acctLine}
${periodLine}

Dear Southern Water,

I am raising a stage 1 complaint about my 2026-27 bill.

${impact}Your Household Charges Scheme 2026-27 sets the metered water supply rate at £${R26.water_supply_per_cubic_metre_gbp.toFixed(3)} per cubic metre, up from £${R25.water_supply_per_cubic_metre_gbp.toFixed(3)} the year before. That is a ${m3Delta}% rise in one year. The standing charge has gone up by ${standingDelta}% over the same period. Your own communications describe the average combined household rise as 8%, but the actual rise on water supply alone is ${m3Delta}% per cubic metre.

I am not disputing that these rates are published. I am asking you to show that they have been applied correctly and to confirm it in writing.

${asks}
If I do not receive a response in 10 working days, or the response does not cover the points above, I will escalate to the Consumer Council for Water, and if necessary to the Water Redress Scheme.

Yours faithfully,

${name}`;
}

function fmt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
