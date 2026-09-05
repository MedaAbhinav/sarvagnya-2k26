import { supabase, generateRegistrationId, isSupabaseConfigured } from './supabase'

// ── REGISTRATIONS ────────────────────────────────────────────

export async function submitRegistration(formData) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured — returning mock data')
    return {
      registration_id: generateRegistrationId(),
      full_name: formData.fullName,
      phone: formData.phone,
      attendance_status: formData.attendance,
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

  // Call email function — log result but don't block registration flow
  triggerRegistrationEmail(data)

  return data
}

async function triggerRegistrationEmail(registration) {
  try {
    const { data, error } = await supabase.functions.invoke('send-registration-email', {
      body: { registration },
    })
    if (error) {
      console.error('Registration email function error:', error)
    } else {
      console.log('Registration email function response:', data)
    }
  } catch (err) {
    console.error('Registration email invoke failed:', err)
  }
}

// ── CONTRIBUTIONS ────────────────────────────────────────────

export async function submitContribution(contributionData) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured — returning mock data')
    return { id: 'demo', ...contributionData }
  }

  const payload = {
    registration_id:     contributionData.registrationId,
    alumni_name:         contributionData.alumniName,
    email:               null,
    phone:               contributionData.phone      || null,
    attendance:          contributionData.attendance || null,
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

  // Call email function — log result but don't block contribution flow
  triggerContributionEmail(data)

  return data
}

async function triggerContributionEmail(contribution) {
  try {
    const { data, error } = await supabase.functions.invoke('send-contribution-email', {
      body: { contribution },
    })
    if (error) {
      console.error('Contribution email function error:', error)
    } else {
      console.log('Contribution email function response:', data)
    }
  } catch (err) {
    console.error('Contribution email invoke failed:', err)
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
