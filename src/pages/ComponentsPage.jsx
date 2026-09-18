import { useEffect, useState } from 'react'
import { Boxes, Loader2, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank = { name:'', type:'', value:'', quantity:'0', manufacturer:'', part_number:'', purpose:'', package:'', datasheet_url:'', location_code:'', notes:'' }

export default function ComponentsPage() {
  const [components,setComponents]=useState([])
  const [creating,setCreating]=useState(false)
  const [form,setForm]=useState(blank)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true)
    const result=await supabase.from('components').select('id,name,type,value,quantity,manufacturer,part_number,purpose,package,datasheet_url,location_code,notes,created_at').order('created_at',{ascending:false})
    if(result.error) setError(result.error.message)
    else setComponents(result.data||[])
    setLoading(false)
  }

  useEffect(()=>{refresh()},[])

  function openCreate(){setForm(blank);setCreating(true);setError('')}

  async function save(event){
    event.preventDefault()
    if(!form.name.trim()) return
    setSaving(true)
    const result=await supabase.from('components').insert({
      name:form.name.trim(),
      type:form.type.trim()||null,
      value:form.value.trim()||null,
      quantity:Math.max(0,Number(form.quantity)||0),
      manufacturer:form.manufacturer.trim()||null,
      part_number:form.part_number.trim()||null,
      purpose:form.purpose.trim()||null,
      package:form.package.trim()||null,
      datasheet_url:form.datasheet_url.trim()||null,
      location_code:form.location_code.trim()||null,
      notes:form.notes.trim()||null,
    })
    if(result.error) setError(result.error.message)
    else {setCreating(false);setForm(blank);await refresh();window.dispatchEvent(new Event('jel-record-created'))}
    setSaving(false)
  }

  async function remove(id){
    if(!window.confirm('Delete this component from inventory?')) return
    const result=await supabase.from('components').delete().eq('id',id)
    if(result.error) setError(result.error.message)
    else await refresh()
  }

  return <div className="content">
    <section className="module-hero"><div className="module-icon"><Boxes size={28}/></div><div><p className="eyebrow">PHYSICAL LAB INVENTORY</p><h1>Components</h1><p>Digitize the parts in your physical lab and keep quantity, identity, purpose, datasheets, and storage codes together.</p></div><button className="primary module-action" onClick={openCreate}><Plus size={17}/> NEW COMPONENT</button></section>
    {error&&<div className="data-error">{error}</div>}
    {creating&&<form className="panel record-form component-form" onSubmit={save}><div className="record-form-head"><div><p className="eyebrow">ADD INVENTORY</p><h2>New Component</h2></div><button type="button" className="ghost" onClick={()=>setCreating(false)}>CANCEL</button></div>
      <label><span>Name</span><input required autoFocus value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. 2N3904 NPN Transistor"/></label>
      <label><span>Type</span><input value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} placeholder="Transistor"/></label>
      <label><span>Value / Rating</span><input value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))} placeholder="10 kΩ / 1/4 W"/></label>
      <label><span>Quantity</span><input type="number" min="0" step="1" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))}/></label>
      <label><span>Manufacturer</span><input value={form.manufacturer} onChange={e=>setForm(p=>({...p,manufacturer:e.target.value}))}/></label>
      <label><span>Part Number</span><input value={form.part_number} onChange={e=>setForm(p=>({...p,part_number:e.target.value}))}/></label>
      <label><span>Package</span><input value={form.package} onChange={e=>setForm(p=>({...p,package:e.target.value}))} placeholder="TO-92, 0805, DIP-16..."/></label>
      <label><span>Physical Location</span><input value={form.location_code} onChange={e=>setForm(p=>({...p,location_code:e.target.value}))} placeholder="RES-A01"/></label>
      <label className="wide"><span>Purpose</span><input value={form.purpose} onChange={e=>setForm(p=>({...p,purpose:e.target.value}))} placeholder="What will you use this component for?"/></label>
      <label className="wide"><span>Datasheet URL</span><input type="url" value={form.datasheet_url} onChange={e=>setForm(p=>({...p,datasheet_url:e.target.value}))}/></label>
      <label className="wide"><span>Notes</span><textarea rows="3" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Storage notes, supplier info, observations..."/></label>
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:<Plus size={15}/>} {saving?'SAVING...':'ADD COMPONENT'}</button>
    </form>}
    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your inventory...</span></div>:components.length===0?<div className="panel data-state"><Boxes size={36}/><h2>Inventory is empty.</h2><p>Add the real parts in your lab so projects and circuits can reference them later.</p><button className="primary" onClick={openCreate}><Plus size={16}/> ADD FIRST COMPONENT</button></div>:
      <div className="record-list">{components.map(c=><article className="panel record-card" key={c.id}><div className="record-card-head"><div><p className="eyebrow">LAB COMPONENT</p><h2>{c.name}</h2></div><button className="icon-btn danger-btn" onClick={()=>remove(c.id)}><Trash2 size={14}/></button></div><div className="metric-row"><strong>{c.quantity}</strong><span>units</span>{c.type&&<span>{c.type}</span>}{c.value&&<span>{c.value}</span>}{c.location_code&&<span className="tag">{c.location_code}</span>}</div><div className="detail-grid">{c.manufacturer&&<div><span>Manufacturer</span><p>{c.manufacturer}</p></div>}{c.part_number&&<div><span>Part Number</span><p>{c.part_number}</p></div>}{c.package&&<div><span>Package</span><p>{c.package}</p></div>}{c.purpose&&<div><span>Purpose</span><p>{c.purpose}</p></div>}{c.datasheet_url&&<div><span>Datasheet</span><p><a href={c.datasheet_url} target="_blank" rel="noreferrer">OPEN DATASHEET →</a></p></div>}{c.notes&&<div className="wide"><span>Notes</span><p>{c.notes}</p></div>}</div></article>)}</div>}
  </div>
}
