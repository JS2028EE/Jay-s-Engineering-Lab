import { useEffect, useState } from 'react'
import { CircuitBoard, Loader2, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank = { name:'', equations:'', calculations:'', expected_result:'', measured_result:'', simulation_result:'', final_answer:'', explanation:'' }

export default function CircuitsPage() {
  const [circuits,setCircuits]=useState([])
  const [creating,setCreating]=useState(false)
  const [form,setForm]=useState(blank)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh() {
    setLoading(true)
    const result=await supabase.from('circuits').select('id,name,equations,calculations,expected_result,measured_result,simulation_result,final_answer,explanation,created_at').order('created_at',{ascending:false})
    if(result.error) setError(result.error.message)
    else setCircuits(result.data||[])
    setLoading(false)
  }

  useEffect(()=>{refresh()},[])

  function openCreate(){setForm(blank);setCreating(true);setError('')}

  async function save(event){
    event.preventDefault()
    if(!form.name.trim()) return
    setSaving(true)
    const payload={name:form.name.trim(),equations:form.equations.trim()||null,calculations:form.calculations.trim()||null,expected_result:form.expected_result.trim()||null,measured_result:form.measured_result.trim()||null,simulation_result:form.simulation_result.trim()||null,final_answer:form.final_answer.trim()||null,explanation:form.explanation.trim()||null}
    const result=await supabase.from('circuits').insert(payload)
    if(result.error) setError(result.error.message)
    else {setCreating(false);setForm(blank);await refresh();window.dispatchEvent(new Event('jel-record-created'))}
    setSaving(false)
  }

  async function remove(id){
    if(!window.confirm('Delete this circuit record?')) return
    const result=await supabase.from('circuits').delete().eq('id',id)
    if(result.error) setError(result.error.message)
    else await refresh()
  }

  const field=(key,label,placeholder,rows=3)=><label className={key==='explanation'?'wide':''}><span>{label}</span><textarea rows={rows} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={placeholder}/></label>

  return <div className="content">
    <section className="module-hero"><div className="module-icon"><CircuitBoard size={28}/></div><div><p className="eyebrow">CIRCUIT LIBRARY</p><h1>Circuits</h1><p>Store solved circuits with the equations, calculations, expected measurements, and final answer.</p></div><button className="primary module-action" onClick={openCreate}><Plus size={17}/> NEW CIRCUIT</button></section>
    {error&&<div className="data-error">{error}</div>}
    {creating&&<form className="panel record-form circuit-form" onSubmit={save}><div className="record-form-head"><div><p className="eyebrow">CREATE CIRCUIT</p><h2>New Solved Circuit</h2></div><button type="button" className="ghost" onClick={()=>setCreating(false)}>CANCEL</button></div>
      <label><span>Circuit Name</span><input required autoFocus value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. LED Current Limiting Circuit"/></label>
      {field('equations','Equations','V = IR, KCL, KVL, transfer function...')}
      {field('calculations','Calculations','Show your work and substitutions...')}
      {field('expected_result','Expected Result','What should the circuit produce?')}
      {field('measured_result','Measured Result','What did your real hardware measure?')}
      {field('simulation_result','Simulation Result','What did your simulator produce?')}
      {field('final_answer','Final Answer','Final voltage/current/value...')}
      {field('explanation','Explanation','Explain the circuit and what you learned...',5)}
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:<Plus size={15}/>} {saving?'SAVING...':'SAVE CIRCUIT'}</button>
    </form>}
    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your circuits...</span></div>:circuits.length===0?<div className="panel data-state"><CircuitBoard size={36}/><h2>No circuits yet.</h2><p>Save your first solved circuit so the Lab can build a real circuit history.</p><button className="primary" onClick={openCreate}><Plus size={16}/> CREATE FIRST CIRCUIT</button></div>:
      <div className="record-list">{circuits.map(c=><article className="panel record-card" key={c.id}><div className="record-card-head"><div><p className="eyebrow">SOLVED CIRCUIT</p><h2>{c.name}</h2></div><button className="icon-btn danger-btn" onClick={()=>remove(c.id)}><Trash2 size={14}/></button></div>{c.final_answer&&<div className="answer-box"><span>FINAL ANSWER</span><strong>{c.final_answer}</strong></div>}<div className="detail-grid">{c.equations&&<div><span>Equations</span><p>{c.equations}</p></div>}{c.calculations&&<div><span>Calculations</span><p>{c.calculations}</p></div>}{c.expected_result&&<div><span>Expected</span><p>{c.expected_result}</p></div>}{c.measured_result&&<div><span>Measured</span><p>{c.measured_result}</p></div>}{c.simulation_result&&<div><span>Simulation</span><p>{c.simulation_result}</p></div>}{c.explanation&&<div className="wide"><span>Explanation</span><p>{c.explanation}</p></div>}</div></article>)}</div>}
  </div>
}
