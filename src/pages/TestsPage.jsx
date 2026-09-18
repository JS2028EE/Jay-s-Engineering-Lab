import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Plus, TestTube2, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank = { name: '', score: '', max_score: '', test_date: '', difficulty: 'medium', notes: '' }

function percentage(test) {
  if (test.score == null || test.max_score == null || Number(test.max_score) <= 0) return null
  return Math.round((Number(test.score) / Number(test.max_score)) * 1000) / 10
}

export default function TestsPage() {
  const [tests, setTests] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    const result = await supabase.from('tests').select('id,name,score,max_score,test_date,difficulty,notes,created_at').order('test_date', { ascending: false }).order('created_at', { ascending: false })
    if (result.error) setError(result.error.message)
    else setTests(result.data || [])
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  function openCreate() {
    setForm({...blank, test_date:new Date().toISOString().slice(0,10)})
    setCreating(true)
    setError('')
  }

  async function save(event) {
    event.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const result = await supabase.from('tests').insert({
      name: form.name.trim(),
      score: form.score === '' ? null : Number(form.score),
      max_score: form.max_score === '' ? null : Number(form.max_score),
      test_date: form.test_date || new Date().toISOString().slice(0,10),
      difficulty: form.difficulty,
      notes: form.notes.trim() || null,
    })
    if (result.error) setError(result.error.message)
    else {
      setCreating(false)
      await refresh()
      window.dispatchEvent(new Event('jel-record-created'))
    }
    setSaving(false)
  }

  async function remove(id) {
    if (!window.confirm('Delete this test?')) return
    const result = await supabase.from('tests').delete().eq('id', id)
    if (result.error) setError(result.error.message)
    else await refresh()
  }

  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><TestTube2 size={28}/></div>
      <div><p className="eyebrow">ASSESSMENT SYSTEM</p><h1>Tests</h1><p>Record real scores and let the Lab calculate percentages and averages from the data.</p></div>
      <button className="primary module-action" onClick={openCreate}><Plus size={17}/> NEW TEST</button>
    </section>
    {error && <div className="data-error">{error}</div>}
    {creating && <form className="panel record-form test-form" onSubmit={save}>
      <div className="record-form-head"><div><p className="eyebrow">CREATE TEST</p><h2>New Test Result</h2></div><button type="button" className="ghost" onClick={() => setCreating(false)}>CANCEL</button></div>
      <label><span>Name</span><input required autoFocus value={form.name} onChange={e => setForm(p => ({...p,name:e.target.value}))} placeholder="e.g. Series & Parallel Circuits Quiz"/></label>
      <label><span>Score</span><input type="number" min="0" step="any" value={form.score} onChange={e => setForm(p => ({...p,score:e.target.value}))} placeholder="18"/></label>
      <label><span>Max Score</span><input type="number" min="0.01" step="any" value={form.max_score} onChange={e => setForm(p => ({...p,max_score:e.target.value}))} placeholder="20"/></label>
      <label><span>Date</span><input type="date" value={form.test_date} onChange={e => setForm(p => ({...p,test_date:e.target.value}))}/></label>
      <label><span>Difficulty</span><select value={form.difficulty} onChange={e => setForm(p => ({...p,difficulty:e.target.value}))}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
      <label className="wide"><span>Notes</span><textarea rows="3" value={form.notes} onChange={e => setForm(p => ({...p,notes:e.target.value}))} placeholder="Topics missed, observations, or test notes..." /></label>
      <button className="primary" disabled={saving}>{saving ? <Loader2 className="spin" size={15}/> : <Plus size={15}/>} {saving ? 'SAVING...' : 'SAVE TEST'}</button>
    </form>}
    {loading ? <div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your tests...</span></div> : tests.length === 0 ? <div className="panel data-state"><TestTube2 size={36}/><h2>No tests yet.</h2><p>Add a result and the Lab will calculate the percentage for you.</p><button className="primary" onClick={openCreate}><Plus size={16}/> CREATE FIRST TEST</button></div> :
      <div className="record-list">{tests.map(test => { const pct=percentage(test); return <article className="panel record-card" key={test.id}><div className="record-card-head"><div><p className="eyebrow">ASSESSMENT</p><h2>{test.name}</h2></div><button className="icon-btn danger-btn" onClick={() => remove(test.id)}><Trash2 size={14}/></button></div><div className="metric-row">{pct == null ? <span className="metric-muted">No score entered</span> : <><strong>{pct}%</strong><span>{test.score}/{test.max_score}</span><CheckCircle2 size={16}/></>}<span>{test.test_date}</span><span className="tag">{test.difficulty}</span></div>{test.notes && <p className="record-content">{test.notes}</p>}</article>})}</div>}
  </div>
}
