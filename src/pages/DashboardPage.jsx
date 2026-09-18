import { useEffect, useState } from 'react'
import { Activity, BookOpen, Boxes, CircuitBoard, Gauge, GitBranch, GraduationCap, NotebookPen, Plus, Target, TestTube2 } from 'lucide-react'
import { getDashboardData } from '../lib/data'

function Sparkline() {
  return <svg viewBox="0 0 500 110" className="sparkline" preserveAspectRatio="none"><polyline points="0,94 48,86 92,90 138,68 180,76 228,51 272,60 320,38 362,45 410,25 455,31 500,10" fill="none" stroke="currentColor" strokeWidth="3" /></svg>
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      setData(await getDashboardData())
    } catch (err) {
      setError(err.message || 'Could not load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(function () { refresh() }, [])

  const stats = [
    ['Engineering Progress', data ? data.overallProgress + '%' : '—', 'LIVE', Gauge],
    ['Lessons Mastered', data ? String(data.masteredLessons) : '—', 'LIVE', GraduationCap],
    ['Study Hours', data ? String(data.studyHours) : '—', 'LIVE', BookOpen],
    ['Projects', data ? String(data.projectCount) : '—', data ? String(data.activeProjectCount) + ' active' : 'LIVE', GitBranch],
  ]

  return (
    <div className="content">
      <section className="hero">
        <div>
          <p className="eyebrow"><span className="pulse" /> LIVE ENGINEERING COMMAND CENTER</p>
          <h1>Build. Learn. <em>Engineer.</em></h1>
          <p className="hero-copy">One connected workspace for your curriculum, circuits, projects, components, mistakes, and the knowledge you build along the way.</p>
          <div className="hero-actions">
            <button className="primary"><Plus size={17}/> NEW ENGINEERING RECORD</button>
            <a className="secondary" href="/curriculum">OPEN CURRICULUM <Target size={16}/></a>
          </div>
        </div>
        <div className="hero-terminal">
          <div className="terminal-head"><span>LAB_TELEMETRY</span><span className="mono">READY</span></div>
          <div className="terminal-grid">
            <div><span>DATA SOURCE</span><b>SUPABASE <small>DB</small></b></div>
            <div><span>AUTH</span><b>ACTIVE <small>RLS</small></b></div>
            <div><span>RECORDS</span><b>{data ? data.projectCount + data.masteredLessons : '—'} <small>INDEXED</small></b></div>
            <div><span>STATUS</span><b>ONLINE <small>SYNC</small></b></div>
          </div>
          <Sparkline/>
          <div className="terminal-foot"><span>KNOWLEDGE SIGNAL</span><span className="cyan">{loading ? 'SYNCING' : 'LIVE / DERIVED'}</span></div>
        </div>
      </section>

      {error && <div className="data-error">{error}</div>}

      <section className="stat-grid">
        {stats.map(function (item) {
          const label = item[0]
          const value = item[1]
          const delta = item[2]
          const StatIcon = item[3]
          return <div className="stat-card" key={label}><div className="stat-icon"><StatIcon size={17}/></div><span>{label}</span><strong>{value}</strong><small>{delta}</small></div>
        })}
      </section>

      <section className="dashboard-grid">
        <div className="panel curriculum-panel">
          <div className="panel-head"><div><p className="eyebrow">CURRICULUM CORE</p><h2>Engineering Progress</h2></div><a className="ghost" href="/curriculum">VIEW ALL →</a></div>
          <div className="overall"><div><span>OVERALL MASTERY</span><b>{data ? data.overallProgress + '%' : '—'}</b></div><div className="progress"><i style={{ width: (data ? data.overallProgress : 0) + '%' }}/></div></div>
          {loading ? <div className="dashboard-loading">Syncing curriculum from Supabase...</div> : !data || data.subjects.length === 0 ? <div className="dashboard-loading">Your curriculum is empty. Open Curriculum to build it from scratch.</div> : data.subjects.map(function (subject) {
            return <div className="subject" key={subject.id}><div><span>{subject.name}</span><small>{subject.unit_count} units</small></div><b>{subject.progress}%</b><div className="progress thin"><i style={{ width: subject.progress + '%' }}/></div></div>
          })}
        </div>

        <div className="panel activity-panel">
          <div className="panel-head"><div><p className="eyebrow">SYSTEM MODULES</p><h2>Ready to Build</h2></div><Activity size={18}/></div>
          {[
            ['Curriculum', GraduationCap, '/curriculum'],
            ['Notes', NotebookPen, '/notes'],
            ['Tests', TestTube2, '/tests'],
            ['Circuits', CircuitBoard, '/circuits'],
            ['Components', Boxes, '/components'],
            ['Projects', GitBranch, '/projects'],
          ].map(function (item) {
            const Icon = item[1]
            return <a className="module-link" key={item[0]} href={item[2]}><span><Icon size={15}/>{item[0]}</span><b>OPEN →</b></a>
          })}
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel graph-panel">
          <div className="panel-head"><div><p className="eyebrow">KNOWLEDGE GROWTH</p><h2>Progress Signal</h2></div><span className="trend">LIVE DATA</span></div>
          <div className="big-chart"><div className="chart-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><Sparkline/><div className="chart-axis"><span>START</span><span>CURRENT</span></div></div>
        </div>
        <div className="panel focus-panel">
          <p className="eyebrow">NEXT STEP</p>
          <h2>{data && data.subjects.length ? 'Keep building your curriculum.' : 'Start your engineering curriculum.'}</h2>
          <p>{data && data.subjects.length ? 'Open Curriculum and add units, lessons, and requirements. Completing requirements will automatically change the progress shown here.' : 'Create your first Subject → Unit → Lesson → Requirement chain. Your dashboard will populate automatically.'}</p>
          <a className="primary full" href="/curriculum">GO TO CURRICULUM <Target size={16}/></a>
        </div>
      </section>
    </div>
  )
}
