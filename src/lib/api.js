import { supabase, generateRegistrationId, SUPABASE_URL } from "./supabase";

const FUNCTIONS_URL =
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
  SUPABASE_URL.replace(".supabase.co", ".functions.supabase.co");

const FORMSUBMIT_EMAIL = import.meta.env.VITE_FORMSUBMIT_EMAIL || "";

async function sendToFormsubmit(formName, payload) {
  if (!FORMSUBMIT_EMAIL) throw new Error("Formsubmit email not configured");
  const url = `https://formsubmit.co/ajax/${encodeURIComponent(FORMSUBMIT_EMAIL)}`;
  const body = { form: formName, ...payload };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await resp.json();
  if (!resp.ok) throw new Error(JSON.stringify(json));
  return json;
}

async function callFunction(name, payload) {
  try {
    const url = `${FUNCTIONS_URL.replace(/\/$/, "")}/${name}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(JSON.stringify(json));
    return json.data || json;
  } catch (err) {
    console.error("Function call failed", name, err);
    throw err;
  }
}

// ── REGISTRATIONS ────────────────────────────────────────────

export async function submitRegistration(formData) {
  const registrationId = generateRegistrationId();

  const payload = {
    registration_id: registrationId,
    full_name: formData.fullName,
    phone: formData.phone,
    email: null,
    batch: formData.batch || "2006",
    gender: formData.gender || null,
    current_city: null,
    attendance_status: formData.attendance,
    family_members: parseInt(formData.familyMembers) || 0,
    arrival_date: formData.arrivalDate || null,
    arrival_time: formData.arrivalTime || null,
    departure_date: formData.departureDate || null,
    departure_time: formData.departureTime || null,
    food_preference: formData.foodPreference || null,
    accommodation_required: formData.accommodation === "Yes",
    special_message: null,
    created_at: new Date().toISOString(),
  };

  console.log("Submitting registration to Supabase...");
  const { data, error } = await supabase
    .from("registrations")
    .insert([payload])
    .select()
    .single();
  if (error) {
    console.error("Supabase error:", error.code, error.message);
    // Fallback: if RLS prevents anonymous insert, call Edge Function (service role)
    if (
      String(error.message || "")
        .toLowerCase()
        .includes("row-level security") ||
      String(error.message || "")
        .toLowerCase()
        .includes("violates row-level")
    ) {
      try {
        const fnData = await callFunction("submit-registration", payload);
        return fnData;
      } catch (err) {
        // If function not deployed or failed, fallback to FormSubmit.co (email)
        if (FORMSUBMIT_EMAIL) {
          await sendToFormsubmit("registration", payload);
          return { registration_id: payload.registration_id };
        }
        throw err;
      }
    }
    throw new Error(error.message);
  }
  console.log("Saved:", data.registration_id);
  return data;
}

// ── CONTRIBUTIONS ────────────────────────────────────────────

export async function submitContribution(
  contributionData,
  screenshotFile = null,
) {
  let screenshotUrl = null;
  if (screenshotFile) {
    screenshotUrl = await uploadScreenshot(
      contributionData.registrationId,
      screenshotFile,
    );
  }

  const payload = {
    registration_id: contributionData.registrationId,
    alumni_name: contributionData.alumniName,
    email: null,
    phone: contributionData.phone || null,
    attendance: contributionData.attendance || null,
    contribution_amount: parseFloat(contributionData.amount) || 0,
    payment_method: "UPI",
    transaction_id: null,
    screenshot_url: screenshotUrl,
    payment_status: "SUBMITTED",
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("contributions")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Contribution error:", error.code, error.message);
    if (
      String(error.message || "")
        .toLowerCase()
        .includes("row-level security") ||
      String(error.message || "")
        .toLowerCase()
        .includes("violates row-level")
    ) {
      try {
        const fnData = await callFunction("submit-contribution", payload);
        return fnData;
      } catch (err) {
        if (FORMSUBMIT_EMAIL) {
          await sendToFormsubmit("contribution", payload);
          return { registration_id: payload.registration_id };
        }
        throw err;
      }
    }
    throw new Error(error.message);
  }
  return data;
}

async function uploadScreenshot(registrationId, file) {
  try {
    const ext = file.name.split(".").pop().toLowerCase();
    const fileName = `${registrationId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("payment-screenshots")
      .upload(fileName, file, { contentType: file.type, upsert: false });
    if (error) {
      console.error("Upload error:", error.message);
      return null;
    }
    const { data } = supabase.storage
      .from("payment-screenshots")
      .getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (err) {
    console.error("Screenshot failed:", err);
    return null;
  }
}

// ── ADMIN ────────────────────────────────────────────────────

export async function getAllRegistrations() {
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "*, contributions(id, contribution_amount, payment_status, screenshot_url, created_at)",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllContributions() {
  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updatePaymentStatus(
  contributionId,
  status,
  notes = null,
) {
  const update = { payment_status: status };
  if (notes) update.admin_notes = notes;
  const { data, error } = await supabase
    .from("contributions")
    .update(update)
    .eq("id", contributionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
