// Supabase Edge Function — send-registration-email
// Sends full registration details to BOTH admin email addresses.
//
// Required secrets — set in Supabase Dashboard → Edge Functions → Manage Secrets:
//   RESEND_API_KEY  = your Resend API key (from resend.com)
//   ADMIN_EMAIL_1   = medaabhinav7@gmail.com
//   ADMIN_EMAIL_2   = narayanaashoknaik9@gmail.com
//   FROM_EMAIL      = onboarding@resend.dev  (use this for testing)
//                     or your verified domain sender for production

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const ADMIN_EMAIL_1  = Deno.env.get('ADMIN_EMAIL_1')  ?? ''
const ADMIN_EMAIL_2  = Deno.env.get('ADMIN_EMAIL_2')  ?? ''
// Use onboarding@resend.dev as fallback — works for testing without domain verification
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev'

// CORS headers — required for supabase.functions.invoke() from browser
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; status: number; body: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in Edge Function secrets')
    return { ok: false, status: 0, body: 'RESEND_API_KEY missing' }
  }
  if (!to) {
    console.error('Recipient email address is empty')
    return { ok: false, status: 0, body: 'Recipient missing' }
  }

  console.log(`Sending email to: ${to} from: ${FROM_EMAIL}`)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })

  const body = await res.text()
  if (!res.ok) {
    console.error(`Resend error sending to ${to} — status ${res.status}: ${body}`)
  } else {
    console.log(`Email sent successfully to ${to}: ${body}`)
  }
  return { ok: res.ok, status: res.status, body }
}

function row(label: string, value: unknown): string {
  const v = (value === null || value === undefined || value === '') ? '—' : String(value)
  return `
    <tr>
      <td style="padding:9px 14px;color:#829ab1;font-size:11px;text-transform:uppercase;
                 letter-spacing:1.2px;white-space:nowrap;border-bottom:1px solid #1a3352;
                 vertical-align:top;width:160px;">${label}</td>
      <td style="padding:9px 14px;color:#f0ead4;font-size:13px;
                 border-bottom:1px solid #1a3352;word-break:break-word;">${v}</td>
    </tr>`
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const r = body?.registration

    if (!r) {
      console.error('Request body missing "registration" key')
      return new Response(
        JSON.stringify({ error: 'Missing registration data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing registration email for:', r.full_name, '| ID:', r.registration_id)
    console.log('ADMIN_EMAIL_1:', ADMIN_EMAIL_1 || '(NOT SET)')
    console.log('ADMIN_EMAIL_2:', ADMIN_EMAIL_2 || '(NOT SET)')
    console.log('FROM_EMAIL:', FROM_EMAIL)
    console.log('RESEND_API_KEY set:', !!RESEND_API_KEY)

    const subject = `New 2006 Batch Alumni Registration — Sarvagnya 2K26`

    const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#071220;">
<div style="font-family:Georgia,serif;background:#0a1628;color:#f0ead4;
            padding:32px 24px;max-width:600px;margin:20px auto;
            border:1px solid #1a3352;">

  <div style="border-bottom:2px solid #c49a38;padding-bottom:16px;margin-bottom:22px;">
    <p style="color:#c49a38;font-size:10px;letter-spacing:2.5px;
              text-transform:uppercase;margin:0 0 8px;">
      New Registration · Sarvagnya 2K26 · JNTU Pulivendula
    </p>
    <h2 style="color:#f0ead4;font-size:24px;margin:0;font-weight:bold;">
      ${r.full_name}
    </h2>
    <p style="color:#829ab1;font-size:13px;margin:4px 0 0;">
      📞 ${r.phone || '—'}
    </p>
  </div>

  <table style="width:100%;border-collapse:collapse;">
    ${row('Registration ID',  r.registration_id)}
    ${row('Full Name',        r.full_name)}
    ${row('Phone',            r.phone)}
    ${row('Batch',            r.batch || '2006')}
    ${row('Gender',           r.gender)}
    ${row('Attendance',       r.attendance_status)}
    ${row('Family Members',   r.family_members ?? 0)}
    ${row('Arrival Date',     r.arrival_date)}
    ${row('Arrival Time',     r.arrival_time)}
    ${row('Departure Date',   r.departure_date)}
    ${row('Departure Time',   r.departure_time)}
    ${row('Food Preference',  r.food_preference)}
    ${row('Accommodation',    r.accommodation_required ? 'Yes' : 'No')}
    ${row('Registered At',    r.created_at)}
  </table>

  <p style="color:#627d98;font-size:11px;margin-top:22px;text-align:center;font-style:italic;">
    View all registrations in Supabase → Table Editor → registrations
  </p>
  <p style="color:#334e68;font-size:10px;margin-top:6px;text-align:center;
            letter-spacing:1px;text-transform:uppercase;">
    JNTU College of Engineering, Pulivendula · 2006 Batch Alumni Reunion 2026
  </p>
</div>
</body>
</html>`

    const [result1, result2] = await Promise.all([
      ADMIN_EMAIL_1 ? sendEmail(ADMIN_EMAIL_1, subject, html) : Promise.resolve({ ok: false, status: 0, body: 'ADMIN_EMAIL_1 not set' }),
      ADMIN_EMAIL_2 ? sendEmail(ADMIN_EMAIL_2, subject, html) : Promise.resolve({ ok: false, status: 0, body: 'ADMIN_EMAIL_2 not set' }),
    ])

    const success = result1.ok || result2.ok

    return new Response(
      JSON.stringify({
        success,
        email1: { to: ADMIN_EMAIL_1 || 'not set', ...result1 },
        email2: { to: ADMIN_EMAIL_2 || 'not set', ...result2 },
      }),
      {
        status: success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('send-registration-email unhandled error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
