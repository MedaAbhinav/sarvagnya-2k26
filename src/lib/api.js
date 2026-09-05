import { supabase, generateRegistrationId, isSupabaseConfigured } from './supabase'

// ── REGISTRATIONS ────────────────────────────────────────────

export async function submitRegistration(formData) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured — registration not saved')
    // Return a mock result so the UI flow still works for demo/testing
    return {
      registration_id: generateRegistrationId(),
      full_name: formData.fullName,
      phone: formData.phone,
      attendance_status: formData.attendance,
    }
  }

  const registrationId = generateRegistrationId()

  // Note: email, currentCity, specialMessage removed from form per requirements.
  // Stored as null — schema columns remain for backward compatibility.
  const payload = {
    registration_id:       registrationId,
    full_name:             formData.fullName,
    phone:                 formData.phone,
    email:                 null,           // field removed from form
    batch:                 formData.batch || '2006',
    gender:                formData.gender || null,
    current_city:          null,           // field removed from form
    attendance_status:     formData.attendance,
    family_members:        parseInt(formData.familyMembers) || 0,
    arrival_date:          formData.arrivalDate    || null,
    arrival_time:          formData.arrivalTime    || null,
    departure_date:        formData.departureDate  || null,
    departure_time:        formData.departureTime  || null,
    food_preference:       formData.foodPreference || null,
    accommodation_required: formData.accommodation === 'Yes',
    special_message:       null,           // field removed from form
    created_at:            new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('registrations')
    .insert([payload])
    .select()
    .single()

  if (error) throw error

  // Notify organizer via Edge Function (fire-and-forget — non-blocking)
  triggerRegistrationEmail(data).catch(() => {})

  return data
}

async function triggerRegistrationEmail(registration) {
  try {
    await supabase.functions.invoke('send-registration-email', {
      body: { registration },
    })
  } catch (_) {
    // Non-blocking — email failure does not affect registration
  }
}

// ── CONTRIBUTIONS ────────────────────────────────────────────

export async function submitContribution(contributionData) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured — contribution not saved')
    return { id: 'demo', ...contributionData }
  }

  // No transaction ID, no screenshot — organizer reconciles via bank/UPI app.
  const payload = {
    registration_id:     contributionData.registrationId,
    alumni_name:         contributionData.alumniName,
    email:               null,
    phone:               contributionData.phone       || null,
    attendance:          contributionData.attendance  || null,
    contribution_amount: parseFloat(contributionData.amount),
    payment_method:      'UPI',
    transaction_id:      null,
    screenshot_url:      null,
    payment_status:      'SUBMITTED',
    created_at:          new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('contributions')
    .insert([payload])
    .select()
    .single()

  if (error) throw error

  // Notify organizer (fire-and-forget)
  triggerContributionEmail(data).catch(() => {})

  return data
}

async function triggerContributionEmail(contribution) {
  try {
    await supabase.functions.invoke('send-contribution-email', {
      body: { contribution },
    })
  } catch (_) {
    // Non-blocking
  }
}

// ── ADMIN ────────────────────────────────────────────────────

export async function getAllRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, contributions(contribution_amount, payment_status)')
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
