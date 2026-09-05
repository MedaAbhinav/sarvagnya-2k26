# Sarvagnya 2K26 — JNTU Pulivendula Alumni Reunion Microsite

**2006 Batch Alumni Reunion · 10 October 2026**
JNTU College of Engineering, Pulivendula

---

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:5173
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

### 1. Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `supabase/migrations/001_initial_schema.sql`
3. Copy your **Project URL** and **anon key** from Settings → API

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
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

### 4. Deploy (Vercel recommended)
```bash
npm run build
# Push to GitHub → connect to Vercel → auto-deploy
# Or: npx vercel --prod
```

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

| Route | Description |
|-------|-------------|
| `/` | Landing — hero, memories, event, registration |
| `/support` | Support — contribution & payment |
| `/admin` | Admin dashboard (password protected) |

---

## Real Assets
| File | Usage |
|------|-------|
| `public/grouppic.jpeg` | 2006 batch group photo — hero & memories |
| `public/upi-qr.jpeg` | Real UPI/PhonePe QR — support page only |

---

## Registration Flow
1. Alumni fills simple form (Name, Phone, Batch, Gender, Attendance + travel/food if attending)
2. Submits → saved to Supabase → email sent to organizer
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

*Some journeys take us away. Some memories always bring us back.*
**See You On Campus ❤️**
