import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, Pencil, Plus, Save, ShieldAlert, TestTube2, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank={name:'',subject_id:'',topic_id:'',score:'',max_score:'',test_date:'',difficulty:'medium',notes:''}
const questionBlank={question_number:'',question_text:'',user_answer:'',correct_answer:'',points_earned:'',points_possible:''}

function percentage(test){
  if(test.score==null||test.max_score==null||Number(test.max_score)<=0)return null
  return Math.round((Number(test.score)/Number(test.max_score))*1000)/10
}

function questionCorrect(q){
  return q.points_earned!=null&&q.points_possible!=null&&Number(q.points_earned)>=Number(q.points_possible)
}

export default function TestsPage(){
  const [tests,setTests]=useState([])
  const [subjects,setSubjects]=useState([])
  const [topics,setTopics]=useState([])
  const [creating,setCreating]=useState(false)
  const [editingId,setEditingId]=useState(null)
  const [form,setForm]=useState(blank)
  const [questionForms,setQuestionForms]=useState({})
  const [editingQuestionId,setEditingQuestionId]=useState(null)
  const [expanded,setExpanded]=useState({})
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true);setError('')
    const [testsResult,subjectsResult,topicsResult]=await Promise.all([
      supabase.from('tests').select('id,name,subject_id,topic_id,score,max_score,test_date,difficulty,notes,created_at,test_questions(id,question_number,question_text,user_answer,correct_answer,points_earned,points_possible)').order('test_date',{ascending:false}).order('created_at',{ascending:false}),
      supabase.from('subjects').select('id,name').order('name'),
      supabase.from('topics').select('id,name,subject_id').order('name'),
    ])
    const first=[testsResult,subjectsResult,topicsResult].map(r=>r.error).find(Boolean)
    if(first)setError(first.message)
    else{
      setTests((testsResult.data||[]).map(t=>({...t,test_questions:(t.test_questions||[]).sort((a,b)=>a.question_number-b.question_number)})))
      setSubjects(subjectsResult.data||[]);setTopics(topicsResult.data||[])
    }
    setLoading(false)
  }
  useEffect(()=>{refresh()},[])

  function startCreate(){setEditingId(null);setForm({...blank,test_date:new Date().toISOString().slice(0,10)});setCreating(true);setError('')}
  function startEdit(test){setEditingId(test.id);setForm({name:test.name,subject_id:test.subject_id||'',topic_id:test.topic_id||'',score:test.score??'',max_score:test.max_score??'',test_date:test.test_date||'',difficulty:test.difficulty||'medium',notes:test.notes||''});setCreating(true);setError('')}
  function cancel(){setCreating(false);setEditingId(null);setForm(blank)}

  async function saveTest(event){
    event.preventDefault();if(!form.name.trim())return
    if(form.score!==''&&form.max_score!==''&&Number(form.score)>Number(form.max_score)){setError('Score cannot be greater than max score.');return}
    setSaving(true);setError('')
    const payload={name:form.name.trim(),subject_id:form.subject_id||null,topic_id:form.topic_id||null,score:form.score===''?null:Number(form.score),max_score:form.max_score===''?null:Number(form.max_score),test_date:form.test_date||new Date().toISOString().slice(0,10),difficulty:form.difficulty,notes:form.notes.trim()||null}
    const result=editingId?await supabase.from('tests').update(payload).eq('id',editingId):await supabase.from('tests').insert(payload)
    if(result.error)setError(result.error.message)
    else{cancel();await refresh();window.dispatchEvent(new Event('jel-record-created'))}
    setSaving(false)
  }

  async function remove(id){if(!window.confirm('Delete this test and all of its questions?'))return;const result=await supabase.from('tests').delete().eq('id',id);if(result.error)setError(result.error.message);else await refresh()}

  function openQuestion(testId){
    const test=tests.find(t=>t.id===testId)
    const next=(test?.test_questions?.length||0)+1
    setEditingQuestionId(null)
    setQuestionForms(p=>({...p,[testId]:{...questionBlank,question_number:String(next)}}))
  }

  function editQuestion(testId,q){
    setEditingQuestionId(q.id)
    setQuestionForms(p=>({...p,[testId]:{question_number:String(q.question_number),question_text:q.question_text||'',user_answer:q.user_answer||'',correct_answer:q.correct_answer||'',points_earned:q.points_earned??'',points_possible:q.points_possible??''}}))
  }

  function cancelQuestion(testId){
    setEditingQuestionId(null)
    setQuestionForms(p=>{const n={...p};delete n[testId];return n})
  }

  async function saveQuestion(testId){
    const formQ=questionForms[testId];if(!formQ?.question_number)return
    setSaving(true);setError('')
    const payload={test_id:testId,question_number:Number(formQ.question_number),question_text:formQ.question_text.trim()||null,user_answer:formQ.user_answer.trim()||null,correct_answer:formQ.correct_answer.trim()||null,points_earned:formQ.points_earned===''?null:Number(formQ.points_earned),points_possible:formQ.points_possible===''?null:Number(formQ.points_possible)}
    const result=editingQuestionId
      ? await supabase.from('test_questions').update(payload).eq('id',editingQuestionId)
      : await supabase.from('test_questions').insert(payload)
    if(result.error)setError(result.error.message)
    else{cancelQuestion(testId);await refresh()}
    setSaving(false)
  }

  async function removeQuestion(id){const result=await supabase.from('test_questions').delete().eq('id',id);if(result.error)setError(result.error.message);else await refresh()}

  async function recalculateScore(test){
    const scored=(test.test_questions||[]).filter(q=>q.points_earned!=null&&q.points_possible!=null&&Number(q.points_possible)>0)
    if(!scored.length){setError('Add earned and possible points to at least one question before recalculating.');return}
    setSaving(true);setError('')
    const score=scored.reduce((sum,q)=>sum+Number(q.points_earned),0)
    const max=scored.reduce((sum,q)=>sum+Number(q.points_possible),0)
    const result=await supabase.from('tests').update({score,max_score:max}).eq('id',test.id)
    if(result.error)setError(result.error.message);else await refresh()
    setSaving(false)
  }

  async function createMistakeFromQuestion(test,q){
    setSaving(true);setError('')
    const result=await supabase.from('mistakes').insert({
      subject_id:test.subject_id||null,
      topic_id:test.topic_id||null,
      question:q.question_text||('Question '+q.question_number),
      user_answer:q.user_answer||null,
      correct_answer:q.correct_answer||null,
      what_went_wrong:'Logged from '+test.name+' · Question '+q.question_number,
      explanation:'Review this question and record the concept or reasoning that needs improvement.',
      severity:'medium',
      resolved:false
    })
    if(result.error)setError(result.error.message);else window.dispatchEvent(new Event('jel-record-created'))
    setSaving(false)
  }

  const average=useMemo(()=>{
    const scored=tests.map(percentage).filter(v=>v!=null)
    return scored.length?Math.round(scored.reduce((a,b)=>a+b,0)/scored.length*10)/10:null
  },[tests])

  const filteredTopics=topics.filter(t=>!form.subject_id||t.subject_id===form.subject_id)

  function subjectName(id){return subjects.find(s=>s.id===id)?.name||''}
  function topicName(id){return topics.find(t=>t.id===id)?.name||''}

  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><TestTube2 size={28}/></div>
      <div><p className="eyebrow">ASSESSMENT SYSTEM</p><h1>Tests</h1><p>Store real assessment results and question-level evidence so averages and mistakes can be analyzed later.</p></div>
      <button className="primary module-action" onClick={startCreate}><Plus size={17}/> NEW TEST</button>
    </section>
    {error&&<div className="data-error">{error}</div>}

    {creating&&<form className="panel record-form test-form" onSubmit={saveTest}>
      <div className="record-form-head"><div><p className="eyebrow">{editingId?'EDIT TEST':'CREATE TEST'}</p><h2>{editingId?'Edit Test':'New Test Result'}</h2></div><button type="button" className="ghost" onClick={cancel}><X size={14}/> CANCEL</button></div>
      <label><span>Name</span><input required autoFocus value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Series & Parallel Circuits Quiz"/></label>
      <label><span>Subject</span><select value={form.subject_id} onChange={e=>setForm(p=>({...p,subject_id:e.target.value,topic_id:''}))}><option value="">General</option>{subjects.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
      <label><span>Topic</span><select value={form.topic_id} onChange={e=>setForm(p=>({...p,topic_id:e.target.value}))}><option value="">No topic</option>{filteredTopics.map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
      <label><span>Score</span><input type="number" min="0" step="any" value={form.score} onChange={e=>setForm(p=>({...p,score:e.target.value}))} placeholder="18"/></label>
      <label><span>Max Score</span><input type="number" min="0.01" step="any" value={form.max_score} onChange={e=>setForm(p=>({...p,max_score:e.target.value}))} placeholder="20"/></label>
      <label><span>Date</span><input type="date" value={form.test_date} onChange={e=>setForm(p=>({...p,test_date:e.target.value}))}/></label>
      <label><span>Difficulty</span><select value={form.difficulty} onChange={e=>setForm(p=>({...p,difficulty:e.target.value}))}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
      <label className="wide"><span>Notes</span><textarea rows="3" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Topics missed, observations, retake notes..."/></label>
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:editingId?<Save size={15}/>:<Plus size={15}/>} {saving?'SAVING...':editingId?'UPDATE TEST':'SAVE TEST'}</button>
    </form>}

    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your tests...</span></div>:tests.length===0?<div className="panel data-state"><TestTube2 size={36}/><h2>No tests yet.</h2><p>Add an assessment result. You can then track individual questions.</p><button className="primary" onClick={startCreate}><Plus size={16}/> CREATE FIRST TEST</button></div>:
      <div className="record-list">
        <div className="panel study-summary"><div><span>TEST AVERAGE</span><strong>{average==null?'—':average+'%'}</strong></div><div><span>ASSESSMENTS</span><strong>{tests.length}</strong></div></div>
        {tests.map(test=>{
          const pct=percentage(test);const open=expanded[test.id]!==false;const qForm=questionForms[test.id]
          return <article className="panel record-card" key={test.id}>
            <div className="record-card-head">
              <div><p className="eyebrow">ASSESSMENT</p><h2>{test.name}</h2><div className="record-meta">{test.subject_id&&<span>{subjectName(test.subject_id)}</span>}{test.topic_id&&<span>{topicName(test.topic_id)}</span>}<span>{test.test_date}</span></div></div>
              <div className="record-actions">{test.test_questions?.some(q=>q.points_earned!=null&&q.points_possible!=null)?<button className="ghost compact-button" title="Recalculate score from question points" onClick={()=>recalculateScore(test)}>RECALC</button>:null}<button className="icon-btn" title="Edit test" onClick={()=>startEdit(test)}><Pencil size={14}/></button><button className="icon-btn danger-btn" onClick={()=>remove(test.id)}><Trash2 size={14}/></button></div>
            </div>
            <div className="metric-row">{pct==null?<span className="metric-muted">No score entered</span>:<><strong>{pct}%</strong><span>{test.score}/{test.max_score}</span><CheckCircle2 size={16}/></>}<span className="tag">{test.difficulty}</span><span>{test.test_questions?.length||0} questions</span></div>
            {test.notes&&<p className="record-content">{test.notes}</p>}
            <button className="secondary full section-toggle" onClick={()=>setExpanded(p=>({...p,[test.id]:!open}))}>{open?<ChevronDown size={14}/>:<ChevronRight size={14}/>} {open?'HIDE':'SHOW'} QUESTION BREAKDOWN</button>
            {open&&<div className="question-section">
              {(test.test_questions||[]).map(q=><div className="question-row" key={q.id}><div><b>Q{q.question_number}</b><span>{q.question_text||'Question'}</span>{q.user_answer&&<small>Your answer: {q.user_answer}</small>}{q.correct_answer&&<small>Correct: {q.correct_answer}</small>}</div><span>{q.points_earned!=null&&q.points_possible!=null?q.points_earned+'/'+q.points_possible:(questionCorrect(q)?'✓':'—')}</span><div className="question-actions"><button className="icon-btn" title="Edit question" onClick={()=>editQuestion(test.id,q)}><Pencil size={12}/></button>{q.points_earned!=null&&q.points_possible!=null&&Number(q.points_earned)<Number(q.points_possible)?<button className="icon-btn" title="Log as mistake" onClick={()=>createMistakeFromQuestion(test,q)}><ShieldAlert size={12}/></button>:null}<button className="icon-btn danger-btn" title="Delete question" onClick={()=>removeQuestion(q.id)}><Trash2 size={12}/></button></div></div>)}
              {qForm?<div className="question-form"><label><span>#</span><input type="number" min="1" value={qForm.question_number} onChange={e=>setQuestionForms(p=>({...p,[test.id]:{...p[test.id],question_number:e.target.value}}))}/></label><label><span>Question</span><textarea rows="2" value={qForm.question_text} onChange={e=>setQuestionForms(p=>({...p,[test.id]:{...p[test.id],question_text:e.target.value}}))}/></label><label><span>Your Answer</span><input value={qForm.user_answer} onChange={e=>setQuestionForms(p=>({...p,[test.id]:{...p[test.id],user_answer:e.target.value}}))}/></label><label><span>Correct Answer</span><input value={qForm.correct_answer} onChange={e=>setQuestionForms(p=>({...p,[test.id]:{...p[test.id],correct_answer:e.target.value}}))}/></label><label><span>Earned</span><input type="number" min="0" step="any" value={qForm.points_earned} onChange={e=>setQuestionForms(p=>({...p,[test.id]:{...p[test.id],points_earned:e.target.value}}))}/></label><label><span>Possible</span><input type="number" min="0" step="any" value={qForm.points_possible} onChange={e=>setQuestionForms(p=>({...p,[test.id]:{...p[test.id],points_possible:e.target.value}}))}/></label><div><button className="primary" onClick={()=>saveQuestion(test.id)} disabled={saving}><Save size={14}/> {editingQuestionId?'UPDATE':'SAVE'} QUESTION</button><button className="ghost" onClick={()=>cancelQuestion(test.id)}>CANCEL</button></div></div>:<button className="secondary add-task-button" onClick={()=>openQuestion(test.id)}><Plus size={14}/> ADD QUESTION</button>}
            </div>}
          </article>
        })}
      </div>}
  </div>
}
