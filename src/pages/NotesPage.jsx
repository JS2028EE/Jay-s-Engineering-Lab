import { useEffect, useState } from 'react'
import { BookOpen, Loader2, NotebookPen, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank={title:'',content:'',subject_id:'',topic_id:''}

export default function NotesPage(){
  const [notes,setNotes]=useState([])
  const [subjects,setSubjects]=useState([])
  const [topics,setTopics]=useState([])
  const [creating,setCreating]=useState(false)
  const [editingId,setEditingId]=useState(null)
  const [form,setForm]=useState(blank)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true)
    const [notesResult,subjectsResult,topicsResult]=await Promise.all([
      supabase.from('notes').select('id,title,content,subject_id,topic_id,created_at,updated_at').order('updated_at',{ascending:false}),
      supabase.from('subjects').select('id,name').order('name'),
      supabase.from('topics').select('id,name,subject_id').order('name'),
    ])
    const first=[notesResult,subjectsResult,topicsResult].map(r=>r.error).find(Boolean)
    if(first)setError(first.message)
    else{setNotes(notesResult.data||[]);setSubjects(subjectsResult.data||[]);setTopics(topicsResult.data||[])}
    setLoading(false)
  }
  useEffect(()=>{refresh()},[])

  function startCreate(){setEditingId(null);setForm(blank);setCreating(true);setError('')}
  function startEdit(note){setEditingId(note.id);setForm({title:note.title,content:note.content||'',subject_id:note.subject_id||'',topic_id:note.topic_id||''});setCreating(true);setError('')}
  function cancel(){setCreating(false);setEditingId(null);setForm(blank)}

  async function save(event){
    event.preventDefault()
    if(!form.title.trim())return
    setSaving(true);setError('')
    const payload={title:form.title.trim(),content:form.content.trim(),subject_id:form.subject_id||null,topic_id:form.topic_id||null}
    const result=editingId
      ? await supabase.from('notes').update(payload).eq('id',editingId)
      : await supabase.from('notes').insert(payload)
    if(result.error)setError(result.error.message)
    else{cancel();await refresh();window.dispatchEvent(new Event('jel-record-created'))}
    setSaving(false)
  }

  async function remove(id){
    if(!window.confirm('Delete this note?'))return
    const result=await supabase.from('notes').delete().eq('id',id)
    if(result.error)setError(result.error.message);else await refresh()
  }

  const filteredTopics=topics.filter(t=>!form.subject_id||t.subject_id===form.subject_id)
  function subjectName(id){return subjects.find(s=>s.id===id)?.name||''}
  function topicName(id){return topics.find(t=>t.id===id)?.name||''}

  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><NotebookPen size={28}/></div>
      <div><p className="eyebrow">ENGINEERING KNOWLEDGE SYSTEM</p><h1>Notes</h1><p>Keep explanations, calculations, observations, code snippets, and engineering ideas in a searchable cloud notebook.</p></div>
      <button className="primary module-action" onClick={startCreate}><Plus size={17}/> NEW NOTE</button>
    </section>
    {error&&<div className="data-error">{error}</div>}
    {creating&&<form className="panel record-form notes-form" onSubmit={save}>
      <div className="record-form-head"><div><p className="eyebrow">{editingId?'EDIT NOTE':'CREATE NOTE'}</p><h2>{editingId?'Edit Engineering Note':'New Engineering Note'}</h2></div><button type="button" className="ghost" onClick={cancel}><X size={14}/> CANCEL</button></div>
      <label><span>Title</span><input required autoFocus value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Kirchhoff's Current Law"/></label>
      <label><span>Subject</span><select value={form.subject_id} onChange={e=>setForm(p=>({...p,subject_id:e.target.value,topic_id:''}))}><option value="">General</option>{subjects.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
      <label><span>Topic</span><select value={form.topic_id} onChange={e=>setForm(p=>({...p,topic_id:e.target.value}))}><option value="">No topic</option>{filteredTopics.map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
      <label className="wide"><span>Content</span><textarea required rows="10" value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} placeholder="Write equations, explanations, observations, code, or study notes..."/></label>
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:editingId?<Save size={15}/>:<Plus size={15}/>} {saving?'SAVING...':editingId?'UPDATE NOTE':'SAVE NOTE'}</button>
    </form>}
    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your notes...</span></div>:notes.length===0?<div className="panel data-state"><NotebookPen size={36}/><h2>No notes yet.</h2><p>Create your first engineering note. It will be stored in your cloud database.</p><button className="primary" onClick={startCreate}><Plus size={16}/> CREATE FIRST NOTE</button></div>:
      <div className="record-list">{notes.map(note=><article className="panel record-card" key={note.id}>
        <div className="record-card-head"><div><p className="eyebrow">ENGINEERING NOTE</p><h2>{note.title}</h2></div><div className="record-actions"><button className="icon-btn" title="Edit note" onClick={()=>startEdit(note)}><Pencil size={14}/></button><button className="icon-btn danger-btn" title="Delete note" onClick={()=>remove(note.id)}><Trash2 size={14}/></button></div></div>
        <div className="record-meta">{note.subject_id&&<span>{subjectName(note.subject_id)}</span>}{note.topic_id&&<span>{topicName(note.topic_id)}</span>}<span><BookOpen size={12}/> {new Date(note.updated_at).toLocaleString()}</span></div>
        <p className="record-content">{note.content}</p>
      </article>)}</div>}
  </div>
}
