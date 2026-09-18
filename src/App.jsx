import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Activity, BookOpen, Boxes, CircuitBoard, Gauge, GitBranch, GraduationCap, LayoutDashboard, Menu, NotebookPen, Plus, Settings, ShieldAlert, Sparkles, Target, TestTube2, X, Zap, LogOut, UserRound } from 'lucide-react'
import AuthScreen from './components/AuthScreen'
import DashboardPage from './pages/DashboardPage'
import CurriculumPage from './pages/CurriculumPage'
import { supabase, supabaseConfigured } from './lib/supabase'

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

const stats = [
  ['Engineering Progress', '57%', '+8.4%', Gauge],
  ['Lessons Mastered', '18', '+4 this month', GraduationCap],
  ['Study Hours', '42.6', '+6.2h', BookOpen],
  ['Projects', '7', '2 active', GitBranch],
]

const subjects = [
  ['Circuit Analysis', 72, '12 / 17 lessons'],
  ['Embedded Systems', 48, '8 / 17 lessons'],
  ['Digital Logic', 61, '11 / 18 lessons'],
  ['Programming', 54, '14 / 26 lessons'],
]

function Sparkline() {
  return <svg viewBox="0 0 500 110" className="sparkline" preserveAspectRatio="none"><polyline points="0,94 48,86 92,90 138,68 180,76 228,51 272,60 320,38 362,45 410,25 455,31 500,10" fill="none" stroke="currentColor" strokeWidth="3" /></svg>
}

function ConfigNotice() {
  return <main className="auth-screen"><div className="ambient ambient-a" /><div className="ambient ambient-b" /><section className="auth-card"><div className="auth-brand"><div className="auth-brand-mark"><Zap size={22} /></div><div><strong>JAY'S</strong><span>ENGINEERING LAB</span></div></div><p className="eyebrow"><span className="pulse" /> LOCAL SETUP REQUIRED</p><h1>Connect the lab to Supabase.</h1><p className="auth-copy">The application code is ready, but your local environment still needs the Supabase Project URL and publishable key.</p><div className="setup-code"><code>VITE_SUPABASE_URL=...</code><code>VITE_SUPABASE_PUBLISHABLE_KEY=...</code></div><p className="auth-note">Create a local <span className="mono">.env</span> file from <span className="mono">.env.example</span>, add the two values from your Supabase project, then restart Vite.</p></section></main>
}

function AppShell({ user }) {
  const [open, setOpen] = useState(false)
  const [quick, setQuick] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const module = modules[path]
  const pageTitle = module?.[0] ?? 'Dashboard'
  const Icon = module?.[2] ?? LayoutDashboard
  const status = useMemo(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), [])

  async function signOut() {
    await supabase?.auth.signOut()
  }

  return <div className="app-shell">
    <div className="ambient ambient-a" /><div className="ambient ambient-b" />
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Zap size={22} /></div><div><strong>JAY'S</strong><span>ENGINEERING LAB</span></div><button className="icon-btn mobile-close" onClick={() => setOpen(false)}><X size={18}/></button></div>
      <div className="system-status"><span className="status-dot"/> SYSTEM ONLINE <span className="mono">V0.1</span></div>
      <nav>{nav.map(([href, label, NIcon]) => <NavLink key={href} to={href} onClick={() => setOpen(false)} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><NIcon size={17}/><span>{label}</span>{href === '/' && <span className="nav-live"/>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="mini-readout"><span>CORE LOAD</span><b>32.8%</b><div className="meter"><i style={{width:'33%'}}/></div></div><button className="nav-item"><Settings size={17}/><span>System Settings</span></button></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="icon-btn menu-btn" onClick={() => setOpen(true)}><Menu size={20}/></button><div className="crumb"><span>ENGINEERING LAB</span><b>/</b><strong>{pageTitle.toUpperCase()}</strong></div><div className="top-actions"><span className="user-chip"><UserRound size={14}/>{user.email}</span><span className="clock mono">{status}</span><button className="icon-btn signout-btn" onClick={signOut} title="Sign out"><LogOut size={16}/></button><button className="quick-btn" onClick={() => setQuick(!quick)}><Plus size={17}/> QUICK ACTION</button></div></header>
      {quick && <div className="quick-panel"><button>+ Note</button><button>+ Test</button><button>+ Circuit</button><button>+ Mistake</button><button>+ Component</button><button>+ Project</button></div>}
      {path === '/' ? <DashboardPage /> : path === '/curriculum' ? <CurriculumPage /> : <ModulePage title={pageTitle} Icon={Icon} description={module?.[1] ?? 'Engineering command center.'} />}
    </main>
  </div>
}

function Dashboard() {
  return <div className="content"><section className="hero"><div><p className="eyebrow"><span className="pulse"/> LIVE ENGINEERING COMMAND CENTER</p><h1>Build. Learn. <em>Engineer.</em></h1><p className="hero-copy">One connected workspace for your curriculum, circuits, projects, components, mistakes, and the knowledge you build along the way.</p><div className="hero-actions"><button className="primary"><Plus size={17}/> New Engineering Record</button><button className="secondary">Open Curriculum <Target size={16}/></button></div></div><div className="hero-terminal"><div className="terminal-head"><span>LAB_TELEMETRY</span><span className="mono">LIVE</span></div><div className="terminal-grid"><div><span>VOLTAGE</span><b>4.9823 <small>V</small></b></div><div><span>CURRENT</span><b>0.483 <small>mA</small></b></div><div><span>RESISTANCE</span><b>10.31 <small>kΩ</small></b></div><div><span>FREQUENCY</span><b>1.0024 <small>kHz</small></b></div></div><Sparkline/><div className="terminal-foot"><span>KNOWLEDGE SIGNAL</span><span className="cyan">STABLE / RISING</span></div></div></section>
    <section className="stat-grid">{stats.map(([label,value,delta,StatIcon]) => <div className="stat-card" key={label}><div className="stat-icon"><StatIcon size={17}/></div><span>{label}</span><strong>{value}</strong><small>{delta}</small></div>)}</section>
    <section className="dashboard-grid"><div className="panel curriculum-panel"><div className="panel-head"><div><p className="eyebrow">CURRICULUM CORE</p><h2>Engineering Progress</h2></div><button className="ghost">VIEW ALL →</button></div><div className="overall"><div><span>OVERALL MASTERY</span><b>57%</b></div><div className="progress"><i style={{width:'57%'}}/></div></div>{subjects.map(([name,pct,meta]) => <div className="subject" key={name}><div><span>{name}</span><small>{meta}</small></div><b>{pct}%</b><div className="progress thin"><i style={{width:`${pct}%`}}/></div></div>)}</div><div className="panel activity-panel"><div className="panel-head"><div><p className="eyebrow">ACTIVITY STREAM</p><h2>Lab Timeline</h2></div><Activity size={18}/></div>{[['10:42','Solved','KCL practice problem','Circuit Analysis'],['09:58','Updated','Embedded Systems notes','Embedded Systems'],['09:21','Logged','2N3904 × 10 to inventory','Components'],['08:47','Completed','Ohm’s Law requirement','Curriculum']].map(([time,verb,text,tag]) => <div className="activity" key={time}><time>{time}</time><div><b>{verb}</b><span>{text}</span></div><label>{tag}</label></div>)}</div></section>
    <section className="bottom-grid"><div className="panel graph-panel"><div className="panel-head"><div><p className="eyebrow">KNOWLEDGE GROWTH</p><h2>Progress Signal</h2></div><span className="trend">↗ 8.4%</span></div><div className="big-chart"><div className="chart-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><Sparkline/><div className="chart-axis"><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span></div></div></div><div className="panel focus-panel"><p className="eyebrow">NEXT TARGET</p><h2>Master Trigonometric Foundations</h2><p>Complete 4 remaining requirements to move your Trigonometry unit from 76% to mastered.</p><div className="target-row"><div className="target-ring">76%</div><div><b>4 requirements left</b><span>Estimated 2.5 study hours</span></div></div><button className="primary full">CONTINUE LESSON <Target size={16}/></button></div></section>
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
  if (session === undefined) return <main className="auth-screen"><section className="auth-card loading-card"><div className="auth-brand"><div className="auth-brand-mark"><Zap size={22} /></div><div><strong>JAY'S</strong><span>ENGINEERING LAB</span></div></div><p className="eyebrow"><span className="pulse" /> SYSTEM BOOT</p><h1>Connecting to the lab...</h1><div className="boot-meter"><i /></div></section></main>
  if (!session?.user) return <AuthScreen />

  return <AppShell user={session.user} />
}
