import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, RefreshCw, Download, Search, Eye,
  CheckCircle2, XCircle, Clock, Users, Heart,
  Utensils, Home, TrendingUp, ChevronDown, X, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllRegistrations, getAllContributions, updatePaymentStatus } from '../lib/api'
import { formatCurrency, formatDate, exportToCSV } from '../lib/utils'
import { COLLEGE, EVENT } from '../config'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin'

// ── Helpers ──────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    SUBMITTED: { cls: 'status-pending',  icon: <Clock size={11} />,        label: 'Submitted' },
    VERIFIED:  { cls: 'status-verified', icon: <CheckCircle2 size={11} />, label: 'Verified'  },
    REJECTED:  { cls: 'status-rejected', icon: <XCircle size={11} />,      label: 'Rejected'  },
  }
  const s = map[status] || map.SUBMITTED
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold
                      font-sans rounded-sm ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  )
}

function AttendanceBadge({ status }) {
  const cls = {
    Yes:   'bg-green-900/40 text-green-300 border border-green-700/40',
    No:    'bg-red-900/40 text-red-300 border border-red-700/40',
    Maybe: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/40',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-sans
                      font-semibold rounded-sm ${cls[status] || ''}`}>
      {status || '—'}
    </span>
  )
}

function StatCard({ label, value, icon, accent = false }) {
  return (
    <div className={`premium-card flex items-center gap-4
                     ${accent ? 'border-gold-500/40 bg-gold-500/5' : ''}`}>
      <div className={`text-2xl ${accent ? 'text-gold-400' : 'text-navy-400'}`}>{icon}</div>
      <div>
        <p className="font-sans text-ivory-400/60 text-xs tracking-widest uppercase
                      leading-none mb-1">{label}</p>
        <p className={`font-serif text-2xl font-bold
                       ${accent ? 'text-gold-400' : 'text-ivory-100'}`}>{value}</p>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed]         = useState(false)
  const [password, setPassword]     = useState('')
  const [loginError, setLoginError] = useState('')

  const [registrations, setRegistrations] = useState([])
  const [contributions, setContributions] = useState([])
  const [loading, setLoading]             = useState(false)
  const [tab, setTab]                     = useState('registrations')

  const [search, setSearch]               = useState('')
  const [filterAttendance, setFilterAttendance] = useState('')
  const [filterFood, setFilterFood]             = useState('')
  const [filterPayment, setFilterPayment]       = useState('')

  const [selectedReg, setSelectedReg]     = useState(null)
  const [selectedCon, setSelectedCon]     = useState(null)
  const [updatingId, setUpdatingId]       = useState(null)
  const [adminNote, setAdminNote]         = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [regs, cons] = await Promise.all([
        getAllRegistrations(),
        getAllContributions(),
      ])
      setRegistrations(regs || [])
      setContributions(cons || [])
    } catch {
      toast.error('Failed to load data. Check Supabase configuration.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (authed) fetchData() }, [authed, fetchData])

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) { setAuthed(true); setLoginError('') }
    else setLoginError('Incorrect password.')
  }

  async function handleStatusUpdate(id, status) {
    setUpdatingId(id)
    try {
      await updatePaymentStatus(id, status, adminNote || null)
      toast.success(`Marked as ${status}`)
      setAdminNote('')
      setSelectedCon(null)
      fetchData()
    } catch { toast.error('Failed to update.') }
    finally { setUpdatingId(null) }
  }

  // ── Stats ─────────────────────────────────────────────────
  const stats = {
    total:         registrations.length,
    attending:     registrations.filter(r => r.attendance_status === 'Yes').length,
    notAttending:  registrations.filter(r => r.attendance_status === 'No').length,
    totalGuests:   registrations.reduce((s, r) => s + (r.family_members || 0), 0),
    veg:           registrations.filter(r => r.food_preference === 'Vegetarian').length,
    nonVeg:        registrations.filter(r => r.food_preference === 'Non-Vegetarian').length,
    accommodation: registrations.filter(r => r.accommodation_required).length,
    totalContr:    contributions.length,
    verified:      contributions.filter(c => c.payment_status === 'VERIFIED').length,
    submitted:     contributions.filter(c => c.payment_status === 'SUBMITTED').length,
    totalAmount:   contributions
                     .filter(c => c.payment_status === 'VERIFIED')
                     .reduce((s, c) => s + (c.contribution_amount || 0), 0),
    totalSubmittedAmount: contributions
                     .reduce((s, c) => s + (c.contribution_amount || 0), 0),
  }

  // ── Filtered registrations ────────────────────────────────
  const filteredRegs = registrations.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.full_name?.toLowerCase().includes(q) ||
      r.phone?.includes(q) ||
      r.registration_id?.toLowerCase().includes(q)
    const matchAtt  = !filterAttendance || r.attendance_status === filterAttendance
    const matchFood = !filterFood       || r.food_preference   === filterFood
    return matchSearch && matchAtt && matchFood
  })

  // ── Filtered contributions ────────────────────────────────
  const filteredCons = contributions.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      c.alumni_name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.registration_id?.toLowerCase().includes(q)
    const matchPayment = !filterPayment || c.payment_status === filterPayment
    return matchSearch && matchPayment
  })

  // ── Login screen ──────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-10">
            <p className="font-script text-gold-400 text-2xl mb-2">Admin Access</p>
            <h1 className="font-serif text-ivory-100 text-3xl font-bold">{EVENT.title}</h1>
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
                onChange={e => setPassword(e.target.value)}
                className={`form-input ${loginError ? 'border-red-500' : ''}`}
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
    )
  }

  // ── Dashboard ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-navy-950">

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-navy-900/95 border-b border-navy-800 navbar-glass">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center
                        justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-serif text-gold-400 text-base font-bold
                             whitespace-nowrap">
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
              aria-label="Refresh data"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setAuthed(false)}
              className="btn-ghost text-xs text-red-400 hover:text-red-300
                         gap-1.5 py-1.5"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats — row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <StatCard label="Registered"    value={stats.total}         icon={<Users size={22}/>}   accent />
          <StatCard label="Attending"     value={stats.attending}     icon="✅" />
          <StatCard label="Not Attending" value={stats.notAttending}  icon="❌" />
          <StatCard label="Total Guests"  value={stats.totalGuests}   icon="👨‍👩‍👧" />
        </div>

        {/* Stats — row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Vegetarian"    value={stats.veg}           icon={<Utensils size={22}/>} />
          <StatCard label="Non-Veg"       value={stats.nonVeg}        icon="🍖" />
          <StatCard label="Accommodation" value={stats.accommodation} icon={<Home size={22}/>} />
          <StatCard label="Contributions" value={stats.totalContr}    icon={<TrendingUp size={22}/>} accent />
        </div>

        {/* Contribution summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Submitted Amount"
            value={formatCurrency(stats.totalSubmittedAmount)}
            icon={<Heart size={22}/>}
          />
          <StatCard
            label="Verified Amount"
            value={formatCurrency(stats.totalAmount)}
            icon={<CheckCircle2 size={22}/>}
            accent
          />
          <StatCard
            label="Awaiting Verify"
            value={stats.submitted}
            icon={<Clock size={22}/>}
          />
        </div>

        {/* Tabs + controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start
                        sm:items-center justify-between mb-6">
          <div className="flex gap-1 bg-navy-900 border border-navy-800 p-1">
            {['registrations', 'contributions'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setSearch('') }}
                className={`px-5 py-2 font-sans text-sm font-medium
                            transition-all duration-200 capitalize
                            ${tab === t
                              ? 'bg-gold-500 text-navy-950'
                              : 'text-ivory-400 hover:text-ivory-200'}`}
              >
                {t} ({t === 'registrations' ? filteredRegs.length : filteredCons.length})
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2
                                            text-navy-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Name / Phone / Reg ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input pl-9 py-2 text-sm w-full sm:w-52"
              />
            </div>

            {/* Filters */}
            {tab === 'registrations' && <>
              <FilterSelect value={filterAttendance} onChange={setFilterAttendance}
                options={[['','All Attendance'],['Yes','Attending'],['No','Not Attending']]} />
              <FilterSelect value={filterFood} onChange={setFilterFood}
                options={[['','All Food'],['Vegetarian','Veg'],['Non-Vegetarian','Non-Veg']]} />
            </>}
            {tab === 'contributions' &&
              <FilterSelect value={filterPayment} onChange={setFilterPayment}
                options={[['','All'],['SUBMITTED','Submitted'],['VERIFIED','Verified'],['REJECTED','Rejected']]} />
            }

            {/* Export */}
            <button
              onClick={() =>
                tab === 'registrations'
                  ? exportToCSV(filteredRegs, 'registrations')
                  : exportToCSV(filteredCons, 'contributions')
              }
              className="btn-ghost text-xs gap-1.5 py-2 border border-navy-700
                         hover:border-navy-500"
            >
              <Download size={13} />CSV
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-gold-400" />
          </div>
        )}

        {/* ── Registrations table ── */}
        {!loading && tab === 'registrations' && (
          <div className="overflow-x-auto rounded-sm border border-navy-800">
            <table className="w-full text-sm font-sans min-w-[700px]">
              <thead>
                <tr className="bg-navy-900 border-b border-navy-800">
                  {['Name','Phone','Attendance','Guests','Food',
                    'Accom.','Contribution','Registered'].map(h => (
                    <th key={h}
                      className="px-4 py-3 text-left text-ivory-400/50 text-xs
                                 tracking-widest uppercase font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {filteredRegs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center
                                               text-navy-500 font-sans text-sm">
                      {registrations.length === 0
                        ? 'No registrations yet.'
                        : 'No results match your filters.'}
                    </td>
                  </tr>
                ) : filteredRegs.map((r, i) => {
                  const con = r.contributions?.[0]
                  return (
                    <tr key={r.id || i}
                      className="border-b border-navy-800/50
                                 hover:bg-navy-900/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-ivory-200
                                     whitespace-nowrap">
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
                      <td className="px-4 py-3 text-ivory-400/70 whitespace-nowrap text-xs">
                        {r.food_preference || '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {r.accommodation_required ? '✅' : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {con ? (
                          <span className="text-gold-400 font-semibold text-sm">
                            {formatCurrency(con.contribution_amount)}
                          </span>
                        ) : (
                          <span className="text-navy-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ivory-400/50 whitespace-nowrap text-xs">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedReg(r)}
                          className="text-navy-400 hover:text-gold-400 transition-colors"
                          aria-label="View details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Contributions table ── */}
        {!loading && tab === 'contributions' && (
          <div className="overflow-x-auto rounded-sm border border-navy-800">
            <table className="w-full text-sm font-sans min-w-[600px]">
              <thead>
                <tr className="bg-navy-900 border-b border-navy-800">
                  {['Name','Phone','Amount','Status','Date'].map(h => (
                    <th key={h}
                      className="px-4 py-3 text-left text-ivory-400/50 text-xs
                                 tracking-widest uppercase font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {filteredCons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center
                                               text-navy-500 font-sans text-sm">
                      {contributions.length === 0
                        ? 'No contributions yet.'
                        : 'No results match your filters.'}
                    </td>
                  </tr>
                ) : filteredCons.map((c, i) => (
                  <tr key={c.id || i}
                    className="border-b border-navy-800/50
                               hover:bg-navy-900/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-ivory-200 whitespace-nowrap">
                      {c.alumni_name}
                    </td>
                    <td className="px-4 py-3 text-ivory-400/70 font-mono text-xs">
                      {c.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-gold-400 font-semibold whitespace-nowrap">
                      {formatCurrency(c.contribution_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.payment_status} />
                    </td>
                    <td className="px-4 py-3 text-ivory-400/50 text-xs whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSelectedCon(c); setAdminNote('') }}
                        className="text-navy-400 hover:text-gold-400 transition-colors"
                        aria-label="Manage contribution"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Registration detail modal ── */}
      <AnimatePresence>
        {selectedReg && (
          <Modal onClose={() => setSelectedReg(null)} title="Registration Details">
            <DetailGrid data={{
              'Registration ID':  selectedReg.registration_id,
              'Full Name':        selectedReg.full_name,
              'Phone':            selectedReg.phone,
              'Batch':            selectedReg.batch || '2006',
              'Gender':           selectedReg.gender || '—',
              'Attendance':       selectedReg.attendance_status,
              'Family Members':   selectedReg.family_members ?? 0,
              'Arrival Date':     formatDate(selectedReg.arrival_date),
              'Arrival Time':     selectedReg.arrival_time || '—',
              'Departure Date':   formatDate(selectedReg.departure_date),
              'Departure Time':   selectedReg.departure_time || '—',
              'Food Preference':  selectedReg.food_preference || '—',
              'Accommodation':    selectedReg.accommodation_required ? 'Yes' : 'No',
              'Registered At':    formatDate(selectedReg.created_at),
            }} />
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Contribution management modal ── */}
      <AnimatePresence>
        {selectedCon && (
          <Modal onClose={() => setSelectedCon(null)} title="Manage Contribution">
            <DetailGrid data={{
              'Alumni Name':   selectedCon.alumni_name,
              'Phone':         selectedCon.phone || '—',
              'Reg ID':        selectedCon.registration_id || '—',
              'Amount':        formatCurrency(selectedCon.contribution_amount),
              'Status':        selectedCon.payment_status,
              'Submitted At':  formatDate(selectedCon.created_at),
            }} />

            <div className="mt-6">
              <label className="form-label">Admin Note (optional)</label>
              <input
                type="text"
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Internal note"
                className="form-input text-sm"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleStatusUpdate(selectedCon.id, 'VERIFIED')}
                disabled={updatingId === selectedCon.id}
                className="flex-1 btn-primary py-3 text-xs gap-2"
              >
                {updatingId === selectedCon.id
                  ? <Loader2 size={14} className="animate-spin" />
                  : <CheckCircle2 size={14} />
                }
                Mark Verified
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedCon.id, 'REJECTED')}
                disabled={updatingId === selectedCon.id}
                className="flex-1 inline-flex items-center justify-center gap-2
                           py-3 px-4 text-xs font-sans font-semibold tracking-widest
                           uppercase border border-red-700/60 text-red-400
                           hover:bg-red-900/20 hover:text-red-300
                           transition-all duration-200"
              >
                <XCircle size={14} />
                Reject
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Helper components ─────────────────────────────────────────

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="form-input py-2 text-xs pr-7 appearance-none cursor-pointer"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2
                                         text-navy-400 pointer-events-none" />
    </div>
  )
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
        onClick={e => e.stopPropagation()}
        className="premium-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6 pb-4
                        border-b border-navy-700/50">
          <h3 className="font-serif text-ivory-100 text-lg font-semibold">{title}</h3>
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
  )
}

function DetailGrid({ data }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
      {Object.entries(data).map(([k, v]) => (
        <div key={k}>
          <p className="font-sans text-ivory-400/50 text-xs tracking-widest
                        uppercase mb-0.5">{k}</p>
          <p className="font-sans text-ivory-200 text-sm font-medium break-words">
            {String(v)}
          </p>
        </div>
      ))}
    </div>
  )
}
