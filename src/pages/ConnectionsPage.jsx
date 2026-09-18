import { useEffect, useMemo, useState } from 'react'
import { GitBranch, Loader2, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const relationTypes=['related_to','explained_by','appears_in','caused','uses','tested_by','built_with','derived_from','supports','documents']

function typeLabel(type){return type.charAt(0).toUpperCase()+type.slice(1)}
function entityKey(type,id){return type+':'+id}

export default function ConnectionsPage(){
  const [entities,setEntities]=useState({})
  const [relationships,setRelationships]=useState([])
  const [form,setForm]=useState({source_type:'subject',source_id:'',relationship_type:'related_to',target_type:'note',target_id:''})
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true);setError('')
    const [subjects,lessons,notes,tests,circuits,components,projects,mistakes,relations]=await Promise.all([
      supabase.from('subjects').select('id,name').order('name'),
      supabase.from('lessons').select('id,name').order('name'),
      supabase.from('notes').select('id,title').order('title'),
      supabase.from('tests').select('id,name').order('name'),
      supabase.from('circuits').select('id,name').order('name'),
      supabase.from('components').select('id,name').order('name'),
      supabase.from('projects').select('id,name').order('name'),
      supabase.from('mistakes').select('id,question').order('created_at',{ascending:false}),
      supabase.from('relationships').select('id,source_type,source_id,relationship_type,target_type,target_id,created_at').order('created_at',{ascending:false}),
    ])
    const first=[subjects,lessons,notes,tests,circuits,components,projects,mistakes,relations].map(r=>r.error).find(Boolean)
    if(first)setError(first.message)
    else{
      setEntities({
        subject:subjects.data||[],
        lesson:lessons.data||[],
        note:notes.data||[],
        test:tests.data||[],
        circuit:circuits.data||[],
        component:components.data||[],
        project:projects.data||[],
        mistake:mistakes.data||[],
      })
      setRelationships(relations.data||[])
    }
    setLoading(false)
  }
  useEffect(()=>{refresh()},[])

  const sourceOptions=entities[form.source_type]||[]
  const targetOptions=entities[form.target_type]||[]

  function entityName(type,id){
    const item=(entities[type]||[]).find(x=>x.id===id)
    return item?.name||item?.title||item?.question?.slice(0,80)||'Unknown record'
  }

  async function save(event){
    event.preventDefault()
    if(!form.source_id||!form.target_id)return
    if(entityKey(form.source_type,form.source_id)===entityKey(form.target_type,form.target_id)){setError('Source and target must be different records.');return}
    setSaving(true);setError('')
    const result=await supabase.from('relationships').insert({
      source_type:form.source_type,
      source_id:form.source_id,
      relationship_type:form.relationship_type,
      target_type:form.target_type,
      target_id:form.target_id,
    })
    if(result.error)setError(result.error.message)
    else{setForm(p=>({...p,source_id:'',target_id:''}));await refresh();window.dispatchEvent(new Event('jel-record-created'))}
    setSaving(false)
  }

  async function remove(id){
    if(!window.confirm('Delete this relationship?'))return
    const result=await supabase.from('relationships').delete().eq('id',id)
    if(result.error)setError(result.error.message);else await refresh()
  }

  const count=useMemo(()=>relationships.length,[relationships])

  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><GitBranch size={28}/></div>
      <div><p className="eyebrow">ENGINEERING KNOWLEDGE GRAPH</p><h1>Connections</h1><p>Link records explicitly so your engineering history can be explored as one connected system.</p></div>
      <span className="module-stat">{count} links</span>
    </section>
    {error&&<div className="data-error">{error}</div>}

    <form className="panel relationship-form" onSubmit={save}>
      <div className="record-form-head"><div><p className="eyebrow">CREATE RELATIONSHIP</p><h2>Connect Two Records</h2></div></div>
      <label><span>Source Type</span><select value={form.source_type} onChange={e=>setForm(p=>({...p,source_type:e.target.value,source_id:''}))}>{Object.keys(entities).map(t=><option value={t} key={t}>{typeLabel(t)}</option>)}</select></label>
      <label><span>Source Record</span><select required value={form.source_id} onChange={e=>setForm(p=>({...p,source_id:e.target.value}))}><option value="">Choose record</option>{sourceOptions.map(x=><option value={x.id} key={x.id}>{x.name||x.title||x.question?.slice(0,70)}</option>)}</select></label>
      <label><span>Relationship</span><select value={form.relationship_type} onChange={e=>setForm(p=>({...p,relationship_type:e.target.value}))}>{relationTypes.map(t=><option value={t} key={t}>{t}</option>)}</select></label>
      <label><span>Target Type</span><select value={form.target_type} onChange={e=>setForm(p=>({...p,target_type:e.target.value,target_id:''}))}>{Object.keys(entities).map(t=><option value={t} key={t}>{typeLabel(t)}</option>)}</select></label>
      <label className="wide"><span>Target Record</span><select required value={form.target_id} onChange={e=>setForm(p=>({...p,target_id:e.target.value}))}><option value="">Choose record</option>{targetOptions.map(x=><option value={x.id} key={x.id}>{x.name||x.title||x.question?.slice(0,70)}</option>)}</select></label>
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:<Plus size={15}/>} {saving?'LINKING...':'CREATE CONNECTION'}</button>
    </form>

    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading relationship graph...</span></div>:relationships.length===0?<div className="panel data-state"><GitBranch size={36}/><h2>No connections yet.</h2><p>Once you connect records, this workspace becomes the bridge between your curriculum, notes, tests, circuits, projects, components, and mistakes.</p></div>:
      <div className="record-list">{relationships.map(r=><article className="panel relationship-card" key={r.id}><div><p className="eyebrow">RELATIONSHIP</p><div className="relationship-line"><span className="tag">{r.source_type}</span><b>{entityName(r.source_type,r.source_id)}</b><strong>→ {r.relationship_type} →</strong><span className="tag">{r.target_type}</span><b>{entityName(r.target_type,r.target_id)}</b></div><small>{new Date(r.created_at).toLocaleString()}</small></div><button className="icon-btn danger-btn" onClick={()=>remove(r.id)}><Trash2 size={14}/></button></article>)}</div>}
  </div>
}
