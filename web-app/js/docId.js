// docId.js
// Generates today's Firestore document ID in format DDMMYYYYM (e.g. 05112026M)

export function getFormattedDate() {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear();
  return `${day}${month}${year}M`;
}

// Formats today's date for display headings in format DD-MM-YYYY-M
export function getDateHeading() {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear();
  return `${day}-${month}-${year}-M`;
}
