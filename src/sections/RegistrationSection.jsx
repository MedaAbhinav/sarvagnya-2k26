import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Loader2, CheckCircle2, ChevronDown,
  Copy, Smartphone, Building2, Heart, Upload, X,
} from 'lucide-react'
import { submitRegistration, submitContribution } from '../lib/api'
import { EVENT, PAYMENT } from '../config'
import { formatCurrency } from '../lib/utils'
import ScrollReveal from '../components/ScrollReveal'
import GoldDivider from '../components/GoldDivider'

const QR_SRC = `${import.meta.env.BASE_URL}upi-qr.jpeg`

// Flow:
// FORM → [save reg] → CHOICE → DONE
//                    ↘ PAY  → [save contrib] → DONE
const STEP = {
  FORM:    'form',
  CHOICE:  'choice',
  PAY:     'pay',
  DONE:    'done',
}

export default function RegistrationSection() {
  const [step, setStep]         = useState(STEP.FORM)
  const [saving, setSaving]     = useState(false)   // spinner flag
  const [savedReg, setSavedReg] = useState(null)
  const [amount, setAmount]     = useState('')
  const [screenshot, setScreenshot]     = useState(null)
  const [screenshotPreview, setPreview] = useState(null)
  const [copied, setCopied]     = useState('')
  const fileRef = useRef(null)

  const numericAmount = parseFloat(amount) || 0

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { batch: '2006', familyMembers: '0' },
  })
  const attendance = watch('attendance')

  // ── Copy helper ────────────────────────────────────────────
  function handleCopy(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2200)
    })
  }

  // ── File helper ────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot must be under 5 MB.')
      return
    }
    setScreenshot(file)
    setPreview(URL.createObjectURL(file))
  }

  // ── STEP 1: Form submitted → save registration immediately ─
  async function onFormSubmit(data) {
    setSaving(true)
    try {
      const reg = await submitRegistration(data)
      setSavedReg(reg)
      setStep(STEP.CHOICE)
    } catch (err) {
      console.error(err)
      toast.error(
        err?.message?.includes('duplicate')
          ? 'This phone number is already registered.'
          : 'Something went wrong. Please try again.'
      )
      // stay on FORM so user can retry
    } finally {
      setSaving(false)
    }
  }

  // ── STEP 2a: No contribution → registration already saved → DONE
  function handleNoContribution() {
    setStep(STEP.DONE)
  }

  // ── STEP 2b: Yes → show payment screen
  function handleYesContribution() {
    setStep(STEP.PAY)
  }

  // ── STEP 3: Save contribution → DONE ──────────────────────
  async function handleContribSubmit(e) {
    e.preventDefault()
    if (numericAmount < 1) {
      toast.error('Please enter a contribution amount.')
      return
    }
    setSaving(true)
    try {
      await submitContribution({
        registrationId: savedReg.registration_id,
        alumniName:     savedReg.full_name,
        phone:          savedReg.phone             || null,
        attendance:     savedReg.attendance_status || null,
        amount:         numericAmount,
      }, screenshot)
      setStep(STEP.DONE)
    } catch (err) {
      console.error(err)
      toast.error('Could not save contribution. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ══════════════════════════════════════════════════════════
  // DONE screen
  // ══════════════════════════════════════════════════════════
  if (step === STEP.DONE) {
    return (
      <section id="registration" className="section-pad bg-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 grain-overlay pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="premium-card text-center py-14 px-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.18 }}
              className="mb-5"
            >
              <CheckCircle2 size={52} className="text-gold-400 mx-auto" />
            </motion.div>
            <p className="font-script text-gold-400 text-2xl mb-2">Thank You</p>
            <h3 className="font-serif text-ivory-100 text-3xl font-bold mb-1">
              Registration Successful ❤️
            </h3>
            <GoldDivider />
            <p className="font-sans text-ivory-300/80 text-base leading-relaxed mt-4 mb-5">
              {savedReg?.attendance_status === 'Yes'
                ? 'We look forward to welcoming you on October 10, 2026!'
                : 'Thank you for being with us, 2006 Batch.'}
            </p>
            {savedReg?.registration_id && (
              <div className="premium-card inline-block">
                <p className="font-sans text-ivory-400/55 text-xs tracking-widest uppercase mb-1">
                  Registration ID
                </p>
                <p className="font-sans text-gold-400 font-mono text-sm font-bold tracking-wider">
                  {savedReg.registration_id}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    )
  }

  // ══════════════════════════════════════════════════════════
  // CONTRIBUTION CHOICE screen
  // ══════════════════════════════════════════════════════════
  if (step === STEP.CHOICE) {
    return (
      <section id="registration" className="section-pad bg-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 grain-overlay pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="premium-card" style={{ borderColor: 'rgba(196,154,56,0.3)' }}>

              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-navy-700/50">
                <Heart size={18} className="text-gold-400 flex-shrink-0" fill="currentColor" />
                <h3 className="font-serif text-ivory-100 text-lg font-semibold">
                  Would you like to contribute?
                </h3>
              </div>

              <p className="font-sans text-ivory-300/75 text-sm leading-relaxed mb-2">
                Would you like to contribute to the{' '}
                <strong className="text-gold-400">Sarvagnya 2K26</strong> celebrations?
              </p>
              <p className="font-sans text-ivory-300/55 text-sm leading-relaxed mb-7">
                Every contribution helps us make the College Fest and 2006 Batch Alumni
                Meet truly memorable. Contribution is completely optional.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleYesContribution}
                  className="flex items-center justify-center gap-2 p-5 border-2
                             border-gold-500 bg-gold-500/10 text-gold-300
                             hover:bg-gold-500/20 transition-all duration-200
                             font-sans font-semibold text-sm tracking-wide"
                >
                  <Heart size={16} fill="currentColor" />
                  Yes, I would like to contribute
                </button>

                <button
                  onClick={handleNoContribution}
                  className="flex items-center justify-center gap-2 p-5 border
                             border-navy-600 text-ivory-400/70
                             hover:border-navy-500 hover:text-ivory-300
                             transition-all duration-200
                             font-sans font-medium text-sm tracking-wide"
                >
                  No, not now
                </button>
              </div>

              <p className="font-sans text-ivory-400/35 text-xs mt-5 text-center">
                Your registration is already saved. This step is optional.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  // ══════════════════════════════════════════════════════════
  // CONTRIBUTION + QR + SCREENSHOT screen
  // ══════════════════════════════════════════════════════════
  if (step === STEP.PAY) {
    return (
      <section id="registration" className="section-pad bg-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 grain-overlay pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <form onSubmit={handleContribSubmit} className="space-y-6">
              <div className="premium-card" style={{ borderColor: 'rgba(196,154,56,0.3)' }}>

                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-navy-700/50">
                  <Smartphone size={18} className="text-gold-400 flex-shrink-0" />
                  <h3 className="font-serif text-ivory-100 text-lg font-semibold">
                    Your Contribution
                  </h3>
                </div>

                <p className="font-sans text-ivory-300/70 text-sm mb-6 leading-relaxed">
                  Scan the QR code or use the bank details below, then enter the amount
                  and optionally upload a payment screenshot.
                </p>

                {/* Payment methods */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

                  {/* QR */}
                  <div className="text-center">
                    <p className="font-sans text-ivory-400/50 text-xs tracking-[0.2em]
                                  uppercase mb-3 flex items-center justify-center gap-1.5">
                      <Smartphone size={12} /> Scan with UPI App
                    </p>
                    <div className="inline-block bg-white p-3 mx-auto" style={{ lineHeight: 0 }}>
                      <img
                        src={QR_SRC}
                        alt="PhonePe / UPI Payment QR Code"
                        style={{ display:'block', width:'180px', height:'auto', imageRendering:'crisp-edges' }}
                      />
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="font-sans text-ivory-400/45 text-xs tracking-widest uppercase">
                        UPI ID
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-gold-400 font-semibold text-sm tracking-wide">
                          {PAYMENT.upiId}
                        </span>
                        <button type="button" onClick={() => handleCopy(PAYMENT.upiId, 'upi')}
                          className="text-navy-400 hover:text-gold-400 transition-colors"
                          aria-label="Copy UPI ID">
                          {copied === 'upi'
                            ? <CheckCircle2 size={13} className="text-green-400" />
                            : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bank */}
                  <div>
                    <p className="font-sans text-ivory-400/50 text-xs tracking-[0.2em]
                                  uppercase mb-3 flex items-center gap-1.5">
                      <Building2 size={12} /> Bank Transfer
                    </p>
                    <div className="space-y-4">
                      {[
                        { label: 'Account Number', value: PAYMENT.accountNumber, key: 'acc'  },
                        { label: 'IFSC Code',       value: PAYMENT.ifscCode,       key: 'ifsc' },
                      ].map(({ label, value, key }) => (
                        <div key={key} className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-ivory-400/40 text-xs tracking-widest uppercase mb-0.5">
                              {label}
                            </p>
                            <p className="font-mono text-ivory-100 text-sm font-semibold break-all">
                              {value}
                            </p>
                          </div>
                          <button type="button" onClick={() => handleCopy(value, key)}
                            className="text-navy-500 hover:text-gold-400 transition-colors flex-shrink-0"
                            aria-label={`Copy ${label}`}>
                            {copied === key
                              ? <CheckCircle2 size={13} className="text-green-400" />
                              : <Copy size={13} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="border-t border-navy-700/40 pt-6 space-y-5">
                  <div>
                    <label className="form-label">
                      Contribution Amount (₹) <span className="text-gold-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif
                                       text-gold-400 text-2xl font-bold pointer-events-none select-none">
                        ₹
                      </span>
                      <input
                        type="number" min="1" step="1" placeholder="Enter amount"
                        value={amount} onChange={e => setAmount(e.target.value)}
                        className="form-input pl-10 text-xl font-semibold text-gold-300 py-4"
                        inputMode="numeric" autoFocus
                      />
                    </div>
                    <AnimatePresence>
                      {numericAmount > 0 && (
                        <motion.div
                          initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                          className="mt-3 p-3 bg-gold-500/8 border border-gold-500/20 text-center"
                        >
                          <span className="font-sans text-ivory-400/55 text-xs tracking-widest uppercase mr-2">
                            Your contribution:
                          </span>
                          <span className="font-serif text-gold-400 text-xl font-bold">
                            {formatCurrency(numericAmount)}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Screenshot — optional */}
                  <div>
                    <label className="form-label">
                      Payment Screenshot
                      <span className="text-navy-500 font-normal ml-1 normal-case tracking-normal text-xs">
                        (optional)
                      </span>
                    </label>
                    <p className="font-sans text-ivory-400/45 text-xs mb-3 leading-relaxed">
                      Upload a screenshot after making the payment. JPG, PNG or WebP · Max 5 MB.
                    </p>
                    <input ref={fileRef} type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden" onChange={handleFileChange} />

                    {screenshotPreview ? (
                      <div className="border border-gold-500/30 bg-gold-500/5 p-4 space-y-3">
                        <img src={screenshotPreview} alt="Payment screenshot preview"
                          className="max-h-44 object-contain mx-auto rounded" />
                        <div className="flex items-center justify-between">
                          <p className="font-sans text-gold-400 text-xs truncate max-w-[200px]">
                            {screenshot.name}
                          </p>
                          <button type="button"
                            onClick={() => { setScreenshot(null); setPreview(null) }}
                            className="text-navy-400 hover:text-red-400 transition-colors
                                       text-xs inline-flex items-center gap-1 flex-shrink-0">
                            <X size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-full border-2 border-dashed border-navy-700
                                   hover:border-navy-600 p-5 text-center
                                   transition-colors duration-200 space-y-2">
                        <Upload size={22} className="text-navy-500 mx-auto" />
                        <p className="font-sans text-ivory-400/55 text-sm">
                          Tap to upload payment screenshot
                        </p>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit"
                  disabled={saving || numericAmount < 1}
                  className="btn-primary flex-1 py-5 text-sm
                             disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                    : <>Complete Registration →</>}
                </button>
                <button type="button" onClick={() => setStep(STEP.CHOICE)}
                  className="btn-outline py-4 text-xs px-6">
                  ← Back
                </button>
              </div>
              {numericAmount < 1 && (
                <p className="font-sans text-ivory-400/35 text-xs text-center">
                  Enter a contribution amount to continue.
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </section>
    )
  }

  // ══════════════════════════════════════════════════════════
  // REGISTRATION FORM
  // ══════════════════════════════════════════════════════════
  return (
    <section id="registration" className="section-pad relative overflow-hidden bg-navy-950">
      <div className="absolute inset-0 grain-overlay pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gold-500/4 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-burgundy-700/6 blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">

        <ScrollReveal className="text-center mb-12">
          <p className="font-script text-gold-400 text-xl mb-3">You Belong Here</p>
          <h2 className="heading-lg text-ivory-100 mb-4">
            Come Back.<br />
            <span className="text-gold-shimmer">Reconnect. Relive.</span>
          </h2>
          <GoldDivider />
          <p className="font-sans text-ivory-300/70 text-base leading-relaxed mt-6 max-w-lg mx-auto">
            Register for the{' '}
            <strong className="text-gold-400">{EVENT.title}</strong>.
          </p>
        </ScrollReveal>

        <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-8">

          {/* Personal Details */}
          <ScrollReveal delay={50}>
            <FormSection title="Personal Details" icon="👤">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="form-label">Full Name <Req /></label>
                  <input
                    className={`form-input ${errors.fullName ? 'border-red-500' : ''}`}
                    placeholder="Your full name" autoComplete="name"
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name is too short' },
                    })}
                  />
                  {errors.fullName && <Err msg={errors.fullName.message} />}
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Phone Number <Req /></label>
                  <input
                    className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+91 98765 43210" type="tel" inputMode="tel" autoComplete="tel"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: { value: /^[+]?[0-9\s\-()]{8,15}$/, message: 'Enter a valid phone number' },
                    })}
                  />
                  {errors.phone && <Err msg={errors.phone.message} />}
                </div>
                <div>
                  <label className="form-label">Batch</label>
                  <input className="form-input bg-navy-800/50 cursor-not-allowed opacity-70"
                    readOnly value="2006" {...register('batch')} />
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <SelectField {...register('gender')}
                    options={['Prefer not to say', 'Male', 'Female']} />
                </div>
              </div>
            </FormSection>
          </ScrollReveal>

          {/* Attendance */}
          <ScrollReveal delay={80}>
            <FormSection title="Attendance" icon="📅">
              <div>
                <label className="form-label">
                  Will you attend the Alumni Meet on October 10, 2026? <Req />
                </label>
                {errors.attendance && <Err msg={errors.attendance.message} />}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {[
                    { value: 'Yes', label: 'Yes, I will attend ❤️', sub: 'October 10, 2026'      },
                    { value: 'No',  label: 'No, I cannot attend',    sub: 'I will not be present' },
                  ].map(opt => (
                    <AttendanceCard key={opt.value} value={opt.value} label={opt.label}
                      sub={opt.sub} checked={attendance === opt.value}
                      register={register('attendance', { required: 'Please select attendance' })}
                    />
                  ))}
                </div>
              </div>
            </FormSection>
          </ScrollReveal>

          {/* Travel + Food — YES only */}
          <AnimatePresence>
            {attendance === 'Yes' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}
                className="overflow-hidden space-y-8"
              >
                <FormSection title="Family" icon="👨‍👩‍👧">
                  <div>
                    <label className="form-label">Family members accompanying you</label>
                    <input className="form-input w-28 text-center text-lg font-semibold"
                      type="number" min="0" max="20" inputMode="numeric"
                      {...register('familyMembers', {
                        min: { value: 0, message: 'Cannot be negative' },
                        max: { value: 20, message: 'Maximum 20' },
                      })}
                    />
                    {errors.familyMembers && <Err msg={errors.familyMembers.message} />}
                  </div>
                </FormSection>

                <FormSection title="Arrival & Departure" icon="✈️">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">Arrival Date</label>
                      <input className="form-input" type="date" {...register('arrivalDate')} />
                    </div>
                    <div>
                      <label className="form-label">Arrival Time</label>
                      <input className="form-input" type="time" {...register('arrivalTime')} />
                    </div>
                    <div>
                      <label className="form-label">Departure Date</label>
                      <input className="form-input" type="date" {...register('departureDate')} />
                    </div>
                    <div>
                      <label className="form-label">Departure Time</label>
                      <input className="form-input" type="time" {...register('departureTime')} />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Preferences" icon="🍽️">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">Food Preference</label>
                      <SelectField {...register('foodPreference')}
                        options={['Select preference', 'Vegetarian', 'Non-Vegetarian']} />
                    </div>
                    <div>
                      <label className="form-label">Accommodation Required?</label>
                      <SelectField {...register('accommodation')}
                        options={['Select option', 'Yes', 'No']} />
                    </div>
                  </div>
                </FormSection>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <AnimatePresence>
            {attendance && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-center pt-2"
              >
                <button type="submit" disabled={saving}
                  className="btn-primary min-w-[220px] py-5 text-sm
                             disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                    : <>Continue →</>}
                </button>
                <p className="font-sans text-ivory-400/30 text-xs mt-3">
                  Your information is stored securely and will not be shared.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </form>
      </div>
    </section>
  )
}

// ── Sub-components ────────────────────────────────────────────

function Req() { return <span className="text-gold-500 ml-0.5">*</span> }
function Err({ msg }) { return <p className="form-error mt-1">{msg}</p> }

function FormSection({ title, icon, children }) {
  return (
    <div className="premium-card">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-navy-700/50">
        <span className="text-xl">{icon}</span>
        <h3 className="font-serif text-ivory-100 text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

const SelectField = React.forwardRef(function SelectField({ options, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className="form-input appearance-none pr-9 cursor-pointer" {...props}>
        {options.map(opt => (
          <option key={opt} value={opt.startsWith('Select') ? '' : opt}
            disabled={opt.startsWith('Select')}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2
                                        text-navy-400 pointer-events-none" />
    </div>
  )
})

function AttendanceCard({ value, label, sub, checked, register }) {
  return (
    <label className={`flex items-start gap-3 p-4 border cursor-pointer select-none
                       transition-all duration-200
                       ${checked ? 'border-gold-500 bg-gold-500/10' : 'border-navy-700 hover:border-navy-500'}`}>
      <input type="radio" value={value} className="mt-1 accent-gold-500 flex-shrink-0" {...register} />
      <div>
        <p className={`font-sans text-sm font-semibold leading-snug
                       ${checked ? 'text-gold-300' : 'text-ivory-200'}`}>{label}</p>
        <p className="font-sans text-xs text-ivory-400/50 mt-0.5">{sub}</p>
      </div>
    </label>
  )
}
