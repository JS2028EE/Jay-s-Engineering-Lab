import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronRight, Loader2, Pencil, Plus, Save, Sparkles, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const categoryBlank={name:''}
const habitBlank={name:'',target:'',unit:''}

function today(){
  const now=new Date()
  const pad=n=>String(n).padStart(2,'0')
  return now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())
}

function streak(checkins){
  const done=new Set((checkins||[]).filter(c=>c.completed).map(c=>c.checkin_date))
  let cursor=new Date(today()+'T12:00:00')
  let count=0
  while(done.has(cursor.toISOString().slice(0,10))){
    count+=1
    cursor.setDate(cursor.getDate()-1)
  }
  return count
}

function habitCompletionRate(checkins){
  const relevant=(checkins||[]).filter(c=>c.completed)
  if(!relevant.length)return 0
  const first=new Date(relevant.map(c=>c.checkin_date).sort()[0]+'T12:00:00')
  const days=Math.max(1,Math.floor((new Date(today()+'T12:00:00')-first)/86400000)+1)
  return Math.min(100,Math.round(relevant.length/days*100))
}

export default function WellnessPage(){
  const [categories,setCategories]=useState([])
  const [creatingCategory,setCreatingCategory]=useState(false)
  const [creatingHabit,setCreatingHabit]=useState(null)
  const [editingHabit,setEditingHabit]=useState(null)
  const [categoryForm,setCategoryForm]=useState(categoryBlank)
  const [habitForm,setHabitForm]=useState(habitBlank)
  const [expanded,setExpanded]=useState({})
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true);setError('')
    const result=await supabase.from('wellness_categories').select('id,name,sort_order,wellness_habits(id,name,target,unit,sort_order,wellness_checkins(id,completed,checkin_date,measurement,note))').order('sort_order',{ascending:true})
    if(result.error)setError(result.error.message);else setCategories(result.data||[])
    setLoading(false)
  }
  useEffect(()=>{refresh()},[])

  function openCategory(){setCategoryForm(categoryBlank);setCreatingCategory(true);setCreatingHabit(null);setEditingHabit(null);setError('')}
  function openHabit(categoryId){setHabitForm(habitBlank);setCreatingHabit(categoryId);setCreatingCategory(false);setEditingHabit(null);setError('')}
  function openEditHabit(habit){setHabitForm({name:habit.name||'',target:habit.target??'',unit:habit.unit||''});setEditingHabit(habit);setCreatingHabit(null);setCreatingCategory(false);setError('')}

  async function saveCategory(event){
    event.preventDefault();if(!categoryForm.name.trim())return
    setSaving(true)
    const result=await supabase.from('wellness_categories').insert({name:categoryForm.name.trim(),sort_order:categories.length+1})
    if(result.error)setError(result.error.message);else{setCreatingCategory(false);await refresh()}
    setSaving(false)
  }

  async function saveHabit(event){
    event.preventDefault();if(!habitForm.name.trim())return
    setSaving(true)
    const payload={name:habitForm.name.trim(),target:habitForm.target===''?null:Number(habitForm.target),unit:habitForm.unit.trim()||null}
    const result=editingHabit
      ? await supabase.from('wellness_habits').update(payload).eq('id',editingHabit.id)
      : await supabase.from('wellness_habits').insert({...payload,category_id:creatingHabit})
    if(result.error)setError(result.error.message)
    else{setCreatingHabit(null);setEditingHabit(null);await refresh()}
    setSaving(false)
  }

  async function toggleCheckin(habit){
    const current=(habit.wellness_checkins||[]).find(item=>item.checkin_date===today())
    if(current){
      const result=await supabase.from('wellness_checkins').update({completed:!current.completed}).eq('id',current.id)
      if(result.error)setError(result.error.message);else await refresh()
    }else{
      const result=await supabase.from('wellness_checkins').insert({habit_id:habit.id,checkin_date:today(),completed:true})
      if(result.error)setError(result.error.message);else await refresh()
    }
  }

  async function saveMeasurement(habit,value,note){
    const current=(habit.wellness_checkins||[]).find(item=>item.checkin_date===today())
    setSaving(true)
    const payload={measurement:value===''?null:Number(value),note:note||null,completed:current?.completed??true,checkin_date:today(),habit_id:habit.id}
    const result=current?await supabase.from('wellness_checkins').update({measurement:payload.measurement,note:payload.note}).eq('id',current.id):await supabase.from('wellness_checkins').insert(payload)
    if(result.error)setError(result.error.message);else await refresh()
    setSaving(false)
  }

  async function removeHabit(id){if(!window.confirm('Delete this habit and its history?'))return;const result=await supabase.from('wellness_habits').delete().eq('id',id);if(result.error)setError(result.error.message);else await refresh()}
  async function removeCategory(id){if(!window.confirm('Delete this wellness category and all of its habits?'))return;const result=await supabase.from('wellness_categories').delete().eq('id',id);if(result.error)setError(result.error.message);else await refresh()}

  const summary=useMemo(()=>{
    const habits=categories.flatMap(c=>c.wellness_habits||[])
    const done=habits.filter(h=>(h.wellness_checkins||[]).some(c=>c.checkin_date===today()&&c.completed)).length
    return{habits:habits.length,done,rate:habits.length?Math.round(done/habits.length*100):0}
  },[categories])

  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><Sparkles size={28}/></div>
      <div><p className="eyebrow">PERSONAL DEVELOPMENT SYSTEM</p><h1>Wellness</h1><p>Track real habits, measurements, daily consistency, and goals without mixing wellness data into engineering performance metrics.</p></div>
      <button className="primary module-action" onClick={openCategory}><Plus size={17}/> NEW CATEGORY</button>
    </section>
    {error&&<div className="data-error">{error}</div>}

    <section className="panel wellness-summary"><div><span>TODAY</span><strong>{summary.done}/{summary.habits}</strong></div><div><span>DAILY COMPLETION</span><strong>{summary.rate}%</strong></div><div><span>CATEGORIES</span><strong>{categories.length}</strong></div></section>

    {creatingCategory&&<form className="panel record-form" onSubmit={saveCategory}><div className="record-form-head"><div><p className="eyebrow">CREATE CATEGORY</p><h2>New Wellness Category</h2></div><button type="button" className="ghost" onClick={()=>setCreatingCategory(false)}><X size={14}/> CANCEL</button></div><label><span>Name</span><input required autoFocus value={categoryForm.name} onChange={e=>setCategoryForm({name:e.target.value})} placeholder="Physical, Nutrition, Growth, Spiritual..."/></label><button className="primary" disabled={saving}><Save size={15}/> SAVE CATEGORY</button></form>}

    {(creatingHabit||editingHabit)&&<form className="panel record-form" onSubmit={saveHabit}><div className="record-form-head"><div><p className="eyebrow">{editingHabit?'EDIT HABIT':'CREATE HABIT'}</p><h2>{editingHabit?'Edit Wellness Habit':'New Wellness Habit'}</h2></div><button type="button" className="ghost" onClick={()=>{setCreatingHabit(null);setEditingHabit(null)}}><X size={14}/> CANCEL</button></div><label><span>Name</span><input required autoFocus value={habitForm.name} onChange={e=>setHabitForm(p=>({...p,name:e.target.value}))} placeholder="e.g. 30 min reading"/></label><label><span>Target</span><input type="number" step="any" value={habitForm.target} onChange={e=>setHabitForm(p=>({...p,target:e.target.value}))} placeholder="30"/></label><label><span>Unit</span><input value={habitForm.unit} onChange={e=>setHabitForm(p=>({...p,unit:e.target.value}))} placeholder="minutes, glasses, reps..."/></label><button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:editingHabit?<Save size={15}/>:<Plus size={15}/>} {editingHabit?'UPDATE HABIT':'SAVE HABIT'}</button></form>}

    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading wellness records...</span></div>:categories.length===0?<div className="panel data-state"><Sparkles size={36}/><h2>No wellness categories yet.</h2><p>Create categories, add habits, then check them off daily.</p><button className="primary" onClick={openCategory}><Plus size={16}/> CREATE FIRST CATEGORY</button></div>:
      <div className="curriculum-tree">{categories.map(category=>{
        const open=expanded[category.id]!==false
        const habits=category.wellness_habits||[]
        const done=habits.filter(h=>(h.wellness_checkins||[]).some(c=>c.checkin_date===today()&&c.completed)).length
        return <section className="panel tree-node" key={category.id}>
          <div className="tree-row">
            <button className="tree-toggle" onClick={()=>setExpanded(p=>({...p,[category.id]:!open}))}>{open?<ChevronDown size={17}/>:<ChevronRight size={17}/>}</button>
            <div className="tree-icon"><Sparkles size={17}/></div>
            <div className="tree-main"><b>{category.name}</b><span>{done}/{habits.length} today</span></div>
            <div className="tree-progress"><strong>{habits.length?Math.round(done/habits.length*100):0}%</strong><div className="progress thin"><i style={{width:(habits.length?Math.round(done/habits.length*100):0)+'%'}}/></div></div>
            <div className="record-actions"><button className="icon-btn" title="Add habit" onClick={()=>openHabit(category.id)}><Plus size={15}/></button><button className="icon-btn danger-btn" title="Delete category" onClick={()=>removeCategory(category.id)}><Trash2 size={14}/></button></div>
          </div>
          {open&&<div className="wellness-habit-list">{habits.map(habit=>{
            const check=(habit.wellness_checkins||[]).find(c=>c.checkin_date===today())
            const rate=habitCompletionRate(habit.wellness_checkins)
            return <div className="wellness-habit" key={habit.id}>
              <div className="wellness-habit-main">
                <button className={'requirement-check '+(check?.completed?'checked':'')} onClick={()=>toggleCheckin(habit)}>{check?.completed&&<Check size={13}/>}</button>
                <div><b>{habit.name}</b><small>{habit.target!=null?'Target: '+habit.target+(habit.unit?' '+habit.unit:''):'No target'} · {streak(habit.wellness_checkins)} day streak · {rate}% consistency</small></div>
              </div>
              <div className="record-actions"><button className="icon-btn" title="Edit habit" onClick={()=>openEditHabit(habit)}><Pencil size={13}/></button><button className="icon-btn danger-btn" title="Delete habit" onClick={()=>removeHabit(habit.id)}><Trash2 size={12}/></button></div>
              <div className="wellness-measure"><input type="number" step="any" defaultValue={check?.measurement??''} placeholder="measurement"/><button className="secondary" disabled={saving} onClick={(e)=>{const input=e.currentTarget.previousElementSibling;saveMeasurement(habit,input.value,check?.note||'')}}>SAVE MEASUREMENT</button></div>
            </div>
          })}</div>}
        </section>
      })}</div>}
  </div>
}
