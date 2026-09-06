const API_URL = import.meta.env.VITE_API_URL || "/api";
const LOCAL_DATABASE_KEY = "sarvagnya-2k26-database";
const NOTIFICATION_EMAIL =
  import.meta.env.VITE_FORMSUBMIT_EMAIL || "medaabhinav@gmail.com";

function generateRegistrationId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JNTU2006-${timestamp}-${random}`;
}

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Request failed");
    return body;
  } catch (error) {
    if (import.meta.env.VITE_API_URL) throw error;
    return requestLocal(path, options);
  }
}

function readLocalDatabase() {
  try {
    return (
      JSON.parse(localStorage.getItem(LOCAL_DATABASE_KEY)) || {
        registrations: [],
        contributions: [],
      }
    );
  } catch {
    return { registrations: [], contributions: [] };
  }
}

function writeLocalDatabase(database) {
  localStorage.setItem(LOCAL_DATABASE_KEY, JSON.stringify(database));
}

async function requestLocal(path, options) {
  const database = readLocalDatabase();
  const [resource, id] = path.split("/").filter(Boolean);
  const method = options.method || "GET";

  if (method === "GET" && resource === "registrations") {
    return database.registrations.map((registration) => ({
      ...registration,
      contributions: database.contributions.filter(
        (item) => item.registration_id === registration.registration_id,
      ),
    }));
  }
  if (method === "GET" && resource === "contributions")
    return database.contributions;

  const payload = options.body ? JSON.parse(options.body) : {};
  if (
    method === "POST" &&
    ["registrations", "contributions"].includes(resource)
  ) {
    const item = { id: Date.now(), ...payload };
    database[resource].push(item);
    writeLocalDatabase(database);
    return item;
  }
  if (method === "PATCH" && resource === "contributions") {
    const item = database.contributions.find(
      (entry) => String(entry.id) === id,
    );
    if (!item) throw new Error("Contribution not found");
    Object.assign(item, payload);
    writeLocalDatabase(database);
    return item;
  }
  throw new Error("Local database request failed");
}

async function sendNotification(type, payload, attachment = null) {
  try {
    const body = new FormData();
    body.append("_subject", `Sarvagnya 2K26 ${type} submission`);
    body.append("_template", "table");
    body.append("_captcha", "false");
    body.append("submission_type", type);
    Object.entries(payload).forEach(([key, value]) => {
      if (key !== "screenshot_url" && value !== null && value !== undefined) {
        body.append(key, String(value));
      }
    });
    body.append(
      "screenshot_status",
      attachment ? `Attached: ${attachment.name}` : "Not uploaded",
    );
    if (attachment) body.append("_attachment", attachment, attachment.name);

    const response = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(NOTIFICATION_EMAIL)}`,
      {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      },
    );
    if (!response.ok)
      throw new Error(`Email service returned ${response.status}`);
    return true;
  } catch (error) {
    console.error("Notification email failed:", error);
    return false;
  }
}

export async function submitRegistration(formData) {
  const payload = {
    registration_id: generateRegistrationId(),
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
  const data = await request("/registrations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await sendNotification("registration", payload);
  return data;
}

export async function submitContribution(
  contributionData,
  screenshotFile = null,
) {
  const screenshotUrl = screenshotFile
    ? await fileToDataUrl(screenshotFile)
    : null;
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
  const data = await request("/contributions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await sendNotification("contribution", payload, screenshotFile);
  return data;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function getAllRegistrations() {
  return request("/registrations");
}
export async function getAllContributions() {
  return request("/contributions");
}

export async function updatePaymentStatus(
  contributionId,
  status,
  notes = null,
) {
  return request(`/contributions/${contributionId}`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status: status, admin_notes: notes }),
  });
}
