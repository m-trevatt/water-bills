// Live MP lookup. No hardcoded MP data.
// Postcodes.io: open, free, CORS-wide-open. Maps postcode to constituency.
// Parliament Members API: official, CORS-wide-open. Maps constituency to MP details.
//
// Both verified 2026-04-18 against CORS headers and real queries. Both
// require no API key. This file runs entirely in the browser.

const POSTCODES_IO = 'https://api.postcodes.io/postcodes/';
const MEMBERS_API_SEARCH = 'https://members-api.parliament.uk/api/Members/Search';
const MEMBERS_API_CONTACT = (id) => `https://members-api.parliament.uk/api/Members/${id}/Contact`;

/**
 * Look up a constituency from a UK postcode.
 * Returns { constituency, ward, district, region } or throws.
 */
export async function lookupPostcode(postcodeRaw) {
  const clean = postcodeRaw.replace(/\s+/g, '').toUpperCase();
  if (!clean) throw new Error('Empty postcode');

  const res = await fetch(POSTCODES_IO + encodeURIComponent(clean));
  if (res.status === 404) throw new Error('Postcode not found');
  if (!res.ok) throw new Error('Postcode service unavailable');

  const json = await res.json();
  const r = json.result;
  if (!r) throw new Error('Postcode not found');

  return {
    postcode: r.postcode,
    constituency: r.parliamentary_constituency_2024 || r.parliamentary_constituency,
    ward: r.admin_ward,
    district: r.admin_district,
    region: r.region,
    country: r.country
  };
}

/**
 * Look up an MP by constituency name. Returns { name, fullTitle, party,
 * partyColour, memberId, constituency } or throws.
 */
export async function lookupMPByConstituency(constituency) {
  if (!constituency) throw new Error('No constituency supplied');

  const url = `${MEMBERS_API_SEARCH}?Location=${encodeURIComponent(constituency)}&IsCurrentMember=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Parliament Members API unavailable');

  const json = await res.json();
  const item = json.items && json.items[0] && json.items[0].value;
  if (!item) throw new Error('No current MP found for this constituency');

  return {
    memberId: item.id,
    name: item.nameDisplayAs,
    fullTitle: item.nameFullTitle,
    party: item.latestParty && item.latestParty.name,
    partyAbbreviation: item.latestParty && item.latestParty.abbreviation,
    partyColour: item.latestParty && item.latestParty.backgroundColour,
    constituency: item.latestHouseMembership && item.latestHouseMembership.membershipFrom,
    thumbnailUrl: item.thumbnailUrl
  };
}

/**
 * Fetch the parliamentary email address for an MP by member id.
 * Returns a string or null.
 */
export async function lookupMPEmail(memberId) {
  if (!memberId) return null;

  const res = await fetch(MEMBERS_API_CONTACT(memberId));
  if (!res.ok) return null;

  const json = await res.json();
  const contacts = json.value || [];
  const parl = contacts.find((c) => c.type === 'Parliamentary office' && c.email);
  return parl ? parl.email : null;
}

/**
 * Convenience: postcode -> full MP record including email.
 */
export async function lookupMPFromPostcode(postcode) {
  const place = await lookupPostcode(postcode);
  if (!place.constituency) throw new Error('No constituency returned for this postcode');
  if (place.country !== 'England') {
    throw new Error(`This tool is for England only. Postcode is in ${place.country}.`);
  }

  const mp = await lookupMPByConstituency(place.constituency);
  const email = await lookupMPEmail(mp.memberId);
  return { ...mp, email, place };
}
