// ============================================================
//  SARVAGNYA 2K26 — SINGLE SOURCE OF TRUTH CONFIGURATION
// ============================================================

export const COLLEGE = {
  name: 'JNTU College of Engineering',
  location: 'Pulivendula',
  fullName: 'JNTU College of Engineering, Pulivendula',
}

export const EVENT = {
  batch: '2006',
  reunionYear: '2026',
  festDates: '8 & 9 October 2026',
  alumniMeetDate: '10 October 2026',
  alumniMeetDateShort: 'October 10, 2026',
  title: '2006 Batch Alumni Reunion 2026',
  festName: 'Sarvagnya 2K26',
}

export const PAYMENT = {
  // From payment details file — actual values
  upiId: 'ashoknaik985@ybl',
  accountNumber: '43063252956',
  ifscCode: 'SBIN0020858',
  // Account Name and Branch intentionally excluded per organizer requirements
  qrImage: '/sarvagnya-2k26/upi-qr.jpeg',
}

export const ASSETS = {
  // Paths use the GitHub Pages base so images load on production
  groupPhoto: '/sarvagnya-2k26/grouppic.jpeg',
  upiQr: '/sarvagnya-2k26/upi-qr.jpeg',
}

// ── CONTRIBUTION SETTINGS ────────────────────────────────────
// When true, alumni who cannot attend must still submit a contribution.
export const REQUIRE_CONTRIBUTION_FOR_NON_ATTENDEES = true

// ── PRODUCTION URL ───────────────────────────────────────────
// This is the URL encoded in the WEBSITE QR on the invitation poster.
// Different from the payment QR (which is the UPI QR image in the project).
export const PUBLIC_SITE_URL = 'https://medaabhinav.github.io/sarvagnya-2k26/'

// ── ADMIN EMAILS ─────────────────────────────────────────────
// These are used by Supabase Edge Functions (server-side only).
// They are listed here for documentation — NOT exposed as secrets.
// Actual values are stored as Supabase Edge Function secrets:
//   ADMIN_EMAIL_1 = medaabhinav7@gmail.com
//   ADMIN_EMAIL_2 = narayanaashoknaik9@gmail.com
