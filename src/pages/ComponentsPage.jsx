import { useEffect, useState } from 'react'
import { Boxes, Loader2, MapPin, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank={name:'',type:'',value:'',quantity:'0',manufacturer:'',part_number:'',purpose:'',package:'',datasheet_url:'',location_id:'',notes:''}
const locationBlank={code:'',name:'',description:''}

export default function ComponentsPage(){
  const [components,setComponents]=useState([])
  const [locations,setLocations]=useState([])
  const [creating,setCreating]=useState(false)
  const [editingId,setEditingId]=useState(null)
  const [form,setForm]=useState(blank)
  const [creatingLocation,setCreatingLocation]=useState(false)
  const [locationForm,setLocationForm]=useState(locationBlank)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true);setError('')
    const [componentsResult,locationsResult]=await Promise.all([
      supabase.from('components').select('id,name,type,value,quantity,manufacturer,part_number,purpose,package,datasheet_url,location_id,location_code,notes,created_at').order('created_at',{ascending:false}),
      supabase.from('component_locations').select('id,code,name,description').order('code'),
    ])
    const first=[componentsResult,locationsResult].map(r=>r.error).find(Boolean)
    if(first)setError(first.message)
    else{setComponents(componentsResult.data||[]);setLocations(locationsResult.data||[])}
    setLoading(false)
  }
  useEffect(()=>{refresh()},[])

  function startCreate(){setEditingId(null);setForm(blank);setCreating(true);setError('')}
  function startEdit(c){setEditingId(c.id);setForm({name:c.name||'',type:c.type||'',value:c.value||'',quantity:String(c.quantity??0),manufacturer:c.manufacturer||'',part_number:c.part_number||'',purpose:c.purpose||'',package:c.package||'',datasheet_url:c.datasheet_url||'',location_id:c.location_id||'',notes:c.notes||''});setCreating(true);setError('')}
  function cancel(){setCreating(false);setEditingId(null);setForm(blank)}

  async function save(event){
    event.preventDefault();if(!form.name.trim())return
    setSaving(true);setError('')
    const location=locations.find(l=>l.id===form.location_id)
    const payload={name:form.name.trim(),type:form.type.trim()||null,value:form.value.trim()||null,quantity:Math.max(0,Number(form.quantity)||0),manufacturer:form.manufacturer.trim()||null,part_number:form.part_number.trim()||null,purpose:form.purpose.trim()||null,package:form.package.trim()||null,datasheet_url:form.datasheet_url.trim()||null,location_id:form.location_id||null,location_code:location?.code||null,notes:form.notes.trim()||null}
    const result=editingId?await supabase.from('components').update(payload).eq('id',editingId):await supabase.from('components').insert(payload)
    if(result.error)setError(result.error.message)
    else{cancel();await refresh();window.dispatchEvent(new Event('jel-record-created'))}
    setSaving(false)
  }

  async function saveLocation(event){
    event.preventDefault();if(!locationForm.code.trim()||!locationForm.name.trim())return
    setSaving(true);setError('')
    const result=await supabase.from('component_locations').insert({code:locationForm.code.trim().toUpperCase(),name:locationForm.name.trim(),description:locationForm.description.trim()||null})
    if(result.error)setError(result.error.message)
    else{setCreatingLocation(false);setLocationForm(locationBlank);await refresh()}
    setSaving(false)
  }

  async function removeLocation(id){
    if(!window.confirm('Delete this physical location? Components will keep their records but lose the location link.'))return
    const result=await supabase.from('component_locations').delete().eq('id',id)
    if(result.error)setError(result.error.message);else await refresh()
  }

  async function remove(id){
    if(!window.confirm('Delete this component from inventory?'))return
    const result=await supabase.from('components').delete().eq('id',id)
    if(result.error)setError(result.error.message);else await refresh()
  }

  function locationName(id){const l=locations.find(x=>x.id===id);return l?l.code+' — '+l.name:''}

  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><Boxes size={28}/></div>
      <div><p className="eyebrow">PHYSICAL LAB INVENTORY</p><h1>Components</h1><p>Digitize real parts with quantity, identity, purpose, datasheets, and exact physical storage locations.</p></div>
      <div className="module-actions"><button className="secondary" onClick={()=>{setCreatingLocation(true);setCreating(false)}}><MapPin size={15}/> NEW LOCATION</button><button className="primary" onClick={startCreate}><Plus size={17}/> NEW COMPONENT</button></div>
    </section>
    {error&&<div className="data-error">{error}</div>}

    {creatingLocation&&<form className="panel record-form" onSubmit={saveLocation}>
      <div className="record-form-head"><div><p className="eyebrow">PHYSICAL LOCATION</p><h2>New Lab Location</h2></div><button type="button" className="ghost" onClick={()=>setCreatingLocation(false)}><X size={14}/> CANCEL</button></div>
      <label><span>Code</span><input required autoFocus value={locationForm.code} onChange={e=>setLocationForm(p=>({...p,code:e.target.value}))} placeholder="RES-A01"/></label>
      <label><span>Name</span><input required value={locationForm.name} onChange={e=>setLocationForm(p=>({...p,name:e.target.value}))} placeholder="Resistor Drawer 01"/></label>
      <label className="wide"><span>Description</span><textarea rows="3" value={locationForm.description} onChange={e=>setLocationForm(p=>({...p,description:e.target.value}))} placeholder="What is stored here?"/></label>
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:<Save size={15}/>} SAVE LOCATION</button>
    </form>}

    {creating&&!creatingLocation&&<form className="panel record-form component-form" onSubmit={save}>
      <div className="record-form-head"><div><p className="eyebrow">{editingId?'EDIT INVENTORY RECORD':'ADD INVENTORY'}</p><h2>{editingId?'Edit Component':'New Component'}</h2></div><button type="button" className="ghost" onClick={cancel}><X size={14}/> CANCEL</button></div>
      <label><span>Name</span><input required autoFocus value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. 2N3904 NPN Transistor"/></label>
      <label><span>Type</span><input value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} placeholder="Transistor"/></label>
      <label><span>Value / Rating</span><input value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))} placeholder="10 kΩ / 1/4 W"/></label>
      <label><span>Quantity</span><input type="number" min="0" step="1" value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))}/></label>
      <label><span>Manufacturer</span><input value={form.manufacturer} onChange={e=>setForm(p=>({...p,manufacturer:e.target.value}))}/></label>
      <label><span>Part Number</span><input value={form.part_number} onChange={e=>setForm(p=>({...p,part_number:e.target.value}))}/></label>
      <label><span>Package</span><input value={form.package} onChange={e=>setForm(p=>({...p,package:e.target.value}))} placeholder="TO-92, 0805, DIP-16..."/></label>
      <label><span>Physical Location</span><select value={form.location_id} onChange={e=>setForm(p=>({...p,location_id:e.target.value}))}><option value="">No location</option>{locations.map(l=><option value={l.id} key={l.id}>{l.code} — {l.name}</option>)}</select></label>
      <label className="wide"><span>Purpose</span><input value={form.purpose} onChange={e=>setForm(p=>({...p,purpose:e.target.value}))} placeholder="What will you use this component for?"/></label>
      <label className="wide"><span>Datasheet URL</span><input type="url" value={form.datasheet_url} onChange={e=>setForm(p=>({...p,datasheet_url:e.target.value}))}/></label>
      <label className="wide"><span>Notes</span><textarea rows="3" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Storage notes, supplier info, observations..."/></label>
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:editingId?<Save size={15}/>:<Plus size={15}/>} {saving?'SAVING...':editingId?'UPDATE COMPONENT':'ADD COMPONENT'}</button>
    </form>}

    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your inventory...</span></div>:components.length===0?<div className="panel data-state"><Boxes size={36}/><h2>Inventory is empty.</h2><p>Add real parts and storage locations. Projects and circuits can reference them later.</p><button className="primary" onClick={startCreate}><Plus size={16}/> ADD FIRST COMPONENT</button></div>:
      <div className="record-list">
        {locations.length>0&&<section className="panel location-panel"><div className="panel-head"><div><p className="eyebrow">PHYSICAL STORAGE</p><h2>Lab Locations</h2></div></div><div className="location-list">{locations.map(l=><div className="location-row" key={l.id}><span className="tag">{l.code}</span><b>{l.name}</b><small>{l.description||'Physical storage location'}</small><button className="icon-btn danger-btn" onClick={()=>removeLocation(l.id)}><Trash2 size={12}/></button></div>)}</div></section>}
        {components.map(c=><article className="panel record-card" key={c.id}>
          <div className="record-card-head"><div><p className="eyebrow">LAB COMPONENT</p><h2>{c.name}</h2></div><div className="record-actions"><button className="icon-btn" title="Edit component" onClick={()=>startEdit(c)}><Pencil size={14}/></button><button className="icon-btn danger-btn" onClick={()=>remove(c.id)}><Trash2 size={14}/></button></div></div>
          <div className="metric-row"><strong>{c.quantity}</strong><span>units</span>{c.type&&<span>{c.type}</span>}{c.value&&<span>{c.value}</span>}{c.location_id&&<span className="tag">{locationName(c.location_id)}</span>}</div>
          <div className="detail-grid">{c.manufacturer&&<div><span>Manufacturer</span><p>{c.manufacturer}</p></div>}{c.part_number&&<div><span>Part Number</span><p>{c.part_number}</p></div>}{c.package&&<div><span>Package</span><p>{c.package}</p></div>}{c.purpose&&<div><span>Purpose</span><p>{c.purpose}</p></div>}{c.datasheet_url&&<div><span>Datasheet</span><p><a href={c.datasheet_url} target="_blank" rel="noreferrer">OPEN DATASHEET →</a></p></div>}{c.notes&&<div className="wide"><span>Notes</span><p>{c.notes}</p></div>}</div>
        </article>)}
      </div>}
  </div>
}
