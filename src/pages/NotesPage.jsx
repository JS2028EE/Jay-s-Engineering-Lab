import { useEffect, useState } from 'react'
import { BookOpen, Loader2, NotebookPen, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank = { title: '', content: '' }

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    const result = await supabase.from('notes').select('id,title,content,created_at,updated_at').order('updated_at', { ascending: false })
    if (result.error) setError(result.error.message)
    else setNotes(result.data || [])
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  function openCreate() {
    setForm(blank)
    setCreating(true)
    setError('')
  }

  async function save(event) {
    event.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    setError('')
    const result = await supabase.from('notes').insert({
      title: form.title.trim(),
      content: form.content.trim(),
    })
    if (result.error) setError(result.error.message)
    else {
      setCreating(false)
      setForm(blank)
      await refresh()
      window.dispatchEvent(new Event('jel-record-created'))
    }
    setSaving(false)
  }

  async function remove(id) {
    if (!window.confirm('Delete this note?')) return
    const result = await supabase.from('notes').delete().eq('id', id)
    if (result.error) setError(result.error.message)
    else await refresh()
  }

  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><NotebookPen size={28}/></div>
      <div><p className="eyebrow">ENGINEERING KNOWLEDGE SYSTEM</p><h1>Notes</h1><p>Keep the real engineering notebook: explanations, calculations, observations, and ideas.</p></div>
      <button className="primary module-action" onClick={openCreate}><Plus size={17}/> NEW NOTE</button>
    </section>
    {error && <div className="data-error">{error}</div>}
    {creating && <form className="panel record-form notes-form" onSubmit={save}>
      <div className="record-form-head"><div><p className="eyebrow">CREATE NOTE</p><h2>New Engineering Note</h2></div><button type="button" className="ghost" onClick={() => setCreating(false)}>CANCEL</button></div>
      <label><span>Title</span><input required autoFocus value={form.title} onChange={e => setForm(p => ({...p,title:e.target.value}))} placeholder="e.g. Kirchhoff's Current Law"/></label>
      <label className="wide"><span>Content</span><textarea required rows="9" value={form.content} onChange={e => setForm(p => ({...p,content:e.target.value}))} placeholder="Write your engineering notes, equations, observations, or explanation..." /></label>
      <button className="primary" disabled={saving}>{saving ? <Loader2 className="spin" size={15}/> : <Plus size={15}/>} {saving ? 'SAVING...' : 'SAVE NOTE'}</button>
    </form>}
    {loading ? <div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your notes...</span></div> : notes.length === 0 ? <div className="panel data-state"><NotebookPen size={36}/><h2>No notes yet.</h2><p>Create your first engineering note. It will be stored in your cloud database.</p><button className="primary" onClick={openCreate}><Plus size={16}/> CREATE FIRST NOTE</button></div> :
      <div className="record-list">{notes.map(note => <article className="panel record-card" key={note.id}><div className="record-card-head"><div><p className="eyebrow">ENGINEERING NOTE</p><h2>{note.title}</h2></div><button className="icon-btn danger-btn" onClick={() => remove(note.id)} title="Delete note"><Trash2 size={14}/></button></div><p className="record-content">{note.content}</p><div className="record-meta"><span><BookOpen size={12}/> {new Date(note.updated_at).toLocaleString()}</span></div></article>)}</div>}
  </div>
}
