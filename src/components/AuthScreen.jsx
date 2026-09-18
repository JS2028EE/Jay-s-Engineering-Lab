import { useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import '../auth.css'

export default function AuthScreen() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isSignUp = mode === 'signup'

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      if (!supabase) throw new Error('Supabase is not configured. Add the VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY values to your local .env file.')

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (signUpError) throw signUpError

        if (data.session) {
          setMessage('Account created. Initializing your engineering lab...')
        } else {
          setMessage('Account created. Check your email to confirm your account, then come back to the lab.')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (signInError) throw signInError
      }
    } catch (authError) {
      setError(authError.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-screen">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark"><Zap size={22} /></div>
          <div>
            <strong>JAY'S</strong>
            <span>ENGINEERING LAB</span>
          </div>
        </div>

        <p className="eyebrow"><span className="pulse" /> SECURE ENGINEERING ACCESS</p>
        <h1>{isSignUp ? 'Initialize your account.' : 'Welcome back, engineer.'}</h1>
        <p className="auth-copy">Your lab records are protected by Supabase Auth and database Row Level Security.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <div className="auth-input"><Mail size={16} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
          </label>
          <label>
            <span>Password</span>
            <div className="auth-input"><LockKeyhole size={16} /><input type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" minLength={isSignUp ? 8 : undefined} required /></div>
          </label>

          {error && <div className="auth-message error">{error}</div>}
          {message && <div className="auth-message success">{message}</div>}

          <button className="primary full auth-submit" disabled={loading} type="submit">
            {loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-switch">
          <span>{isSignUp ? 'Already have an account?' : 'New to the lab?'}</span>
          <button type="button" onClick={() => { setMode(isSignUp ? 'signin' : 'signup'); setError(''); setMessage('') }}>
            {isSignUp ? 'Sign in' : 'Create account'}
          </button>
        </div>

        <div className="auth-security"><ShieldCheck size={15} /><span>Private records • Authenticated access • Row Level Security</span></div>
      </section>
    </main>
  )
}
