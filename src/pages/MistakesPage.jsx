import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Pencil, Plus, Save, ShieldAlert, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank={question:'',user_answer:'',correct_answer:'',explanation:'',what_went_wrong:'',severity:'medium',subject_id:'',topic_id:''}

export default function MistakesPage(){
  const [mistakes,setMistakes]=useState([])
  const [subjects,setSubjects]=useState([])
  const [topics,setTopics]=useState([])
  const [creating,setCreating]=useState(false)
  const [editingId,setEditingId]=useState(null)
  const [form,setForm]=useState(blank)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true);setError('')
    const [mistakeResult,subjectResult,topicResult]=await Promise.all([
      supabase.from('mistakes').select('id,question,user_answer,correct_answer,explanation,what_went_wrong,severity,resolved,subject_id,topic_id,created_at,resolved_at').order('created_at',{ascending:false}),
      supabase.from('subjects').select('id,name').order('name'),
      supabase.from('topics').select('id,name,subject_id').order('name'),
    ])
    const first=[mistakeResult,subjectResult,topicResult].map(r=>r.error).find(Boolean)
    if(first)setError(first.message)
    else{setMistakes(mistakeResult.data||[]);setSubjects(subjectResult.data||[]);setTopics(topicResult.data||[])}
    setLoading(false)
  }
  useEffect(()=>{refresh()},[])

  function startCreate(){setEditingId(null);setForm(blank);setCreating(true);setError('')}
  function startEdit(m){setEditingId(m.id);setForm({question:m.question||'',user_answer:m.user_answer||'',correct_answer:m.correct_answer||'',explanation:m.explanation||'',what_went_wrong:m.what_went_wrong||'',severity:m.severity||'medium',subject_id:m.subject_id||'',topic_id:m.topic_id||''});setCreating(true);setError('')}
  function cancel(){setCreating(false);setEditingId(null);setForm(blank)}

  async function save(event){
    event.preventDefault();if(!form.question.trim())return
    setSaving(true);setError('')
    const result=editingId?await supabase.from('mistakes').update({question:form.question.trim(),user_answer:form.user_answer.trim()||null,correct_answer:form.correct_answer.trim()||null,explanation:form.explanation.trim()||null,what_went_wrong:form.what_went_wrong.trim()||null,severity:form.severity,subject_id:form.subject_id||null,topic_id:form.topic_id||null}).eq('id',editingId):await supabase.from('mistakes').insert({question:form.question.trim(),user_answer:form.user_answer.trim()||null,correct_answer:form.correct_answer.trim()||null,explanation:form.explanation.trim()||null,what_went_wrong:form.what_went_wrong.trim()||null,severity:form.severity,subject_id:form.subject_id||null,topic_id:form.topic_id||null})
    if(result.error)setError(result.error.message)
    else{cancel();await refresh();window.dispatchEvent(new Event('jel-record-created'))}
    setSaving(false)
  }

  async function toggleResolved(id,resolved){const result=await supabase.from('mistakes').update({resolved,resolved_at:resolved?new Date().toISOString():null}).eq('id',id);if(result.error)setError(result.error.message);else await refresh()}
  async function remove(id){if(!window.confirm('Delete this mistake record?'))return;const result=await supabase.from('mistakes').delete().eq('id',id);if(result.error)setError(result.error.message);else await refresh()}

  const filteredTopics=topics.filter(t=>!form.subject_id||t.subject_id===form.subject_id)
  function subjectName(id){return subjects.find(s=>s.id===id)?.name||''}
  function topicName(id){return topics.find(t=>t.id===id)?.name||''}

  return <div className="content">
    <section className="module-hero"><div className="module-icon"><ShieldAlert size={28}/></div><div><p className="eyebrow">ENGINEERING FEEDBACK LOOP</p><h1>Mistakes</h1><p>Turn errors into structured data so repeated problems, topics, and resolution rates can be measured.</p></div><button className="primary module-action" onClick={startCreate}><Plus size={17}/> NEW MISTAKE</button></section>
    {error&&<div className="data-error">{error}</div>}
    {creating&&<form className="panel record-form mistake-form" onSubmit={save}>
      <div className="record-form-head"><div><p className="eyebrow">{editingId?'EDIT MISTAKE':'LOG MISTAKE'}</p><h2>{editingId?'Edit Mistake Record':'New Mistake Record'}</h2></div><button type="button" className="ghost" onClick={cancel}><X size={14}/> CANCEL</button></div>
      <label className="wide"><span>Question / Problem</span><textarea required autoFocus rows="3" value={form.question} onChange={e=>setForm(p=>({...p,question:e.target.value}))} placeholder="What problem did you get wrong?"/></label>
      <label><span>Subject</span><select value={form.subject_id} onChange={e=>setForm(p=>({...p,subject_id:e.target.value,topic_id:''}))}><option value="">General</option>{subjects.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
      <label><span>Topic</span><select value={form.topic_id} onChange={e=>setForm(p=>({...p,topic_id:e.target.value}))}><option value="">No topic</option>{filteredTopics.map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
      <label><span>Your Answer</span><textarea rows="3" value={form.user_answer} onChange={e=>setForm(p=>({...p,user_answer:e.target.value}))}/></label>
      <label><span>Correct Answer</span><textarea rows="3" value={form.correct_answer} onChange={e=>setForm(p=>({...p,correct_answer:e.target.value}))}/></label>
      <label><span>What Went Wrong?</span><textarea rows="3" value={form.what_went_wrong} onChange={e=>setForm(p=>({...p,what_went_wrong:e.target.value}))}/></label>
      <label><span>Severity</span><select value={form.severity} onChange={e=>setForm(p=>({...p,severity:e.target.value}))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
      <label className="wide"><span>Explanation / Lesson</span><textarea rows="4" value={form.explanation} onChange={e=>setForm(p=>({...p,explanation:e.target.value}))} placeholder="What should you remember next time?"/></label>
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:editingId?<Save size={15}/>:<Plus size={15}/>} {saving?'SAVING...':editingId?'UPDATE MISTAKE':'SAVE MISTAKE'}</button>
    </form>}
    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your mistakes...</span></div>:mistakes.length===0?<div className="panel data-state"><ShieldAlert size={36}/><h2>No mistakes recorded.</h2><p>Record mistakes when they happen so the feedback system can measure patterns over time.</p><button className="primary" onClick={startCreate}><Plus size={16}/> LOG FIRST MISTAKE</button></div>:
      <div className="record-list">{mistakes.map(m=><article className={'panel record-card mistake-card '+(m.resolved?'resolved':'')} key={m.id}>
        <div className="record-card-head"><div><p className="eyebrow">{m.resolved?'RESOLVED MISTAKE':'OPEN MISTAKE'}</p><h2>{m.question}</h2><div className="record-meta">{m.subject_id&&<span>{subjectName(m.subject_id)}</span>}{m.topic_id&&<span>{topicName(m.topic_id)}</span>}</div></div><div className="record-actions"><span className={'severity severity-'+m.severity}>{m.severity}</span><button className="icon-btn" title="Edit mistake" onClick={()=>startEdit(m)}><Pencil size={14}/></button><button className="icon-btn danger-btn" onClick={()=>remove(m.id)}><Trash2 size={14}/></button></div></div>
        <div className="detail-grid">{m.user_answer&&<div><span>Your Answer</span><p>{m.user_answer}</p></div>}{m.correct_answer&&<div><span>Correct Answer</span><p>{m.correct_answer}</p></div>}{m.what_went_wrong&&<div><span>What Went Wrong</span><p>{m.what_went_wrong}</p></div>}{m.explanation&&<div><span>Lesson</span><p>{m.explanation}</p></div>}</div>
        <button className={m.resolved?'secondary':'primary'} onClick={()=>toggleResolved(m.id,!m.resolved)}>{m.resolved?<><CheckCircle2 size={14}/> MARK OPEN</>:<><CheckCircle2 size={14}/> MARK RESOLVED</>}</button>
      </article>)}</div>}
  </div>
}
