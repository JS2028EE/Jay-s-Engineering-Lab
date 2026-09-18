import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Clock3, Loader2, Play, Plus, Square, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank={subject_id:'',topic_id:'',started_at:'',ended_at:'',duration_minutes:'',summary:''}

function minutesBetween(start,end){
  return Math.max(0,Math.round((new Date(end)-new Date(start))/60000))
}

function formatMinutes(value){
  const minutes=Number(value)||0
  const hours=Math.floor(minutes/60)
  const rest=minutes%60
  return hours?hours+'h '+rest+'m':rest+'m'
}

function localInputDateTime(date=new Date()){
  const pad=n=>String(n).padStart(2,'0')
  return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+'T'+pad(date.getHours())+':'+pad(date.getMinutes())
}

export default function StudySessionsPage(){
  const [sessions,setSessions]=useState([])
  const [subjects,setSubjects]=useState([])
  const [topics,setTopics]=useState([])
  const [active,setActive]=useState(null)
  const [creating,setCreating]=useState(false)
  const [form,setForm]=useState(blank)
  const [elapsed,setElapsed]=useState(0)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true)
    const [sessionResult,subjectResult,topicResult,activeResult]=await Promise.all([
      supabase.from('study_sessions').select('id,subject_id,topic_id,started_at,ended_at,duration_minutes,summary,created_at').order('started_at',{ascending:false}).limit(100),
      supabase.from('subjects').select('id,name').order('name'),
      supabase.from('topics').select('id,name,subject_id').order('name'),
      supabase.from('study_sessions').select('id,subject_id,topic_id,started_at,summary').is('ended_at',null).order('started_at',{ascending:false}).limit(1),
    ])
    const first=[sessionResult,subjectResult,topicResult,activeResult].map(r=>r.error).find(Boolean)
    if(first)setError(first.message)
    else{
      setSessions(sessionResult.data||[])
      setSubjects(subjectResult.data||[])
      setTopics(topicResult.data||[])
      setActive(activeResult.data?.[0]||null)
    }
    setLoading(false)
  }

  useEffect(()=>{refresh()},[])

  useEffect(()=>{
    if(!active){setElapsed(0);return undefined}
    const tick=()=>{
      setElapsed(Math.max(0,Math.floor((Date.now()-new Date(active.started_at).getTime())/1000)))
    }
    tick()
    const timer=window.setInterval(tick,1000)
    return ()=>window.clearInterval(timer)
  },[active])

  const activeElapsed=useMemo(()=>formatMinutes(Math.floor(elapsed/60)),[elapsed])

  function openManual(){
    setForm({...blank,started_at:localInputDateTime(),ended_at:localInputDateTime()})
    setCreating(true)
    setError('')
  }

  async function startSession(){
    if(active)return
    setSaving(true)
    const result=await supabase.from('study_sessions').insert({started_at:new Date().toISOString()}).select('id,subject_id,topic_id,started_at,summary').single()
    if(result.error)setError(result.error.message)
    else{setActive(result.data);window.dispatchEvent(new Event('jel-record-created'))}
    setSaving(false)
  }

  async function stopSession(){
    if(!active)return
    setSaving(true)
    const ended=new Date()
    const duration=minutesBetween(active.started_at,ended.toISOString())
    const result=await supabase.from('study_sessions').update({ended_at:ended.toISOString(),duration_minutes:duration}).eq('id',active.id)
    if(result.error)setError(result.error.message)
    else{setActive(null);await refresh();window.dispatchEvent(new Event('jel-record-created'))}
    setSaving(false)
  }

  async function saveManual(event){
    event.preventDefault()
    if(!form.started_at||!form.ended_at)return
    setSaving(true)
    const start=new Date(form.started_at)
    const end=new Date(form.ended_at)
    if(end<start){setError('End time must be after start time.');setSaving(false);return}
    const duration=form.duration_minutes===''?minutesBetween(form.started_at,form.ended_at):Math.max(0,Number(form.duration_minutes)||0)
    const result=await supabase.from('study_sessions').insert({
      subject_id:form.subject_id||null,
      topic_id:form.topic_id||null,
      started_at:start.toISOString(),
      ended_at:end.toISOString(),
      duration_minutes:duration,
      summary:form.summary.trim()||null,
    })
    if(result.error)setError(result.error.message)
    else{setCreating(false);setForm(blank);await refresh();window.dispatchEvent(new Event('jel-record-created'))}
    setSaving(false)
  }

  async function remove(id){
    if(!window.confirm('Delete this study session?'))return
    const result=await supabase.from('study_sessions').delete().eq('id',id)
    if(result.error)setError(result.error.message);else await refresh()
  }

  function subjectName(id){return subjects.find(s=>s.id===id)?.name||'General study'}
  function topicName(id){return topics.find(t=>t.id===id)?.name||''}

  const totalMinutes=sessions.reduce((sum,s)=>sum+(Number(s.duration_minutes)||0),0)

  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><Clock3 size={28}/></div>
      <div><p className="eyebrow">LEARNING ACTIVITY SYSTEM</p><h1>Study Sessions</h1><p>Record real study time. The dashboard and analytics use these sessions for actual study-hour totals.</p></div>
      <div className="module-actions"><button className="secondary" onClick={openManual}><Plus size={15}/> MANUAL SESSION</button><button className="primary" onClick={startSession} disabled={!!active||saving}><Play size={15}/> {active?'SESSION RUNNING':'START SESSION'}</button></div>
    </section>

    {error&&<div className="data-error">{error}</div>}

    {active&&<section className="panel active-session-card">
      <div><p className="eyebrow">ACTIVE SESSION</p><h2>{active.topic_id?topicName(active.topic_id):active.subject_id?subjectName(active.subject_id):'Engineering Study'}</h2><span>Started {new Date(active.started_at).toLocaleTimeString()}</span></div>
      <div className="active-session-clock">{activeElapsed}</div>
      <button className="primary" onClick={stopSession} disabled={saving}><Square size={14}/> {saving?'SAVING...':'STOP SESSION'}</button>
    </section>}

    {creating&&<form className="panel record-form" onSubmit={saveManual}>
      <div className="record-form-head"><div><p className="eyebrow">MANUAL SESSION</p><h2>Record Study Time</h2></div><button type="button" className="ghost" onClick={()=>setCreating(false)}>CANCEL</button></div>
      <label><span>Subject</span><select value={form.subject_id} onChange={e=>setForm(p=>({...p,subject_id:e.target.value,topic_id:''}))}><option value="">General</option>{subjects.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
      <label><span>Topic</span><select value={form.topic_id} onChange={e=>setForm(p=>({...p,topic_id:e.target.value}))}><option value="">No topic</option>{topics.filter(t=>!form.subject_id||t.subject_id===form.subject_id).map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
      <label><span>Started</span><input type="datetime-local" required value={form.started_at} onChange={e=>setForm(p=>({...p,started_at:e.target.value}))}/></label>
      <label><span>Ended</span><input type="datetime-local" required value={form.ended_at} onChange={e=>setForm(p=>({...p,ended_at:e.target.value}))}/></label>
      <label><span>Duration Override (min)</span><input type="number" min="0" step="1" value={form.duration_minutes} onChange={e=>setForm(p=>({...p,duration_minutes:e.target.value}))} placeholder="Auto-calculate"/></label>
      <label className="wide"><span>Summary</span><textarea rows="3" value={form.summary} onChange={e=>setForm(p=>({...p,summary:e.target.value}))} placeholder="What did you study or solve?"/></label>
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:<Plus size={15}/>} {saving?'SAVING...':'SAVE SESSION'}</button>
    </form>}

    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading study history...</span></div>:sessions.length===0?<div className="panel data-state"><BookOpen size={36}/><h2>No study sessions yet.</h2><p>Start the timer or enter a session manually. Your total study time will become real dashboard data.</p><button className="primary" onClick={startSession}><Play size={15}/> START FIRST SESSION</button></div>:
      <div className="record-list">
        <div className="panel study-summary"><div><span>RECORDED STUDY TIME</span><strong>{formatMinutes(totalMinutes)}</strong></div><div><span>SESSIONS</span><strong>{sessions.length}</strong></div></div>
        {sessions.map(s=><article className="panel record-card" key={s.id}>
          <div className="record-card-head"><div><p className="eyebrow">STUDY SESSION</p><h2>{subjectName(s.subject_id)}{topicName(s.topic_id)?' / '+topicName(s.topic_id):''}</h2></div><button className="icon-btn danger-btn" onClick={()=>remove(s.id)}><Trash2 size={14}/></button></div>
          <div className="metric-row"><strong>{formatMinutes(s.duration_minutes)}</strong><span>{new Date(s.started_at).toLocaleString()}</span>{s.ended_at&&<span>→ {new Date(s.ended_at).toLocaleTimeString()}</span>}</div>
          {s.summary&&<p className="record-content">{s.summary}</p>}
        </article>)}
      </div>}
  </div>
}
