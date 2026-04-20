import rates from '../data/rates.json';

const pct = (a, b) => (((b - a) / a) * 100).toFixed(1);

export function hasSupplierRates(key) {
  const s = rates.suppliers[key];
  if (!s) return false;
  const y25 = s.years && s.years['2025-26'];
  const y26 = s.years && s.years['2026-27'];
  return !!(y25 && y26);
}

export function listSuppliers() {
  return Object.entries(rates.suppliers).map(([key, s]) => ({
    key,
    name: s.name,
    ready: hasSupplierRates(key)
  }));
}

export function getSupplier(key) {
  return rates.suppliers[key] || null;
}

function buildParagraphs(supplier) {
  const Y26 = supplier.years['2026-27'];
  return {
    breakdown: `Please provide a full itemised breakdown of how this bill was calculated, showing meter readings at both ends of the period, the days charged at each rate, and how any period spanning 1 April 2026 was split between the 2025-26 and 2026-27 tariffs.`,

    scheme_match: `Please confirm, in writing, that every rate applied to this bill matches the figures in your Household Charges Scheme 2026-27, specifically £${Y26.water_supply_per_cubic_metre_gbp.toFixed(3)} per cubic metre for water supply and £${Y26.water_supply_standing_gbp.toFixed(2)} annual standing charge.`,

    meter_test: `Please arrange a meter accuracy test. I understand that if the meter is found to be within the permitted tolerance I may be charged for the test, and that if it is outside tolerance the bill will be recalculated and the test will be at your cost.`,

    social_tariff: `Please apply your social tariff discount to my account if I qualify, and confirm in writing the eligibility criteria, the discount amount, and the date from which it has been applied.`
  };
}

export function generateComplaintLetter(input) {
  const {
    supplierKey = rates.default_supplier,
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

  const supplier = getSupplier(supplierKey);
  if (!supplier || !hasSupplierRates(supplierKey)) {
    return `We do not yet have verified ${supplier ? supplier.name : 'supplier'} rates loaded.\n\nThe letter template needs the 2025-26 and 2026-27 per-cubic-metre and standing charges from their published Household Charges Scheme before it can generate accurate figures.\n\nIn the meantime, the letter to your MP works for any supplier.`;
  }

  const Y25 = supplier.years['2025-26'];
  const Y26 = supplier.years['2026-27'];
  const PARAGRAPHS = buildParagraphs(supplier);

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

  const m3Delta = pct(Y25.water_supply_per_cubic_metre_gbp, Y26.water_supply_per_cubic_metre_gbp);
  const standingDelta = pct(Y25.water_supply_standing_gbp, Y26.water_supply_standing_gbp);

  const addressBlock = supplier.complaint_address_lines.join('\n');
  const emailLine = `By email: ${supplier.complaint_email}`;

  return `${name}
${addr}
${pc}

${today}

${addressBlock}

${emailLine}

FORMAL COMPLAINT, STAGE 1
${acctLine}
${periodLine}

Dear ${supplier.name},

I am raising a stage 1 complaint about my 2026-27 bill.

${impact}Your Household Charges Scheme 2026-27 sets the metered water supply rate at £${Y26.water_supply_per_cubic_metre_gbp.toFixed(3)} per cubic metre, up from £${Y25.water_supply_per_cubic_metre_gbp.toFixed(3)} the year before. That is a ${m3Delta}% rise in one year. The standing charge has gone up by ${standingDelta}% over the same period.

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
