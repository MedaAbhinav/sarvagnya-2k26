import React, { useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2, CheckCircle2, ChevronDown } from 'lucide-react'
import { submitRegistration } from '../lib/api'
import { RegistrationContext } from '../App'
import { EVENT } from '../config'
import ScrollReveal from '../components/ScrollReveal'
import GoldDivider from '../components/GoldDivider'

export default function RegistrationSection() {
  const navigate = useNavigate()
  const { setRegistrationData } = useContext(RegistrationContext)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [savedData, setSavedData] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({ defaultValues: { batch: '2006', familyMembers: '0' } })

  const attendance = watch('attendance')

  async function onSubmit(data) {
    setSubmitting(true)
    try {
      const result = await submitRegistration(data)
      setSavedData(result)
      setRegistrationData(result)
      setSubmitted(true)
      reset()
      setTimeout(() => navigate('/support'), 3800)
    } catch (err) {
      console.error(err)
      toast.error(
        err?.message?.includes('duplicate')
          ? 'This phone number is already registered.'
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="registration" className="section-pad relative overflow-hidden bg-navy-950">

      {/* Subtle decorative blurs */}
      <div className="absolute inset-0 grain-overlay pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gold-500/4 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-burgundy-700/6 blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">

        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <p className="font-script text-gold-400 text-xl mb-3">You Belong Here</p>
          <h2 className="heading-lg text-ivory-100 mb-4">
            Come Back.<br />
            <span className="text-gold-shimmer">Reconnect. Relive.</span>
          </h2>
          <GoldDivider />
          <p className="font-sans text-ivory-300/70 text-base leading-relaxed mt-6 max-w-lg mx-auto">
            We would be honoured to welcome you back to the campus where your journey began.
            Register below for the{' '}
            <strong className="text-gold-400">{EVENT.title}</strong>.
          </p>
        </ScrollReveal>

        {/* ── Success state ── */}
        <AnimatePresence>
          {submitted && savedData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
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
                2006 Batch ❤️
              </h3>
              <div className="w-14 h-px bg-gold-500/50 mx-auto my-4" />

              {/* Contextual message based on attendance */}
              {savedData.attendance_status === 'No' ? (
                <p className="font-sans text-ivory-300/80 text-base leading-relaxed mb-5 max-w-sm mx-auto">
                  Although we will miss having you with us on campus, your connection with
                  JNTU remains special. If you are able to, we sincerely request your support
                  for the College Fest and Alumni Meet.
                </p>
              ) : (
                <p className="font-sans text-ivory-300/80 text-base leading-relaxed mb-5">
                  Your place in this homecoming is being remembered.
                </p>
              )}

              <div className="premium-card inline-block mb-6">
                <p className="font-sans text-ivory-400/55 text-xs tracking-widest uppercase mb-1">
                  Registration ID
                </p>
                <p className="font-sans text-gold-400 font-mono text-sm font-bold tracking-wider">
                  {savedData.registration_id}
                </p>
              </div>

              <p className="font-sans text-ivory-400/45 text-sm">
                {savedData.attendance_status === 'No'
                  ? 'Taking you to the Support page…'
                  : 'Taking you to the Support page in a moment…'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Form ── */}
        {!submitted && (
          <ScrollReveal delay={100}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">

              {/* PERSONAL DETAILS */}
              <FormSection title="Personal Details" icon="👤">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Full Name — full width */}
                  <div className="md:col-span-2">
                    <label className="form-label">Full Name <Req /></label>
                    <input
                      className={`form-input ${errors.fullName ? 'border-red-500' : ''}`}
                      placeholder="Your full name"
                      autoComplete="name"
                      {...register('fullName', {
                        required: 'Full name is required',
                        minLength: { value: 2, message: 'Name is too short' },
                      })}
                    />
                    {errors.fullName && <Err msg={errors.fullName.message} />}
                  </div>

                  {/* Phone */}
                  <div className="md:col-span-2">
                    <label className="form-label">Phone Number <Req /></label>
                    <input
                      className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="+91 98765 43210"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[+]?[0-9\s\-()]{8,15}$/,
                          message: 'Enter a valid phone number',
                        },
                      })}
                    />
                    {errors.phone && <Err msg={errors.phone.message} />}
                  </div>

                  {/* Batch — read-only */}
                  <div>
                    <label className="form-label">Batch</label>
                    <input
                      className="form-input bg-navy-800/50 cursor-not-allowed opacity-70"
                      readOnly
                      value="2006"
                      {...register('batch')}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="form-label">Gender</label>
                    <SelectField
                      {...register('gender')}
                      options={['Prefer not to say', 'Male', 'Female']}
                    />
                  </div>

                </div>
              </FormSection>

              {/* ATTENDANCE */}
              <FormSection title="Attendance" icon="📅">
                <div>
                  <label className="form-label">
                    Will you attend the 2006 Batch Alumni Meet on October 10, 2026? <Req />
                  </label>
                  {errors.attendance && <Err msg={errors.attendance.message} />}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {[
                      { value: 'Yes', label: 'Yes, I will attend ❤️',     sub: 'October 10, 2026' },
                      { value: 'No',  label: 'No, I cannot attend',        sub: 'I will not be present' },
                    ].map(opt => (
                      <AttendanceCard
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                        sub={opt.sub}
                        checked={attendance === opt.value}
                        register={register('attendance', { required: 'Please select attendance status' })}
                      />
                    ))}
                  </div>
                </div>
              </FormSection>

              {/* FAMILY — only shown when attending */}
              <AnimatePresence>
                {attendance === 'Yes' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <FormSection title="Family" icon="👨‍👩‍👧">
                      <div>
                        <label className="form-label">
                          Family members accompanying you
                        </label>
                        <input
                          className="form-input w-28 text-center text-lg font-semibold"
                          type="number"
                          min="0"
                          max="20"
                          inputMode="numeric"
                          {...register('familyMembers', {
                            min: { value: 0, message: 'Cannot be negative' },
                            max: { value: 20, message: 'Maximum 20' },
                          })}
                        />
                        {errors.familyMembers && <Err msg={errors.familyMembers.message} />}
                      </div>
                    </FormSection>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TRAVEL — only shown when attending */}
              <AnimatePresence>
                {attendance === 'Yes' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="overflow-hidden"
                  >
                    <FormSection title="Arrival & Departure" icon="✈️">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="form-label">Expected Arrival Date</label>
                          <input className="form-input" type="date" {...register('arrivalDate')} />
                        </div>
                        <div>
                          <label className="form-label">Expected Arrival Time</label>
                          <input className="form-input" type="time" {...register('arrivalTime')} />
                        </div>
                        <div>
                          <label className="form-label">Expected Departure Date</label>
                          <input className="form-input" type="date" {...register('departureDate')} />
                        </div>
                        <div>
                          <label className="form-label">Expected Departure Time</label>
                          <input className="form-input" type="time" {...register('departureTime')} />
                        </div>
                      </div>
                    </FormSection>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PREFERENCES — only shown when attending */}
              <AnimatePresence>
                {attendance === 'Yes' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="overflow-hidden"
                  >
                    <FormSection title="Preferences" icon="🍽️">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="form-label">Food Preference</label>
                          <SelectField
                            {...register('foodPreference')}
                            options={['Select preference', 'Vegetarian', 'Non-Vegetarian']}
                          />
                        </div>
                        <div>
                          <label className="form-label">Accommodation Required?</label>
                          <SelectField
                            {...register('accommodation')}
                            options={['Select option', 'Yes', 'No']}
                          />
                        </div>
                      </div>
                    </FormSection>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className="text-center pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary min-w-[240px] py-5 text-sm
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Registering…</>
                  ) : (
                    <>Complete Registration →</>
                  )}
                </button>
                <p className="font-sans text-ivory-400/35 text-xs mt-4">
                  Your information is stored securely and will not be shared.
                </p>
              </div>

            </form>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}

// ── Small helpers ─────────────────────────────────────────────

function Req() {
  return <span className="text-gold-500 ml-0.5">*</span>
}

function Err({ msg }) {
  return <p className="form-error mt-1">{msg}</p>
}

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
      <select
        ref={ref}
        className="form-input appearance-none pr-9 cursor-pointer"
        {...props}
      >
        {options.map(opt => (
          <option key={opt} value={opt.startsWith('Select') ? '' : opt} disabled={opt.startsWith('Select')}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
    </div>
  )
})

function AttendanceCard({ value, label, sub, checked, register }) {
  return (
    <label
      className={`flex items-start gap-3 p-4 border cursor-pointer select-none
                  transition-all duration-200
                  ${checked
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-navy-700 hover:border-navy-500'}`}
    >
      <input
        type="radio"
        value={value}
        className="mt-1 accent-gold-500 flex-shrink-0"
        {...register}
      />
      <div>
        <p className={`font-sans text-sm font-semibold leading-snug
                       ${checked ? 'text-gold-300' : 'text-ivory-200'}`}>
          {label}
        </p>
        <p className="font-sans text-xs text-ivory-400/50 mt-0.5">{sub}</p>
      </div>
    </label>
  )
}
