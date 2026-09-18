import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, Boxes, BookOpen, CircuitBoard, Gauge, GitBranch, GraduationCap, Loader2, NotebookPen, TestTube2 } from 'lucide-react'
import { getDashboardData } from '../lib/data'

function Metric({label,value,detail,Icon}) {
  return <div className="stat-card"><div className="stat-icon"><Icon size={17}/></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
}

export default function AnalyticsPage(){
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{
    let mounted=true
    getDashboardData().then(next=>{if(mounted)setData(next)}).catch(err=>{if(mounted)setError(err.message||'Could not load analytics.')}).finally(()=>{if(mounted)setLoading(false)})
    return ()=>{mounted=false}
  },[])

  if(loading) return <div className="content"><div className="panel data-state"><Loader2 className="spin" size={22}/><span>Calculating analytics from your records...</span></div></div>

  const d=data||{}
  const testAvg=d.testAverage==null?'—':d.testAverage+'%'
  const resolution=d.mistakesCount?Math.round(((d.mistakesCount-d.unresolvedMistakes)/d.mistakesCount)*100)+'%':'—'
  const history=d.progressHistory||[]

  return <div className="content">
    <section className="module-hero"><div className="module-icon"><Activity size={28}/></div><div><p className="eyebrow">DERIVED ENGINEERING TELEMETRY</p><h1>Analytics</h1><p>Every value below is calculated from your saved Engineering Lab records.</p></div></section>
    {error&&<div className="data-error">{error}</div>}
    <section className="stat-grid">
      <Metric label="Engineering Progress" value={(d.overallProgress??0)+'%'} detail={(d.completedRequirements??0)+' / '+(d.totalRequirements??0)+' requirements'} Icon={Gauge}/>
      <Metric label="Core Load" value={(d.coreLoad??0)+'%'} detail="open requirements" Icon={Activity}/>
      <Metric label="Test Average" value={testAvg} detail={(d.testCount??0)+' tests'} Icon={TestTube2}/>
      <Metric label="Study Time" value={(d.studyHours??0)+' h'} detail="recorded sessions" Icon={BookOpen}/>
      <Metric label="Projects" value={d.projectCount??0} detail={(d.activeProjectCount??0)+' active'} Icon={GitBranch}/>
      <Metric label="Notes" value={d.notesCount??0} detail="saved notes" Icon={NotebookPen}/>
      <Metric label="Circuits" value={d.circuitsCount??0} detail="saved circuits" Icon={CircuitBoard}/>
      <Metric label="Inventory" value={d.componentQuantity??0} detail={(d.componentCount??0)+' unique parts'} Icon={Boxes}/>
    </section>

    <section className="dashboard-grid">
      <div className="panel">
        <div className="panel-head"><div><p className="eyebrow">CURRICULUM HISTORY</p><h2>Real Completion Trend</h2></div><span className="trend">{history.length?'LIVE HISTORY':'NO COMPLETIONS YET'}</span></div>
        {history.length?<div className="analytics-history">{history.map((item,index)=><div className="history-row" key={item.label+index}><span>{item.label}</span><div className="progress"><i style={{width:item.percent+'%'}}/></div><b>{item.percent}%</b></div>) : <div className="data-state compact"><Gauge size={30}/><span>Complete requirements to generate historical progress.</span></div>}
      </div>
      <div className="panel">
        <div className="panel-head"><div><p className="eyebrow">ERROR FEEDBACK</p><h2>Mistake Resolution</h2></div><AlertTriangle size={18}/></div>
        <div className="overall"><div><span>RESOLVED RATE</span><b>{resolution}</b></div><div className="progress"><i style={{width:resolution==='—'?0:resolution}}/></div></div>
        <div className="health-row"><span>Total mistakes</span><b>{d.mistakesCount??0}</b></div>
        <div className="health-row"><span>Unresolved</span><b>{d.unresolvedMistakes??0}</b></div>
        <div className="health-row"><span>Lessons mastered</span><b>{d.masteredLessons??0}</b></div>
      </div>
    </section>

    <section className="panel">
      <div className="panel-head"><div><p className="eyebrow">DATA COVERAGE</p><h2>Lab Record Counts</h2></div><span className="trend">SUPABASE / DERIVED</span></div>
      <div className="coverage-grid">
        {[
          ['Subjects',d.subjects?.length??0,GraduationCap],
          ['Lessons',d.lessonCount??0,GraduationCap],
          ['Notes',d.notesCount??0,NotebookPen],
          ['Tests',d.testCount??0,TestTube2],
          ['Circuits',d.circuitsCount??0,CircuitBoard],
          ['Projects',d.projectCount??0,GitBranch],
          ['Components',d.componentCount??0,Boxes],
        ].map(([label,value,Icon])=><div className="coverage-item" key={label}><Icon size={15}/><span>{label}</span><b>{value}</b></div>)}
      </div>
    </section>
  </div>
}
