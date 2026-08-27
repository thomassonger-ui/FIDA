/**
 * Single source of truth for where FIDA is and when it's open.
 *
 * The address, phone and hours were repeated across the footer, /contact,
 * /tour, the legal pages and the homepage JSON-LD. They now live here so a
 * change lands everywhere at once — and so the structured data and the
 * visible page can never disagree, which is what search engines penalise.
 */

export const ADDRESS = {
  street: "8761 Perimeter Park Blvd, Ste. 107",
  city: "Jacksonville",
  region: "FL",
  postalCode: "32216",
  country: "US",
} as const;

/** One-line form used in legal footers and email signatures. */
export const ADDRESS_LINE =
  "8761 Perimeter Park Blvd, Ste. 107, Jacksonville, FL 32216";

export const PHONE = "(904) 674-3131";
export const PHONE_E164 = "+1-904-674-3131";
export const EMAIL = "success@fldentalassisting.com";

/** Verified from the Google Business Profile listing. */
export const GEO = {
  latitude: 30.255463058582432,
  longitude: -81.55464251706276,
} as const;

/** Google Business Profile — opens directions on any device. */
export const MAP_URL = "https://maps.app.goo.gl/1kLtE3h57SLSTYgq7";

/** Shared map pin, used for the "view larger map" link under the embed. */
export const MAP_SHARE_URL = "https://maps.app.goo.gl/FLgjX51NnGKnkEfWA";

/**
 * Embeddable map. Built from the coordinates rather than a short link —
 * maps.app.goo.gl URLs are redirects and will not render inside an iframe.
 * The classic `output=embed` form needs no API key and no billing account.
 */
export const MAP_EMBED_URL =
  `https://maps.google.com/maps?q=${GEO.latitude},${GEO.longitude}` +
  "&z=16&hl=en&output=embed";

/** Monday to Friday, 9:00 a.m. to 3:00 p.m. */
export const HOURS = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  opens: "09:00",
  closes: "15:00",
} as const;

/** schema.org PostalAddress, for JSON-LD blocks. */
export const postalAddressJsonLd = {
  "@type": "PostalAddress",
  streetAddress: ADDRESS.street,
  addressLocality: ADDRESS.city,
  addressRegion: ADDRESS.region,
  postalCode: ADDRESS.postalCode,
  addressCountry: ADDRESS.country,
} as const;

/** schema.org GeoCoordinates. */
export const geoJsonLd = {
  "@type": "GeoCoordinates",
  latitude: GEO.latitude,
  longitude: GEO.longitude,
} as const;

/** schema.org OpeningHoursSpecification. */
export const openingHoursJsonLd = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [...HOURS.days],
    opens: HOURS.opens,
    closes: HOURS.closes,
  },
];

// ------------------------------------------------------------
// Class size
//
// Confirmed by Debbie & Ashley: cohorts are capped at 10–12 and average
// about 8. We publish the average and name the cap, rather than quoting
// the cap alone — the honest number is also the better one.
// ------------------------------------------------------------

export const CLASS_SIZE = {
  average: 8,
  max: 12,
} as const;
