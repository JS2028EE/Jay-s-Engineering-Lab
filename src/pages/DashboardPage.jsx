import { useEffect, useState } from 'react'
import { Activity, Boxes, CircuitBoard, Gauge, GitBranch, GraduationCap, NotebookPen, Target, TestTube2, AlertTriangle, BookOpen } from 'lucide-react'
import { getDashboardData } from '../lib/data'

function Sparkline({ points = [] }) {
  if (!points.length) {
    return <div className="chart-empty">No curriculum completion data yet.</div>
  }

  const width = 500
  const height = 110
  const paddingX = 5
  const usableWidth = width - paddingX * 2
  const usableHeight = 90
  const pointsString = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : paddingX + (index / (points.length - 1)) * usableWidth
    const y = 100 - (point.percent / 100) * usableHeight
    return x.toFixed(1) + ',' + y.toFixed(1)
  }).join(' ')

  return (
    <div className="chart-wrap">
      <svg viewBox={'0 0 ' + width + ' ' + height} className="sparkline" preserveAspectRatio="none">
        <polyline points={pointsString} fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
      <div className="chart-axis">
        {points.map((point, index) => <span key={point.label + index}>{point.label}</span>)}
      </div>
    </div>
  )
}

function StatCard({ label, value, meta, Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={17}/></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{meta}</small>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const next = await getDashboardData()
      setData(next)
      window.dispatchEvent(new CustomEvent('jel-data-updated', { detail: next }))
    } catch (err) {
      setError(err.message || 'Could not load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const testAverage = data?.testAverage == null ? '—' : data.testAverage + '%'
  const progress = data?.overallProgress ?? 0
  const coreLoad = data?.coreLoad ?? 0
  const history = data?.progressHistory ?? []

  return (
    <div className="content">
      <section className="hero">
        <div>
          <p className="eyebrow"><span className="pulse" /> LIVE ENGINEERING COMMAND CENTER</p>
          <h1>Build. Learn. <em>Engineer.</em></h1>
          <p className="hero-copy">One connected workspace for your curriculum, circuits, projects, components, mistakes, and the knowledge you build along the way.</p>
          <div className="hero-actions">
            <a className="primary" href="/curriculum">OPEN CURRICULUM <Target size={16}/></a>
            <a className="secondary" href="/projects">OPEN PROJECTS <GitBranch size={16}/></a>
          </div>
        </div>
        <div className="hero-terminal">
          <div className="terminal-head"><span>LAB_TELEMETRY</span><span className="mono">LIVE</span></div>
          <div className="terminal-grid">
            <div><span>CURRICULUM</span><b>{progress}<small>% COMPLETE</small></b></div>
            <div><span>CORE LOAD</span><b>{coreLoad}<small>% OPEN</small></b></div>
            <div><span>TEST AVG</span><b>{testAverage}<small> SCORED</small></b></div>
            <div><span>STUDY</span><b>{data ? data.studyHours : '—'}<small> H TOTAL</small></b></div>
          </div>
          <Sparkline points={history} />
          <div className="terminal-foot"><span>DATA SOURCE</span><span className="cyan">{loading ? 'SYNCING' : 'SUPABASE / DERIVED'}</span></div>
        </div>
      </section>

      {error && <div className="data-error">{error}</div>}

      <section className="stat-grid">
        <StatCard label="Engineering Progress" value={progress + '%'} meta={data ? data.completedRequirements + ' / ' + data.totalRequirements + ' req.' : 'SYNC'} Icon={Gauge}/>
        <StatCard label="Lessons Mastered" value={data ? String(data.masteredLessons) : '—'} meta={data ? data.lessonCount + ' total lessons' : 'SYNC'} Icon={GraduationCap}/>
        <StatCard label="Study Hours" value={data ? String(data.studyHours) : '—'} meta="recorded sessions" Icon={BookOpen}/>
        <StatCard label="Projects" value={data ? String(data.projectCount) : '—'} meta={data ? data.activeProjectCount + ' active' : 'SYNC'} Icon={GitBranch}/>
        <StatCard label="Notes" value={data ? String(data.notesCount) : '—'} meta="saved records" Icon={NotebookPen}/>
        <StatCard label="Tests" value={data ? String(data.testCount) : '—'} meta={data && data.testAverage != null ? data.testAverage + '% avg.' : 'no scored tests'} Icon={TestTube2}/>
        <StatCard label="Circuits" value={data ? String(data.circuitsCount) : '—'} meta="saved records" Icon={CircuitBoard}/>
        <StatCard label="Components" value={data ? String(data.componentQuantity) : '—'} meta={data ? data.componentCount + ' unique parts' : 'SYNC'} Icon={Boxes}/>
      </section>

      <section className="dashboard-grid">
        <div className="panel curriculum-panel">
          <div className="panel-head"><div><p className="eyebrow">CURRICULUM CORE</p><h2>Engineering Progress</h2></div><a className="ghost" href="/curriculum">VIEW ALL →</a></div>
          <div className="overall">
            <div><span>OVERALL MASTERY</span><b>{progress}%</b></div>
            <div className="progress"><i style={{ width: progress + '%' }}/></div>
          </div>
          {loading ? <div className="dashboard-loading">Syncing curriculum from Supabase...</div> : !data || data.subjects.length === 0 ? <div className="dashboard-loading">Your curriculum is empty. Open Curriculum to build it from scratch.</div> : data.subjects.map(function (subject) {
            return <div className="subject" key={subject.id}><div><span>{subject.name}</span><small>{subject.unit_count} units</small></div><b>{subject.progress}%</b><div className="progress thin"><i style={{ width: subject.progress + '%' }}/></div></div>
          })}
        </div>

        <div className="panel activity-panel">
          <div className="panel-head"><div><p className="eyebrow">LAB ACTIVITY</p><h2>Recent Records</h2></div><Activity size={18}/></div>
          {loading ? <div className="dashboard-loading">Loading activity...</div> : !data?.recentActivity?.length ? <div className="dashboard-loading">Your activity stream will populate as you create records.</div> : data.recentActivity.map((item,index) => (
            <div className="activity" key={item.at + item.type + index}>
              <time>{new Date(item.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</time>
              <div><b>{item.verb}</b><span>{item.text}</span></div>
              <label>{item.type}</label>
            </div>
          ))}
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel graph-panel">
          <div className="panel-head"><div><p className="eyebrow">CURRICULUM HISTORY</p><h2>Completion Signal</h2></div><span className="trend">{history.length ? 'DERIVED FROM COMPLETIONS' : 'NO HISTORY YET'}</span></div>
          <div className="big-chart">
            <div className="chart-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
            <Sparkline points={history}/>
          </div>
        </div>

        <div className="panel focus-panel">
          <p className="eyebrow">WEEKLY TELEMETRY</p>
          <h2>{data ? data.weekStudyHours : '—'} h studied this week.</h2>
          <p>{data ? data.studySessionCount + ' completed study sessions are stored in the Lab.' : 'Study activity will appear after you record sessions.'}</p>
          <a className="secondary full" href="/study-sessions">OPEN STUDY SESSIONS <BookOpen size={15}/></a>
          <p className="eyebrow next-step-label">NEXT STEP</p>
          <h2>{data && data.totalRequirements > data.completedRequirements ? 'Finish an open requirement.' : 'Start your engineering curriculum.'}</h2>
          <p>{data && data.totalRequirements > data.completedRequirements ? (data.totalRequirements - data.completedRequirements) + ' curriculum requirements are still open. Completing one will immediately change the real progress and core-load values across the Lab.' : 'Create your first Subject → Unit → Lesson → Requirement chain. Every completed requirement becomes part of your real engineering progress.'}</p>
          <a className="primary full" href="/curriculum">GO TO CURRICULUM <Target size={16}/></a>
        </div>
      </section>
    </div>
  )
}
