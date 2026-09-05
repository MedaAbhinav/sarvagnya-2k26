// Supabase Edge Function — send-contribution-email
// Sends contribution details to BOTH admin email addresses.
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
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0,
  }).format(amount)
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; status: number; body: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in Edge Function secrets')
    return { ok: false, status: 0, body: 'RESEND_API_KEY missing' }
  }
  if (!to) return { ok: false, status: 0, body: 'Recipient missing' }

  console.log(`Sending contribution email to: ${to}`)

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
    console.error(`Resend error for ${to} — status ${res.status}: ${body}`)
  } else {
    console.log(`Contribution email sent to ${to}: ${body}`)
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const c = body?.contribution

    if (!c) {
      console.error('Request body missing "contribution" key')
      return new Response(
        JSON.stringify({ error: 'Missing contribution data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing contribution email for:', c.alumni_name, '| Amount:', c.contribution_amount)
    console.log('ADMIN_EMAIL_1:', ADMIN_EMAIL_1 || '(NOT SET)')
    console.log('ADMIN_EMAIL_2:', ADMIN_EMAIL_2 || '(NOT SET)')
    console.log('FROM_EMAIL:', FROM_EMAIL)
    console.log('RESEND_API_KEY set:', !!RESEND_API_KEY)

    const amountStr = formatCurrency(c.contribution_amount)
    const subject   = `New Contribution — Sarvagnya 2K26`

    const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#071220;">
<div style="font-family:Georgia,serif;background:#0a1628;color:#f0ead4;
            padding:32px 24px;max-width:600px;margin:20px auto;
            border:1px solid #1a3352;">

  <div style="border-bottom:2px solid #c49a38;padding-bottom:16px;margin-bottom:22px;">
    <p style="color:#c49a38;font-size:10px;letter-spacing:2.5px;
              text-transform:uppercase;margin:0 0 8px;">
      New Contribution · Sarvagnya 2K26 · JNTU Pulivendula
    </p>
    <h2 style="color:#f0ead4;font-size:24px;margin:0;font-weight:bold;">
      ${c.alumni_name}
    </h2>
  </div>

  <div style="background:#0f2236;border:1px solid #c49a38;
              padding:16px 20px;margin-bottom:22px;text-align:center;">
    <p style="color:#829ab1;font-size:10px;letter-spacing:2px;
              text-transform:uppercase;margin:0 0 6px;">Contribution Amount</p>
    <p style="color:#c49a38;font-size:36px;font-weight:bold;margin:0;">${amountStr}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;">
    ${row('Alumni Name',     c.alumni_name)}
    ${row('Phone',           c.phone)}
    ${row('Attendance',      c.attendance || '—')}
    ${row('Amount',          amountStr)}
    ${row('Registration ID', c.registration_id)}
    ${row('UPI ID',          'ashoknaik985@ybl')}
    ${row('Account Number',  '43063252956')}
    ${row('IFSC',            'SBIN0020858')}
    ${row('Status',          c.payment_status || 'SUBMITTED')}
    ${row('Submitted At',    c.created_at)}
  </table>

  <p style="color:#627d98;font-size:11px;margin-top:22px;text-align:center;font-style:italic;">
    Please verify this payment in your UPI / bank account.
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
    console.error('send-contribution-email unhandled error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
