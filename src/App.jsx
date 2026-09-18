import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Activity, Boxes, CircuitBoard, GitBranch, GraduationCap, LayoutDashboard, Menu, NotebookPen, Plus, Settings, ShieldAlert, Sparkles, TestTube2, X, Zap, LogOut, UserRound } from 'lucide-react'
import AuthScreen from './components/AuthScreen'
import DashboardPage from './pages/DashboardPage'
import CurriculumPage from './pages/CurriculumPage'
import ProjectsPage from './pages/ProjectsPage'
import NotesPage from './pages/NotesPage'
import TestsPage from './pages/TestsPage'
import CircuitsPage from './pages/CircuitsPage'
import ComponentsPage from './pages/ComponentsPage'
import MistakesPage from './pages/MistakesPage'
import { supabase, supabaseConfigured } from './lib/supabase'
import { getDashboardData } from './lib/data'

const nav = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/curriculum', 'Curriculum', GraduationCap],
  ['/notes', 'Notes', NotebookPen],
  ['/tests', 'Tests', TestTube2],
  ['/circuits', 'Circuits', CircuitBoard],
  ['/components', 'Components', Boxes],
  ['/projects', 'Projects', GitBranch],
  ['/mistakes', 'Mistakes', ShieldAlert],
  ['/analytics', 'Analytics', Activity],
  ['/wellness', 'Wellness', Sparkles],
]

const modules = {
  '/curriculum': ['Curriculum', 'Build your own engineering education system.', GraduationCap],
  '/notes': ['Notes', 'Your digital engineering notebook.', NotebookPen],
  '/tests': ['Tests', 'Track scores, questions, and improvement.', TestTube2],
  '/circuits': ['Circuits', 'Store solved circuits and calculations.', CircuitBoard],
  '/components': ['Components', 'Digitize your physical lab inventory.', Boxes],
  '/projects': ['Projects', 'Turn ideas into documented engineering builds.', GitBranch],
  '/mistakes': ['Mistakes', 'Find patterns in what went wrong.', ShieldAlert],
  '/analytics': ['Analytics', 'See how your engineering knowledge grows.', Activity],
  '/wellness': ['Wellness', 'Track habits that support the engineer behind the work.', Sparkles],
}

function ConfigNotice() {
  return <main className="auth-screen"><div className="ambient ambient-a" /><div className="ambient ambient-b" /><section className="auth-card"><div className="auth-brand"><div className="auth-brand-mark"><Zap size={22} /></div><div><strong>JAY'S</strong><span>ENGINEERING LAB</span></div></div><p className="eyebrow"><span className="pulse" /> LOCAL SETUP REQUIRED</p><h1>Connect the lab to Supabase.</h1><p className="auth-copy">The application code is ready, but your local environment still needs the Supabase Project URL and publishable key.</p><div className="setup-code"><code>VITE_SUPABASE_URL=...</code><code>VITE_SUPABASE_PUBLISHABLE_KEY=...</code></div><p className="auth-note">Create a local <span className="mono">.env</span> file from <span className="mono">.env.example</span>, add the two values from your Supabase project, then restart Vite.</p></section></main>
}

function AppShell({ user }) {
  const [open, setOpen] = useState(false)
  const [quick, setQuick] = useState(false)
  const [coreLoad, setCoreLoad] = useState(0)
  const location = useLocation()
  const path = location.pathname
  const module = modules[path]
  const pageTitle = module?.[0] ?? 'Dashboard'
  const Icon = module?.[2] ?? LayoutDashboard
  const status = useMemo(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), [])

  useEffect(() => {
    let mounted = true

    async function refreshCoreLoad() {
      try {
        const data = await getDashboardData()
        if (mounted) setCoreLoad(data.coreLoad)
      } catch {
        // Keep the last known value when a background refresh fails.
      }
    }

    refreshCoreLoad()

    const handleDataUpdated = event => {
      const next = event.detail
      if (mounted && next && typeof next.coreLoad === 'number') setCoreLoad(next.coreLoad)
    }

    window.addEventListener('jel-data-updated', handleDataUpdated)
    const timer = window.setInterval(refreshCoreLoad, 15000)

    return () => {
      mounted = false
      window.removeEventListener('jel-data-updated', handleDataUpdated)
      window.clearInterval(timer)
    }
  }, [path])

  async function signOut() {
    await supabase?.auth.signOut()
  }

  const quickItems = [
    ['/notes', '+ Note'],
    ['/tests', '+ Test'],
    ['/circuits', '+ Circuit'],
    ['/mistakes', '+ Mistake'],
    ['/components', '+ Component'],
    ['/projects', '+ Project'],
  ]

  return <div className="app-shell">
    <div className="ambient ambient-a" /><div className="ambient ambient-b" />
    <aside className={'sidebar ' + (open ? 'sidebar-open' : '')}>
      <div className="brand"><div className="brand-mark"><Zap size={22} /></div><div><strong>JAY'S</strong><span>ENGINEERING LAB</span></div><button className="icon-btn mobile-close" onClick={() => setOpen(false)}><X size={18}/></button></div>
      <div className="system-status"><span className="status-dot"/> SYSTEM ONLINE <span className="mono">V0.1</span></div>
      <nav>{nav.map(([href, label, NIcon]) => <NavLink key={href} to={href} end={href === '/'} onClick={() => setOpen(false)} className={({isActive}) => 'nav-item ' + (isActive ? 'active' : '')}><NIcon size={17}/><span>{label}</span>{href === '/' && <span className="nav-live"/>}</NavLink>)}</nav>
      <div className="sidebar-bottom">
        <div className="mini-readout" title="Core Load = incomplete curriculum requirements ÷ total curriculum requirements">
          <span>CORE LOAD</span><b>{coreLoad}%</b><div className="meter"><i style={{ width: coreLoad + '%' }}/></div>
        </div>
        <button className="nav-item"><Settings size={17}/><span>System Settings</span></button>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="icon-btn menu-btn" onClick={() => setOpen(true)}><Menu size={20}/></button><div className="crumb"><span>ENGINEERING LAB</span><b>/</b><strong>{pageTitle.toUpperCase()}</strong></div><div className="top-actions"><span className="user-chip"><UserRound size={14}/>{user.email}</span><span className="clock mono">{status}</span><button className="icon-btn signout-btn" onClick={signOut} title="Sign out"><LogOut size={16}/></button><button className="quick-btn" onClick={() => setQuick(!quick)}><Plus size={17}/> QUICK ACTION</button></div></header>
      {quick && <div className="quick-panel">{quickItems.map(([href, label]) => <NavLink key={href} to={href} onClick={() => setQuick(false)}>{label}</NavLink>)}</div>}
      {path === '/' ? <DashboardPage /> : path === '/curriculum' ? <CurriculumPage /> : path === '/projects' ? <ProjectsPage /> : path === '/notes' ? <NotesPage /> : path === '/tests' ? <TestsPage /> : path === '/circuits' ? <CircuitsPage /> : path === '/components' ? <ComponentsPage /> : path === '/mistakes' ? <MistakesPage /> : <ModulePage title={pageTitle} Icon={Icon} description={module?.[1] ?? 'Engineering command center.'} />}
    </main>
  </div>
}

function ModulePage({ title, Icon, description }) {
  return <div className="content"><section className="module-hero"><div className="module-icon"><Icon size={28}/></div><div><p className="eyebrow">ENGINEERING MODULE</p><h1>{title}</h1><p>{description}</p></div><button className="primary module-action"><Plus size={17}/> Create New</button></section><div className="empty-workspace panel"><div className="scan-lines"/><Icon size={38}/><h2>Workspace initialized</h2><p>This module is scaffolded and ready for cloud-backed records. The Supabase schema and CRUD workflows are being connected in stages.</p><div className="workspace-tags"><span>AUTHENTICATED</span><span>V0.1</span><span>CLOUD PERSISTENCE</span></div></div></div>
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      return undefined
    }

    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (!supabaseConfigured) return <ConfigNotice />
  if (session === undefined) return <main className="auth-screen"><section className="auth-card loading-card"><div className="auth-brand"><div className="auth-brand-mark"><Zap size={22}/></div><div><strong>JAY'S</strong><span>ENGINEERING LAB</span></div></div><p className="eyebrow"><span className="pulse" /> SYSTEM BOOT</p><h1>Connecting to the lab...</h1><div className="boot-meter"><i /></div></section></main>
  if (!session?.user) return <AuthScreen />

  return <AppShell user={session.user} />
}
