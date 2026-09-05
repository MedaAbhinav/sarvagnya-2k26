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
  // From payment details file — actual values, do not change
  upiId: 'ashoknaik985@ybl',
  accountNumber: '43063252956',
  ifscCode: 'SBIN0020858',
  // Paths relative to public/ — Vite injects the correct base automatically
  qrImage: '/upi-qr.jpeg',
}

export const ASSETS = {
  // Paths relative to public/ — Vite injects the correct base automatically
  groupPhoto: '/grouppic.jpeg',
  upiQr: '/upi-qr.jpeg',
}

// ── CONTRIBUTION SETTINGS ────────────────────────────────────
// When true, alumni who cannot attend must still submit a contribution.
export const REQUIRE_CONTRIBUTION_FOR_NON_ATTENDEES = true

// ── PRODUCTION URL ───────────────────────────────────────────
export const PUBLIC_SITE_URL = 'https://medaabhinav.github.io/sarvagnya-2k26/'

// ── ADMIN EMAILS (documentation only — stored as Supabase secrets) ──
// ADMIN_EMAIL_1 = medaabhinav7@gmail.com
// ADMIN_EMAIL_2 = narayanaashoknaik9@gmail.com
