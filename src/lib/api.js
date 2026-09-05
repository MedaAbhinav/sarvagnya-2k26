import { supabase, generateRegistrationId, isSupabaseConfigured } from './supabase'

// ── REGISTRATIONS ────────────────────────────────────────────

export async function submitRegistration(formData) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured — returning mock data')
    return {
      registration_id:    generateRegistrationId(),
      full_name:          formData.fullName,
      phone:              formData.phone,
      attendance_status:  formData.attendance,
    }
  }

  const registrationId = generateRegistrationId()

  const payload = {
    registration_id:        registrationId,
    full_name:              formData.fullName,
    phone:                  formData.phone,
    email:                  null,
    batch:                  formData.batch || '2006',
    gender:                 formData.gender || null,
    current_city:           null,
    attendance_status:      formData.attendance,
    family_members:         parseInt(formData.familyMembers) || 0,
    arrival_date:           formData.arrivalDate   || null,
    arrival_time:           formData.arrivalTime   || null,
    departure_date:         formData.departureDate || null,
    departure_time:         formData.departureTime || null,
    food_preference:        formData.foodPreference || null,
    accommodation_required: formData.accommodation === 'Yes',
    special_message:        null,
    created_at:             new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('registrations')
    .insert([payload])
    .select()
    .single()

  if (error) throw error

  // Email notification (non-blocking)
  triggerRegistrationEmail(data)

  return data
}

async function triggerRegistrationEmail(registration) {
  try {
    const { data, error } = await supabase.functions.invoke('send-registration-email', {
      body: { registration },
    })
    if (error) console.error('Registration email error:', error)
    else console.log('Registration email sent:', data)
  } catch (err) {
    console.error('Registration email invoke failed:', err)
  }
}

// ── CONTRIBUTIONS ────────────────────────────────────────────

/**
 * Submit a contribution with optional screenshot file.
 * @param {object} contributionData
 * @param {File|null} screenshotFile  - Optional payment screenshot
 */
export async function submitContribution(contributionData, screenshotFile = null) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured — returning mock data')
    return { id: 'demo', ...contributionData }
  }

  let screenshotUrl = null

  // Upload screenshot if provided
  if (screenshotFile) {
    screenshotUrl = await uploadScreenshot(
      contributionData.registrationId,
      screenshotFile
    )
  }

  const payload = {
    registration_id:     contributionData.registrationId,
    alumni_name:         contributionData.alumniName,
    email:               null,
    phone:               contributionData.phone      || null,
    attendance:          contributionData.attendance || null,
    contribution_amount: parseFloat(contributionData.amount) || 0,
    payment_method:      'UPI',
    transaction_id:      null,
    screenshot_url:      screenshotUrl,
    payment_status:      contributionData.status || 'SUBMITTED',
    created_at:          new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('contributions')
    .insert([payload])
    .select()
    .single()

  if (error) throw error

  // Email notification (non-blocking)
  triggerContributionEmail(data)

  return data
}

async function uploadScreenshot(registrationId, file) {
  try {
    const ext      = file.name.split('.').pop()
    const fileName = `${registrationId}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('payment-screenshots')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Screenshot upload error:', error)
      return null
    }

    // Bucket is PRIVATE — store the storage path only.
    // The Edge Function uses the service role key to generate
    // a signed URL server-side when sending the admin email.
    return fileName
  } catch (err) {
    console.error('Screenshot upload failed:', err)
    return null
  }
}

async function triggerContributionEmail(contribution) {
  try {
    const { data, error } = await supabase.functions.invoke('send-contribution-email', {
      body: { contribution },
    })
    if (error) console.error('Contribution email error:', error)
    else console.log('Contribution email sent:', data)
  } catch (err) {
    console.error('Contribution email invoke failed:', err)
  }
}

// ── ADMIN ────────────────────────────────────────────────────

export async function getAllRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, contributions(contribution_amount, payment_status, screenshot_url)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAllContributions() {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updatePaymentStatus(contributionId, status, notes = null) {
  const update = { payment_status: status }
  if (notes) update.admin_notes = notes
  const { data, error } = await supabase
    .from('contributions')
    .update(update)
    .eq('id', contributionId)
    .select()
    .single()
  if (error) throw error
  return data
}
