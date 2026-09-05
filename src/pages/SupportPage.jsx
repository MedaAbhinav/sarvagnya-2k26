import React, { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Copy, CheckCircle2, Loader2, Heart, Smartphone, Building2 } from 'lucide-react'
import { RegistrationContext } from '../App'
import { submitContribution } from '../lib/api'
import { PAYMENT, REQUIRE_CONTRIBUTION_FOR_NON_ATTENDEES } from '../config'
import { formatCurrency } from '../lib/utils'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScrollReveal from '../components/ScrollReveal'
import GoldDivider from '../components/GoldDivider'

export default function SupportPage() {
  const { registrationData } = useContext(RegistrationContext)
  const navigate = useNavigate()

  const [amount, setAmount]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [copied, setCopied]         = useState('')

  const numericAmount = parseFloat(amount) || 0
  const cannotAttend  = registrationData?.attendance_status === 'No'

  // When REQUIRE_CONTRIBUTION_FOR_NON_ATTENDEES=true, non-attendees must submit a contribution.
  const contributionRequired = cannotAttend && REQUIRE_CONTRIBUTION_FOR_NON_ATTENDEES

  function handleCopy(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2200)
    })
  }

  async function handleSubmitContribution(e) {
    e.preventDefault()
    if (!numericAmount || numericAmount < 1) {
      toast.error('Please enter a contribution amount.')
      return
    }
    setSubmitting(true)
    try {
      await submitContribution({
        registrationId: registrationData?.registration_id || 'WALK-IN',
        alumniName:     registrationData?.full_name       || 'Alumni',
        phone:          registrationData?.phone           || null,
        amount:         numericAmount,
        attendance:     registrationData?.attendance_status || null,
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      toast.error('Could not save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <Navbar />
      <main className="pt-20">

        {/* ── HERO — no decorative circles ── */}
        <section
          className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #071220 0%, #0f2236 45%, #112d17 75%, #071220 100%)' }}
        >
          <div className="absolute inset-0 grain-overlay pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(196,154,56,0.07) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 text-center px-5 md:px-8 max-w-3xl mx-auto py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <span className="gold-badge mb-8 inline-flex">
                <Heart size={11} className="text-gold-400" />
                Support the Celebrations
              </span>

              <h1
                className="font-serif font-black leading-tight mb-8"
                style={{ fontSize: 'clamp(2.2rem, 6.5vw, 4.8rem)' }}
              >
                <span className="text-ivory-100 block">Your Presence.</span>
                <span className="text-gold-shimmer block">Your Memories.</span>
                <span className="text-ivory-100 block">Your Support.</span>
              </h1>

              <GoldDivider />

              {/* Special message for non-attendees */}
              {cannotAttend && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 mb-6 px-6 py-5 border border-gold-500/30
                             bg-gold-500/6 max-w-xl mx-auto"
                >
                  <p className="font-serif text-ivory-200 text-base md:text-lg
                                leading-relaxed italic">
                    "Although we will miss having you with us on campus, your
                    connection with JNTU remains special. Although you cannot
                    join us in person, you can still become a part of this
                    celebration."
                  </p>
                </motion.div>
              )}

              {/* Emotional copy */}
              <div className="space-y-5 mt-8 max-w-2xl mx-auto text-left md:text-center">
                <p className="font-sans text-ivory-300/85 text-base md:text-lg leading-relaxed">
                  Some of you once walked through these gates as students, carrying
                  dreams, friendships and countless memories with you.
                </p>
                <p className="font-sans text-ivory-300/75 text-base leading-relaxed">
                  Today, a new generation of students walks through those same gates
                  with dreams of their own.
                </p>
                <p className="font-sans text-ivory-300/75 text-base leading-relaxed">
                  The <strong className="text-gold-400">Sarvagnya 2K26</strong> College
                  Fest on <strong className="text-ivory-200">October 8 &amp; 9</strong> and
                  the 2006 Batch Alumni Meet on{' '}
                  <strong className="text-gold-400">October 10</strong> are being
                  organised by students with great enthusiasm.
                </p>
                <p className="font-sans text-ivory-300/75 text-base leading-relaxed">
                  Behind every celebration are countless efforts and expenses. As
                  students, we are working with limited resources to make these
                  celebrations truly special.
                </p>
                <p className="font-sans text-ivory-200/90 text-base leading-relaxed font-medium">
                  We humbly look towards our 2006 Batch — the alumni who once stood
                  where we stand today.
                </p>
                <p className="font-sans text-ivory-300/80 text-base leading-relaxed">
                  Your support can help us create a celebration that today's students
                  will remember for years to come.
                </p>
                <p className="font-sans text-ivory-300/80 text-base leading-relaxed">
                  Whether or not you are able to join us in person, your contribution
                  can still become a part of this celebration.
                </p>
              </div>

              <div className="mt-12 space-y-3">
                <p className="font-serif text-ivory-100 text-xl md:text-2xl font-semibold">
                  Your presence will inspire us.
                </p>
                <p className="font-serif text-gold-400 text-xl md:text-2xl font-semibold">
                  Your support will empower us.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CONTRIBUTION INPUT ── */}
        <section className="section-pad bg-navy-950 relative">
          <div className="max-w-xl mx-auto">

            <ScrollReveal className="text-center mb-10">
              <p className="font-script text-gold-400 text-xl mb-3">Stand With Us</p>
              <h2 className="heading-md text-ivory-100 mb-4">
                Enter Your <span className="text-gold-shimmer">Contribution</span>
              </h2>
              <GoldDivider />
              {contributionRequired && (
                <div className="mt-4 px-4 py-3 bg-gold-500/8 border border-gold-500/25">
                  <p className="font-sans text-gold-300 text-sm leading-relaxed">
                    Even though you cannot attend in person, your financial support
                    will directly contribute to making Sarvagnya 2K26 a celebration
                    that students and alumni will remember.
                  </p>
                </div>
              )}
              {!contributionRequired && (
                <p className="font-sans text-ivory-300/60 text-sm mt-5 leading-relaxed">
                  Every contribution, big or small, means the world to us.
                </p>
              )}
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmitContribution}
                  >
                    <div className="premium-card space-y-5">
                      <div>
                        <label className="form-label">
                          Your Contribution Amount
                          {contributionRequired && <span className="text-gold-500 ml-1">*</span>}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2
                                           font-serif text-gold-400 text-2xl font-bold
                                           pointer-events-none select-none">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="form-input pl-10 text-2xl font-semibold
                                       text-gold-300 py-4 tracking-wide"
                            inputMode="numeric"
                            aria-label="Contribution amount in rupees"
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {numericAmount > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-4 bg-gold-500/8 border border-gold-500/25 text-center"
                          >
                            <p className="font-sans text-ivory-400/55 text-xs
                                          tracking-widest uppercase mb-1">
                              Your Contribution
                            </p>
                            <p className="font-serif text-gold-400 text-3xl font-bold">
                              {formatCurrency(numericAmount)}
                            </p>
                            <p className="font-sans text-ivory-300/60 text-xs mt-1.5">
                              Towards Sarvagnya 2K26 &amp; Alumni Meet 2026 🙏
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        type="submit"
                        disabled={submitting || numericAmount < 1}
                        className="btn-primary w-full py-5 text-sm
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting
                          ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                          : <><Heart size={15} /> I Want to Support</>
                        }
                      </button>

                      <p className="font-sans text-ivory-400/30 text-xs text-center
                                    leading-relaxed">
                        After submitting, please complete your payment using the QR
                        code or bank details below.
                      </p>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="thanks"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="premium-card text-center py-14 px-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.18 }}
                    >
                      <Heart size={52} className="text-gold-400 mx-auto mb-5"
                             fill="currentColor" />
                    </motion.div>
                    <h3 className="font-serif text-ivory-100 text-3xl font-bold mb-2">
                      Thank You ❤️
                    </h3>
                    <GoldDivider />
                    <p className="font-sans text-ivory-300/80 text-base leading-relaxed
                                  mt-6 max-w-sm mx-auto">
                      Your support has been noted. Please complete the payment using
                      the QR code or bank details below.
                    </p>
                    <p className="font-serif text-gold-400 text-lg mt-6 font-semibold">
                      See you on campus, October 10! 🎓
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollReveal>
          </div>
        </section>

        {/* ── PAYMENT DETAILS ── */}
        <section
          className="pb-24 px-4 md:px-8"
          style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0d2035 100%)' }}
        >
          <div className="max-w-3xl mx-auto">

            <ScrollReveal className="text-center mb-12">
              <h2 className="heading-md text-ivory-100 mb-3">
                Scan to <span className="text-gold-shimmer">Support</span>
              </h2>
              <p className="font-sans text-ivory-300/50 text-xs tracking-[0.2em]
                            uppercase mt-1">
                Scan to Support the Celebrations
              </p>
              <GoldDivider />
              <p className="font-sans text-ivory-300/55 text-sm mt-4">
                Use the QR code below to make your contribution via PhonePe,
                Google Pay, Paytm, or any UPI app.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              {/* ── Real UPI QR — original image, no distortion ── */}
              <ScrollReveal direction="left">
                <div className="premium-card text-center">
                  <p className="font-sans text-ivory-400/55 text-xs tracking-[0.25em]
                                uppercase mb-6 flex items-center justify-center gap-2">
                    <Smartphone size={13} />
                    Scan with any UPI App
                  </p>

                  {/* White background, natural size, no cropping */}
                  <div className="inline-block mx-auto bg-white p-4"
                    style={{ lineHeight: 0 }}>
                    <img
                      src={PAYMENT.qrImage}
                      alt="UPI Payment QR Code — scan to pay"
                      style={{
                        display: 'block',
                        maxWidth: '260px',
                        width: '100%',
                        height: 'auto',
                        imageRendering: 'crisp-edges',
                      }}
                    />
                  </div>

                  {/* UPI ID */}
                  <div className="mt-7 space-y-1.5">
                    <p className="font-sans text-ivory-400/45 text-xs
                                  tracking-widest uppercase">
                      UPI ID
                    </p>
                    <div className="flex items-center justify-center gap-2.5">
                      <span className="font-mono text-gold-400 font-semibold
                                       text-base tracking-wide">
                        {PAYMENT.upiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(PAYMENT.upiId, 'upi')}
                        className="text-navy-400 hover:text-gold-400 transition-colors"
                        aria-label="Copy UPI ID"
                      >
                        {copied === 'upi'
                          ? <CheckCircle2 size={15} className="text-green-400" />
                          : <Copy size={15} />
                        }
                      </button>
                    </div>
                    {numericAmount > 0 && (
                      <p className="font-sans text-ivory-300/50 text-xs mt-1">
                        Enter{' '}
                        <strong className="text-gold-400">
                          {formatCurrency(numericAmount)}
                        </strong>{' '}
                        as the amount
                      </p>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              {/* ── Bank Transfer — only Account Number + IFSC ── */}
              <ScrollReveal direction="right">
                <div className="premium-card h-full">
                  <div className="flex items-center gap-3 mb-6 pb-4
                                  border-b border-navy-700/50">
                    <Building2 size={17} className="text-gold-400 flex-shrink-0" />
                    <h3 className="font-serif text-ivory-100 text-lg font-semibold">
                      Bank Transfer
                    </h3>
                  </div>

                  <div className="space-y-5">
                    {[
                      { label: 'Account Number', value: PAYMENT.accountNumber, key: 'acc'  },
                      { label: 'IFSC Code',       value: PAYMENT.ifscCode,       key: 'ifsc' },
                    ].map(({ label, value, key }) => (
                      <div key={key} className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-ivory-400/45 text-xs
                                        tracking-widest uppercase mb-0.5">
                            {label}
                          </p>
                          <p className="font-mono text-ivory-100 text-base
                                        font-semibold break-all">
                            {value}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(value, key)}
                          className="text-navy-500 hover:text-gold-400 transition-colors
                                     flex-shrink-0"
                          aria-label={`Copy ${label}`}
                        >
                          {copied === key
                            ? <CheckCircle2 size={15} className="text-green-400" />
                            : <Copy size={15} />
                          }
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t border-navy-700/40">
                    <p className="font-sans text-ivory-400/40 text-xs leading-relaxed">
                      Use NEFT / IMPS from any banking app using the account number
                      and IFSC above.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={150} className="text-center mt-14">
              <div className="w-20 h-px bg-gold-500/30 mx-auto mb-8" />
              <p className="font-script text-gold-400/80 text-xl mb-6">
                We'll see you on October 10 ❤️
              </p>
              <button
                onClick={() => navigate('/')}
                className="btn-outline text-xs"
              >
                Back to Home
              </button>
            </ScrollReveal>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
