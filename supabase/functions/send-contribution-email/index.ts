// Supabase Edge Function — send-contribution-email
// Sends contribution details to BOTH admin email addresses.
// Generates a signed URL for the payment screenshot server-side
// using the service role key — the private bucket is never exposed.
//
// Required secrets (Supabase Dashboard → Edge Functions → Manage Secrets):
//   RESEND_API_KEY         = your Resend API key
//   ADMIN_EMAIL_1          = medaabhinav7@gmail.com
//   ADMIN_EMAIL_2          = narayanaashoknaik9@gmail.com
//   FROM_EMAIL             = onboarding@resend.dev (or verified domain)
//   SUPABASE_URL           = your project URL  (auto-available in Edge Functions)
//   SERVICE_ROLE_KEY       = your service role key (set manually as a secret)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY       = Deno.env.get('RESEND_API_KEY')            ?? ''
const ADMIN_EMAIL_1        = Deno.env.get('ADMIN_EMAIL_1')             ?? ''
const ADMIN_EMAIL_2        = Deno.env.get('ADMIN_EMAIL_2')             ?? ''
const FROM_EMAIL           = Deno.env.get('FROM_EMAIL')                ?? 'onboarding@resend.dev'
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')    ?? ''
const SERVICE_ROLE_KEY     = Deno.env.get('SERVICE_ROLE_KEY') ?? ''

// Signed URL validity — 7 days in seconds
const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 7

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

/**
 * Generate a signed URL for a private bucket file.
 * Uses the service role key — never exposed to the frontend.
 * Returns null if the path is empty or signing fails.
 */
async function getSignedScreenshotUrl(storagePath: string): Promise<string | null> {
  if (!storagePath || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    if (!SERVICE_ROLE_KEY) {
      console.error('SERVICE_ROLE_KEY not set — cannot generate signed URL')
    }
    return null
  }

  try {
    // Create a service-role client — only inside Edge Functions, never in frontend
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const { data, error } = await adminClient.storage
      .from('payment-screenshots')
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY)

    if (error) {
      console.error('Signed URL error:', error.message)
      return null
    }

    return data?.signedUrl ?? null
  } catch (err) {
    console.error('Signed URL generation failed:', err)
    return null
  }
}

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; status: number; body: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set')
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
    console.error(`Resend error for ${to} — ${res.status}: ${body}`)
  } else {
    console.log(`Email sent to ${to}`)
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
      return new Response(
        JSON.stringify({ error: 'Missing contribution data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Contribution email for:', c.alumni_name, '| Amount:', c.contribution_amount)
    console.log('screenshot_url (path):', c.screenshot_url || '(none)')
    console.log('ADMIN_EMAIL_1:', ADMIN_EMAIL_1 || '(NOT SET)')
    console.log('ADMIN_EMAIL_2:', ADMIN_EMAIL_2 || '(NOT SET)')
    console.log('SERVICE_ROLE_KEY set:', !!SERVICE_ROLE_KEY)
    const amountStr = formatCurrency(c.contribution_amount)
    const isNotInterested = c.payment_status === 'NOT_INTERESTED'

    // Generate signed URL server-side — private bucket, secure link
    // screenshot_url column now stores the storage path (e.g. "JNTU2006-xxx.jpg")
    let signedUrl: string | null = null
    if (c.screenshot_url && !isNotInterested) {
      signedUrl = await getSignedScreenshotUrl(c.screenshot_url)
      console.log('Signed URL generated:', signedUrl ? 'YES' : 'FAILED')
    }

    const screenshotHtml = signedUrl
      ? `<tr>
           <td style="padding:9px 14px;color:#829ab1;font-size:11px;text-transform:uppercase;
                      letter-spacing:1.2px;white-space:nowrap;border-bottom:1px solid #1a3352;
                      vertical-align:top;width:160px;">Screenshot</td>
           <td style="padding:9px 14px;border-bottom:1px solid #1a3352;">
             <a href="${signedUrl}"
                style="color:#c49a38;font-size:13px;text-decoration:none;">
               View Payment Screenshot →
             </a>
             <br>
             <span style="color:#627d98;font-size:10px;">
               Link valid for 7 days
             </span>
           </td>
         </tr>`
      : row('Screenshot', c.screenshot_url ? 'Uploaded (signed link generation failed)' : '—')

    const subject = isNotInterested
      ? `Registration — Not Contributing · Sarvagnya 2K26`
      : `New Contribution — Sarvagnya 2K26`

    const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#071220;">
<div style="font-family:Georgia,serif;background:#0a1628;color:#f0ead4;
            padding:32px 24px;max-width:600px;margin:20px auto;
            border:1px solid #1a3352;">

  <div style="border-bottom:2px solid #c49a38;padding-bottom:16px;margin-bottom:22px;">
    <p style="color:#c49a38;font-size:10px;letter-spacing:2.5px;
              text-transform:uppercase;margin:0 0 8px;">
      ${isNotInterested ? 'Registration Complete · No Contribution' : 'New Contribution'} · Sarvagnya 2K26
    </p>
    <h2 style="color:#f0ead4;font-size:24px;margin:0;font-weight:bold;">
      ${c.alumni_name}
    </h2>
  </div>

  ${!isNotInterested ? `
  <div style="background:#0f2236;border:1px solid #c49a38;
              padding:16px 20px;margin-bottom:22px;text-align:center;">
    <p style="color:#829ab1;font-size:10px;letter-spacing:2px;
              text-transform:uppercase;margin:0 0 6px;">Contribution Amount</p>
    <p style="color:#c49a38;font-size:36px;font-weight:bold;margin:0;">${amountStr}</p>
  </div>` : ''}

  <table style="width:100%;border-collapse:collapse;">
    ${row('Alumni Name',     c.alumni_name)}
    ${row('Phone',           c.phone)}
    ${row('Attendance',      c.attendance || '—')}
    ${row('Amount',          isNotInterested ? 'Not contributing' : amountStr)}
    ${row('Registration ID', c.registration_id)}
    ${!isNotInterested ? row('UPI ID',         'ashoknaik985@ybl') : ''}
    ${!isNotInterested ? row('Account Number', '43063252956') : ''}
    ${!isNotInterested ? row('IFSC',           'SBIN0020858') : ''}
    ${row('Status',          c.payment_status || 'SUBMITTED')}
    ${screenshotHtml}
    ${row('Submitted At',    c.created_at)}
  </table>

  ${!isNotInterested ? `
  <p style="color:#627d98;font-size:11px;margin-top:22px;text-align:center;font-style:italic;">
    Please verify this payment in your UPI / bank account.
  </p>` : ''}
  <p style="color:#334e68;font-size:10px;margin-top:6px;text-align:center;
            letter-spacing:1px;text-transform:uppercase;">
    JNTU College of Engineering, Pulivendula · 2006 Batch Alumni Reunion 2026
  </p>
</div>
</body>
</html>`

    const [result1, result2] = await Promise.all([
      ADMIN_EMAIL_1
        ? sendEmail(ADMIN_EMAIL_1, subject, html)
        : Promise.resolve({ ok: false, status: 0, body: 'ADMIN_EMAIL_1 not set' }),
      ADMIN_EMAIL_2
        ? sendEmail(ADMIN_EMAIL_2, subject, html)
        : Promise.resolve({ ok: false, status: 0, body: 'ADMIN_EMAIL_2 not set' }),
    ])

    const success = result1.ok || result2.ok

    return new Response(
      JSON.stringify({
        success,
        signedUrlGenerated: !!signedUrl,
        email1: { to: ADMIN_EMAIL_1 || 'not set', ...result1 },
        email2: { to: ADMIN_EMAIL_2 || 'not set', ...result2 },
      }),
      {
        status: success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('send-contribution-email error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
