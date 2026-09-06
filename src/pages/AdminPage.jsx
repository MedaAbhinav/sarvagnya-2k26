import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  RefreshCw,
  Download,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Users,
  Heart,
  Utensils,
  Home,
  TrendingUp,
  ChevronDown,
  X,
  Loader2,
  ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllRegistrations, updatePaymentStatus } from "../lib/api";
import { formatCurrency, formatDate, exportToCSV } from "../lib/utils";
import { COLLEGE, EVENT } from "../config";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin";

// ── Helpers ──────────────────────────────────────────────────

function AttendanceBadge({ status }) {
  const cls = {
    Yes: "bg-green-900/40 text-green-300 border border-green-700/40",
    No: "bg-red-900/40   text-red-300   border border-red-700/40",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-sans
                      font-semibold rounded-sm ${cls[status] || "text-navy-500"}`}
    >
      {status || "—"}
    </span>
  );
}

function ContribBadge({ contributed }) {
  return contributed ? (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold
                        font-sans rounded-sm bg-gold-500/15 text-gold-400
                        border border-gold-500/30"
    >
      <CheckCircle2 size={10} /> Contributed
    </span>
  ) : (
    <span
      className="inline-flex items-center px-2 py-0.5 text-xs font-semibold
                        font-sans rounded-sm bg-navy-800 text-navy-500
                        border border-navy-700"
    >
      Not Contributed
    </span>
  );
}

function StatCard({ label, value, icon, accent = false }) {
  return (
    <div
      className={`premium-card flex items-center gap-4
                     ${accent ? "border-gold-500/40 bg-gold-500/5" : ""}`}
    >
      <div className={`text-2xl ${accent ? "text-gold-400" : "text-navy-400"}`}>
        {icon}
      </div>
      <div>
        <p
          className="font-sans text-ivory-400/60 text-xs tracking-widest uppercase
                      leading-none mb-1"
        >
          {label}
        </p>
        <p
          className={`font-serif text-2xl font-bold
                       ${accent ? "text-gold-400" : "text-ivory-100"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterAttendance, setFilterAttendance] = useState("");
  const [filterContrib, setFilterContrib] = useState("");
  const [filterFood, setFilterFood] = useState("");

  const [selectedReg, setSelectedReg] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [screenshotModal, setScreenshotModal] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const regs = await getAllRegistrations();
      setRegistrations(regs || []);
    } catch {
      toast.error("Failed to load data. Is the local database server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchData();
  }, [authed, fetchData]);

  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setLoginError("");
    } else setLoginError("Incorrect password.");
  }

  async function handleStatusUpdate(contributionId, status) {
    setUpdatingId(contributionId);
    try {
      await updatePaymentStatus(contributionId, status);
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch {
      toast.error("Failed to update.");
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Derived stats ─────────────────────────────────────────
  const stats = {
    total: registrations.length,
    attending: registrations.filter((r) => r.attendance_status === "Yes")
      .length,
    notAttending: registrations.filter((r) => r.attendance_status === "No")
      .length,
    totalGuests: registrations.reduce((s, r) => s + (r.family_members || 0), 0),
    veg: registrations.filter((r) => r.food_preference === "Vegetarian").length,
    nonVeg: registrations.filter((r) => r.food_preference === "Non-Vegetarian")
      .length,
    accommodation: registrations.filter((r) => r.accommodation_required).length,
    contributed: registrations.filter((r) => r.contributions?.length > 0)
      .length,
    totalAmount: registrations.reduce((s, r) => {
      const c = r.contributions?.[0];
      return s + (c ? c.contribution_amount || 0 : 0);
    }, 0),
  };

  // ── Filtered ──────────────────────────────────────────────
  const filtered = registrations.filter((r) => {
    const q = search.toLowerCase();
    const con = r.contributions?.[0];
    const hasContrib = !!con;

    const matchSearch =
      !q ||
      r.full_name?.toLowerCase().includes(q) ||
      r.phone?.includes(q) ||
      r.registration_id?.toLowerCase().includes(q);
    const matchAtt =
      !filterAttendance || r.attendance_status === filterAttendance;
    const matchFood = !filterFood || r.food_preference === filterFood;
    const matchContrib =
      !filterContrib ||
      (filterContrib === "yes" && hasContrib) ||
      (filterContrib === "no" && !hasContrib);

    return matchSearch && matchAtt && matchFood && matchContrib;
  });

  // ── CSV export helper — flatten registration + contribution ─
  function exportAll() {
    const rows = filtered.map((r) => {
      const con = r.contributions?.[0];
      return {
        registration_id: r.registration_id,
        full_name: r.full_name,
        phone: r.phone,
        batch: r.batch || "2006",
        gender: r.gender || "",
        attendance: r.attendance_status,
        family_members: r.family_members ?? 0,
        arrival_date: r.arrival_date || "",
        arrival_time: r.arrival_time || "",
        departure_date: r.departure_date || "",
        departure_time: r.departure_time || "",
        food_preference: r.food_preference || "",
        accommodation: r.accommodation_required ? "Yes" : "No",
        contributed: con ? "Yes" : "No",
        contribution_amount: con ? con.contribution_amount : "",
        contribution_status: con ? con.payment_status : "",
        screenshot: con?.screenshot_url ? "Yes" : "No",
        registered_at: r.created_at,
      };
    });
    exportToCSV(rows, "sarvagnya-2k26-registrations");
  }

  // ── Login ─────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-10">
            <p className="font-script text-gold-400 text-2xl mb-2">
              Admin Access
            </p>
            <h1 className="font-serif text-ivory-100 text-3xl font-bold">
              {EVENT.title}
            </h1>
            <p className="font-sans text-ivory-400/50 text-xs tracking-widest uppercase mt-2">
              {COLLEGE.fullName}
            </p>
          </div>
          <form onSubmit={handleLogin} className="premium-card space-y-5">
            <div>
              <label className="form-label">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-input ${loginError ? "border-red-500" : ""}`}
                placeholder="Enter admin password"
                autoFocus
              />
              {loginError && <p className="form-error mt-2">{loginError}</p>}
            </div>
            <button type="submit" className="btn-primary w-full py-4">
              Access Dashboard
            </button>
          </form>
          <p className="text-center font-sans text-navy-600 text-xs mt-6">
            Set VITE_ADMIN_PASSWORD in your .env file
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-navy-950">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-navy-900/95 border-b border-navy-800 navbar-glass">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-serif text-gold-400 text-base font-bold whitespace-nowrap">
              Admin Dashboard
            </span>
            <span className="hidden sm:inline font-sans text-navy-500 text-xs truncate">
              · {EVENT.title}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn-ghost text-xs gap-1.5 py-1.5"
              aria-label="Refresh"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setAuthed(false)}
              className="btn-ghost text-xs text-red-400 hover:text-red-300 gap-1.5 py-1.5"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <StatCard
            label="Registered"
            value={stats.total}
            icon={<Users size={22} />}
            accent
          />
          <StatCard label="Attending" value={stats.attending} icon="✅" />
          <StatCard
            label="Not Attending"
            value={stats.notAttending}
            icon="❌"
          />
          <StatCard label="Total Guests" value={stats.totalGuests} icon="👨‍👩‍👧" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Vegetarian"
            value={stats.veg}
            icon={<Utensils size={22} />}
          />
          <StatCard label="Non-Veg" value={stats.nonVeg} icon="🍖" />
          <StatCard
            label="Accommodation"
            value={stats.accommodation}
            icon={<Home size={22} />}
          />
          <StatCard
            label="Contributed"
            value={stats.contributed}
            icon={<TrendingUp size={22} />}
            accent
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <StatCard
            label="Total Contributions"
            value={formatCurrency(stats.totalAmount)}
            icon={<Heart size={22} />}
            accent
          />
          <StatCard
            label="Not Contributed"
            value={stats.total - stats.contributed}
            icon="—"
          />
        </div>

        {/* Controls */}
        <div
          className="flex flex-col sm:flex-row gap-4 items-start
                        sm:items-center justify-between mb-6"
        >
          <p className="font-sans text-ivory-400/60 text-sm">
            Showing{" "}
            <strong className="text-ivory-200">{filtered.length}</strong> of{" "}
            {registrations.length} registrations
          </p>

          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2
                                            text-navy-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Name / Phone / Reg ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-9 py-2 text-sm w-full sm:w-52"
              />
            </div>

            <FilterSelect
              value={filterAttendance}
              onChange={setFilterAttendance}
              options={[
                ["", "All Attendance"],
                ["Yes", "Attending"],
                ["No", "Not Attending"],
              ]}
            />
            <FilterSelect
              value={filterContrib}
              onChange={setFilterContrib}
              options={[
                ["", "All Contributions"],
                ["yes", "Contributed"],
                ["no", "Not Contributed"],
              ]}
            />
            <FilterSelect
              value={filterFood}
              onChange={setFilterFood}
              options={[
                ["", "All Food"],
                ["Vegetarian", "Veg"],
                ["Non-Vegetarian", "Non-Veg"],
              ]}
            />

            <button
              onClick={exportAll}
              className="btn-ghost text-xs gap-1.5 py-2 border border-navy-700
                         hover:border-navy-500"
            >
              <Download size={13} />
              CSV
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-gold-400" />
          </div>
        )}

        {/* ── Registrations table — ALL registrations ── */}
        {!loading && (
          <div className="overflow-x-auto rounded-sm border border-navy-800">
            <table className="w-full text-sm font-sans min-w-[900px]">
              <thead>
                <tr className="bg-navy-900 border-b border-navy-800">
                  {[
                    "Name",
                    "Phone",
                    "Att.",
                    "Guests",
                    "Food",
                    "Accom.",
                    "Contribution",
                    "Amount",
                    "Screenshot",
                    "Registered",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-ivory-400/50 text-xs
                                 tracking-widest uppercase font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-12 text-center text-navy-500 font-sans text-sm"
                    >
                      {registrations.length === 0
                        ? "No registrations yet."
                        : "No results match your filters."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => {
                    const con = r.contributions?.[0];
                    return (
                      <tr
                        key={r.id || i}
                        className="border-b border-navy-800/50 hover:bg-navy-900/50
                                 transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-ivory-200 whitespace-nowrap">
                          {r.full_name}
                        </td>
                        <td className="px-4 py-3 text-ivory-400 font-mono text-xs">
                          {r.phone}
                        </td>
                        <td className="px-4 py-3">
                          <AttendanceBadge status={r.attendance_status} />
                        </td>
                        <td className="px-4 py-3 text-ivory-400 text-center">
                          {r.family_members ?? 0}
                        </td>
                        <td className="px-4 py-3 text-ivory-400/70 text-xs whitespace-nowrap">
                          {r.food_preference || "—"}
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          {r.accommodation_required ? "✅" : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <ContribBadge contributed={!!con} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {con ? (
                            <span className="text-gold-400 font-semibold">
                              {formatCurrency(con.contribution_amount)}
                            </span>
                          ) : (
                            <span className="text-navy-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {con?.screenshot_url ? (
                            <button
                              onClick={() =>
                                setScreenshotModal(con.screenshot_url)
                              }
                              className="inline-flex items-center gap-1 text-gold-400
                                         hover:text-gold-300 transition-colors text-xs
                                         font-sans font-semibold"
                            >
                              <ImageIcon size={13} /> View
                            </button>
                          ) : (
                            <span className="text-navy-600 text-xs">
                              Not uploaded
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-ivory-400/50 text-xs whitespace-nowrap">
                          {formatDate(r.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedReg(r)}
                            className="text-navy-400 hover:text-gold-400 transition-colors"
                            aria-label="View full details"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Full registration detail modal ── */}
      <AnimatePresence>
        {selectedReg && (
          <Modal
            onClose={() => setSelectedReg(null)}
            title="Registration Details"
          >
            {/* Registration info */}
            <DetailGrid
              data={{
                "Registration ID": selectedReg.registration_id,
                "Full Name": selectedReg.full_name,
                Phone: selectedReg.phone,
                Batch: selectedReg.batch || "2006",
                Gender: selectedReg.gender || "—",
                Attendance: selectedReg.attendance_status,
                "Family Members": selectedReg.family_members ?? 0,
                "Arrival Date": formatDate(selectedReg.arrival_date),
                "Arrival Time": selectedReg.arrival_time || "—",
                "Departure Date": formatDate(selectedReg.departure_date),
                "Departure Time": selectedReg.departure_time || "—",
                "Food Preference": selectedReg.food_preference || "—",
                Accommodation: selectedReg.accommodation_required
                  ? "Yes"
                  : "No",
                "Registered At": formatDate(selectedReg.created_at),
              }}
            />

            {/* Contribution info */}
            {(() => {
              const con = selectedReg.contributions?.[0];
              return (
                <div className="mt-6 pt-5 border-t border-navy-700/50">
                  <p
                    className="font-sans text-ivory-400/50 text-xs tracking-widest
                                uppercase mb-4"
                  >
                    Contribution
                  </p>
                  {con ? (
                    <div className="space-y-3">
                      <DetailGrid
                        data={{
                          Amount: formatCurrency(con.contribution_amount),
                          Status: con.payment_status,
                          Submitted: formatDate(con.created_at),
                        }}
                      />

                      {/* Screenshot + status update */}
                      {con.screenshot_url && (
                        <div className="mt-3">
                          <button
                            onClick={() =>
                              setScreenshotModal(con.screenshot_url)
                            }
                            className="btn-outline text-xs py-2 px-4 gap-2"
                          >
                            <ImageIcon size={13} /> View Payment Screenshot
                          </button>
                        </div>
                      )}

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleStatusUpdate(con.id, "VERIFIED")}
                          disabled={
                            updatingId === con.id ||
                            con.payment_status === "VERIFIED"
                          }
                          className="flex-1 btn-primary py-2.5 text-xs gap-1.5
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingId === con.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          Mark Verified
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(con.id, "REJECTED")}
                          disabled={
                            updatingId === con.id ||
                            con.payment_status === "REJECTED"
                          }
                          className="flex-1 inline-flex items-center justify-center gap-1.5
                                     py-2.5 px-4 text-xs font-sans font-semibold tracking-widest
                                     uppercase border border-red-700/60 text-red-400
                                     hover:bg-red-900/20 transition-all duration-200
                                     disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-sans text-navy-500 text-sm">
                      This person did not contribute.
                    </p>
                  )}
                </div>
              );
            })()}
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Screenshot lightbox ── */}
      <AnimatePresence>
        {screenshotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy-950/95 flex items-center
                       justify-center p-4"
            onClick={() => setScreenshotModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full"
            >
              <button
                onClick={() => setScreenshotModal(null)}
                className="absolute -top-10 right-0 text-ivory-400 hover:text-ivory-100
                           transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
              <img
                src={screenshotModal}
                alt="Payment screenshot"
                className="w-full rounded border border-navy-700 max-h-[80vh]
                           object-contain bg-navy-900"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-input py-2 text-xs pr-7 appearance-none cursor-pointer"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2
                                         text-navy-400 pointer-events-none"
      />
    </div>
  );
}

function Modal({ onClose, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-navy-950/90 navbar-glass
                 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="premium-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div
          className="flex items-center justify-between mb-6 pb-4
                        border-b border-navy-700/50"
        >
          <h3 className="font-serif text-ivory-100 text-lg font-semibold">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-navy-400 hover:text-ivory-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function DetailGrid({ data }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
      {Object.entries(data).map(([k, v]) => (
        <div key={k}>
          <p className="font-sans text-ivory-400/50 text-xs tracking-widest uppercase mb-0.5">
            {k}
          </p>
          <p className="font-sans text-ivory-200 text-sm font-medium break-words">
            {String(v)}
          </p>
        </div>
      ))}
    </div>
  );
}
