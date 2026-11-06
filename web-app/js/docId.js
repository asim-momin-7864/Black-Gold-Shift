// docId.js
// Fixed demo shift document ID for 5 November 2026 Morning shift (05112026M)

export const DEMO_SHIFT_ID = "05112026M";
export const DEMO_DATE_HEADING = "05-11-2026-M";

export function getFormattedDate() {
  return DEMO_SHIFT_ID;
}

// Formats date for display headings in format DD-MM-YYYY-M
export function getDateHeading() {
  return DEMO_DATE_HEADING;
}
