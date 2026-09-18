import { useEffect, useState } from 'react'
import { CircuitBoard, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank={name:'',subject_id:'',topic_id:'',equations:'',calculations:'',expected_result:'',measured_result:'',simulation_result:'',final_answer:'',explanation:''}

export default function CircuitsPage(){
  const [circuits,setCircuits]=useState([])
  const [components,setComponents]=useState([])
  const [subjects,setSubjects]=useState([])
  const [topics,setTopics]=useState([])
  const [creating,setCreating]=useState(false)
  const [editingId,setEditingId]=useState(null)
  const [form,setForm]=useState(blank)
  const [selectedParts,setSelectedParts]=useState([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true);setError('')
    const [circuitResult,componentResult,subjectResult,topicResult]=await Promise.all([
      supabase.from('circuits').select('id,name,subject_id,topic_id,equations,calculations,expected_result,measured_result,simulation_result,final_answer,explanation,created_at,circuit_components(component_id,quantity,components(id,name,value,type))').order('created_at',{ascending:false}),
      supabase.from('components').select('id,name,value,type,quantity').order('name'),
      supabase.from('subjects').select('id,name').order('name'),
      supabase.from('topics').select('id,name,subject_id').order('name'),
    ])
    const first=[circuitResult,componentResult,subjectResult,topicResult].map(r=>r.error).find(Boolean)
    if(first)setError(first.message)
    else{setCircuits(circuitResult.data||[]);setComponents(componentResult.data||[]);setSubjects(subjectResult.data||[]);setTopics(topicResult.data||[])}
    setLoading(false)
  }
  useEffect(()=>{refresh()},[])

  function startCreate(){setEditingId(null);setForm(blank);setSelectedParts([]);setCreating(true);setError('')}
  function startEdit(c){setEditingId(c.id);setForm({name:c.name||'',subject_id:c.subject_id||'',topic_id:c.topic_id||'',equations:c.equations||'',calculations:c.calculations||'',expected_result:c.expected_result||'',measured_result:c.measured_result||'',simulation_result:c.simulation_result||'',final_answer:c.final_answer||'',explanation:c.explanation||''});setSelectedParts((c.circuit_components||[]).map(x=>x.component_id+':'+x.quantity));setCreating(true);setError('')}
  function cancel(){setCreating(false);setEditingId(null);setForm(blank);setSelectedParts([])}

  async function save(event){
    event.preventDefault();if(!form.name.trim())return
    setSaving(true);setError('')
    const payload={name:form.name.trim(),subject_id:form.subject_id||null,topic_id:form.topic_id||null,equations:form.equations.trim()||null,calculations:form.calculations.trim()||null,expected_result:form.expected_result.trim()||null,measured_result:form.measured_result.trim()||null,simulation_result:form.simulation_result.trim()||null,final_answer:form.final_answer.trim()||null,explanation:form.explanation.trim()||null}
    const result=editingId?await supabase.from('circuits').update(payload).eq('id',editingId):await supabase.from('circuits').insert(payload).select('id').single()
    if(result.error){setError(result.error.message);setSaving(false);return}
    const circuitId=editingId||result.data.id
    const del=await supabase.from('circuit_components').delete().eq('circuit_id',circuitId)
    if(del.error){setError(del.error.message);setSaving(false);return}
    const rows=selectedParts.map(item=>{const [component_id,quantity]=item.split(':');return{circuit_id:circuitId,component_id,quantity:Math.max(1,Number(quantity)||1)}})
    if(rows.length){const link=await supabase.from('circuit_components').insert(rows);if(link.error){setError(link.error.message);setSaving(false);return}}
    cancel();await refresh();window.dispatchEvent(new Event('jel-record-created'));setSaving(false)
  }

  function togglePart(componentId){
    setSelectedParts(p=>{const current=p.findIndex(x=>x.startsWith(componentId+':'));if(current>=0){const n=[...p];n.splice(current,1);return n}return [...p,componentId+':1']})
  }
  function quantityFor(id){const row=selectedParts.find(x=>x.startsWith(id+':'));return row?row.split(':')[1]:'1'}
  function setQuantity(id,value){setSelectedParts(p=>p.map(x=>x.startsWith(id+':')?id+':'+value:x))}
  async function remove(id){if(!window.confirm('Delete this circuit record?'))return;const result=await supabase.from('circuits').delete().eq('id',id);if(result.error)setError(result.error.message);else await refresh()}

  function subjectName(id){return subjects.find(s=>s.id===id)?.name||''}
  function topicName(id){return topics.find(t=>t.id===id)?.name||''}
  const filteredTopics=topics.filter(t=>!form.subject_id||t.subject_id===form.subject_id)
  const field=(key,label,placeholder,rows=3)=><label className={key==='explanation'?'wide':''}><span>{label}</span><textarea rows={rows} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={placeholder}/></label>

  return <div className="content">
    <section className="module-hero"><div className="module-icon"><CircuitBoard size={28}/></div><div><p className="eyebrow">CIRCUIT LIBRARY</p><h1>Circuits</h1><p>Store solved circuits with equations, calculations, expected measurements, real measurements, and component relationships.</p></div><button className="primary module-action" onClick={startCreate}><Plus size={17}/> NEW CIRCUIT</button></section>
    {error&&<div className="data-error">{error}</div>}
    {creating&&<form className="panel record-form circuit-form" onSubmit={save}>
      <div className="record-form-head"><div><p className="eyebrow">{editingId?'EDIT CIRCUIT':'CREATE CIRCUIT'}</p><h2>{editingId?'Edit Solved Circuit':'New Solved Circuit'}</h2></div><button type="button" className="ghost" onClick={cancel}><X size={14}/> CANCEL</button></div>
      <label><span>Circuit Name</span><input required autoFocus value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. LED Current Limiting Circuit"/></label>
      <label><span>Subject</span><select value={form.subject_id} onChange={e=>setForm(p=>({...p,subject_id:e.target.value,topic_id:''}))}><option value="">General</option>{subjects.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
      <label><span>Topic</span><select value={form.topic_id} onChange={e=>setForm(p=>({...p,topic_id:e.target.value}))}><option value="">No topic</option>{filteredTopics.map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
      {field('equations','Equations','V = IR, KCL, KVL...')}
      {field('calculations','Calculations','Show substitutions and work...')}
      {field('expected_result','Expected Result','What should happen?')}
      {field('measured_result','Measured Result','What did your hardware measure?')}
      {field('simulation_result','Simulation Result','What did your simulator produce?')}
      {field('final_answer','Final Answer','Final voltage/current/value...')}
      {field('explanation','Explanation','What does this circuit do and what did you learn?',5)}
      <div className="wide component-picker"><div className="record-form-head"><div><p className="eyebrow">COMPONENTS USED</p><h3>Select parts from inventory</h3></div></div>{components.length===0?<span className="muted">Add components in the Components module first.</span>:<div className="picker-grid">{components.map(c=>{const selected=selectedParts.some(x=>x.startsWith(c.id+':'));return <div className={'picker-item '+(selected?'selected':'')} key={c.id}><button type="button" className="picker-main" onClick={()=>togglePart(c.id)}><span>{c.name}</span><small>{c.type||'component'}{c.value?' · '+c.value:''}</small></button>{selected&&<input type="number" min="1" value={quantityFor(c.id)} onChange={e=>setQuantity(c.id,e.target.value)}/>}</div>})}</div>}</div>
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:editingId?<Save size={15}/>:<Plus size={15}/>} {saving?'SAVING...':editingId?'UPDATE CIRCUIT':'SAVE CIRCUIT'}</button>
    </form>}
    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your circuits...</span></div>:circuits.length===0?<div className="panel data-state"><CircuitBoard size={36}/><h2>No circuits yet.</h2><p>Save your first solved circuit and link the real components you used.</p><button className="primary" onClick={startCreate}><Plus size={16}/> CREATE FIRST CIRCUIT</button></div>:
      <div className="record-list">{circuits.map(c=><article className="panel record-card" key={c.id}>
        <div className="record-card-head"><div><p className="eyebrow">SOLVED CIRCUIT</p><h2>{c.name}</h2><div className="record-meta">{c.subject_id&&<span>{subjectName(c.subject_id)}</span>}{c.topic_id&&<span>{topicName(c.topic_id)}</span>}</div></div><div className="record-actions"><button className="icon-btn" title="Edit circuit" onClick={()=>startEdit(c)}><Pencil size={14}/></button><button className="icon-btn danger-btn" onClick={()=>remove(c.id)}><Trash2 size={14}/></button></div></div>
        {c.final_answer&&<div className="answer-box"><span>FINAL ANSWER</span><strong>{c.final_answer}</strong></div>}
        {(c.circuit_components||[]).length>0&&<div className="component-chip-list"><span className="eyebrow">PARTS USED</span>{c.circuit_components.map(link=><span className="tag" key={link.component_id}>{link.components?.name||'Component'} × {link.quantity}</span>)}</div>}
        <div className="detail-grid">{c.equations&&<div><span>Equations</span><p>{c.equations}</p></div>}{c.calculations&&<div><span>Calculations</span><p>{c.calculations}</p></div>}{c.expected_result&&<div><span>Expected</span><p>{c.expected_result}</p></div>}{c.measured_result&&<div><span>Measured</span><p>{c.measured_result}</p></div>}{c.simulation_result&&<div><span>Simulation</span><p>{c.simulation_result}</p></div>}{c.explanation&&<div className="wide"><span>Explanation</span><p>{c.explanation}</p></div>}</div>
      </article>)}</div>}
  </div>
}
