# Sarvagnya 2K26 — JNTU Pulivendula Alumni Reunion Microsite

**2006 Batch Alumni Reunion · 10 October 2026**
JNTU College of Engineering, Pulivendula

---

## Quick Start

```bash
npm install
npm run server     # start the local database API on http://localhost:8787
npm run dev        # → http://localhost:5173 (in a second terminal)
npm run build      # → dist/
npm run preview    # preview production build locally
```

---

## TWO DIFFERENT QR CODES — VERY IMPORTANT

### QR Code A — Website QR (for the Invitation Poster)

- Encodes the **deployed website URL** (e.g. `https://sarvagnya-2k26.vercel.app`)
- When scanned → opens the alumni website HOME page
- **Never use localhost for this QR**
- Generate this AFTER deployment using `PUBLIC_SITE_URL` in `src/config/index.js`

### QR Code B — Payment QR (on the Support page)

- This is the **real UPI/PhonePe QR image** already in the project (`public/upi-qr.jpeg`)
- When scanned → opens PhonePe/UPI payment to `ashoknaik985@ybl`
- These two QRs must NEVER be confused or swapped

---

## Setup

### 1. Local database

The app uses a small JSON database at `data/database.json`. The API server creates
the file automatically and saves registrations, contributions, and payment status
updates locally. No Supabase project or database setup is required.

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_ADMIN_PASSWORD=choose_a_strong_password
```

### 3. Email Notifications

1. Sign up at [resend.com](https://resend.com) → verify a sender domain
2. In Supabase → Edge Functions → Secrets, add:
   - `RESEND_API_KEY` = your Resend API key
   - `ADMIN_EMAIL` = organizer's email (e.g. `youremail@gmail.com`)
3. Update `FROM_EMAIL` in both edge function files to your verified domain
4. Deploy edge functions:
   ```bash
   npx supabase functions deploy send-registration-email
   npx supabase functions deploy send-contribution-email
   ```

### 4. Deploy to GitHub Pages

```bash
git add .
git commit -m "Deploy reunion website"
git push origin main
```

The GitHub Actions workflow builds and publishes the site automatically at:
`https://medaabhinav.github.io/sarvagnya-2k26/`

When no `VITE_API_URL` is configured, GitHub Pages uses browser storage so the
website remains usable without a server. That data is private to each browser.
For one shared admin database across all visitors, deploy `server.mjs` to a host
such as Render or Railway and add its URL as the `VITE_API_URL` GitHub secret.

### 5. After Deployment — Generate Website QR

1. Get your production URL (e.g. `https://sarvagnya-2k26.vercel.app`)
2. Update `PUBLIC_SITE_URL` in `src/config/index.js`
3. Rebuild and redeploy
4. Generate a QR code from the production URL using any free QR generator
5. Test on **Android + iPhone** — confirm it opens the website HOME page
6. Use this QR on the final invitation poster

---

## Payment Details (from payment details file)

- **UPI ID:** `ashoknaik985@ybl`
- **Account Number:** `43063252956`
- **IFSC:** `SBIN0020858`
- **Bank:** State Bank of India

> Account Name and Branch intentionally excluded per organizer requirements

---

## Pages

| Route      | Description                                   |
| ---------- | --------------------------------------------- |
| `/`        | Landing — hero, memories, event, registration |
| `/support` | Support — contribution & payment              |
| `/admin`   | Admin dashboard (password protected)          |

---

## Real Assets

| File                   | Usage                                    |
| ---------------------- | ---------------------------------------- |
| `public/grouppic.jpeg` | 2006 batch group photo — hero & memories |
| `public/upi-qr.jpeg`   | Real UPI/PhonePe QR — support page only  |

---

## Registration Flow

1. Alumni fills simple form (Name, Phone, Batch, Gender, Attendance + travel/food if attending)
2. Submits → saved to the local database
3. Automatically redirected to Support page
4. If attendance = "No" → shown contextual message before support page

---

## Admin Dashboard (`/admin`)

- Password set via `VITE_ADMIN_PASSWORD` in `.env`
- View registrations + contributions
- Search by name / phone / registration ID
- Filter by attendance, food, payment status
- Verify / reject contribution payments
- Export CSV

---

_Some journeys take us away. Some memories always bring us back._
**See You On Campus ❤️**
