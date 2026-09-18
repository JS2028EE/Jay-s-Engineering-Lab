import { useEffect, useState } from 'react'
import { Check, ChevronDown, ChevronRight, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const categoryBlank={name:''}
const habitBlank={name:'',target:'',unit:''}

function today(){return new Date().toISOString().slice(0,10)}

export default function WellnessPage(){
  const [categories,setCategories]=useState([])
  const [creatingCategory,setCreatingCategory]=useState(false)
  const [creatingHabit,setCreatingHabit]=useState(null)
  const [categoryForm,setCategoryForm]=useState(categoryBlank)
  const [habitForm,setHabitForm]=useState(habitBlank)
  const [expanded,setExpanded]=useState({})
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true)
    const result=await supabase.from('wellness_categories').select('id,name,sort_order,wellness_habits(id,name,target,unit,sort_order,wellness_checkins(id,completed,checkin_date))').order('sort_order',{ascending:true})
    if(result.error) setError(result.error.message)
    else setCategories(result.data||[])
    setLoading(false)
  }
  useEffect(()=>{refresh()},[])

  function openCategory(){setCategoryForm(categoryBlank);setCreatingCategory(true);setCreatingHabit(null);setError('')}
  function openHabit(categoryId){setHabitForm(habitBlank);setCreatingHabit(categoryId);setCreatingCategory(false);setError('')}

  async function saveCategory(event){
    event.preventDefault()
    if(!categoryForm.name.trim())return
    setSaving(true)
    const result=await supabase.from('wellness_categories').insert({name:categoryForm.name.trim(),sort_order:categories.length+1})
    if(result.error)setError(result.error.message)
    else{setCreatingCategory(false);await refresh()}
    setSaving(false)
  }

  async function saveHabit(event){
    event.preventDefault()
    if(!creatingHabit||!habitForm.name.trim())return
    setSaving(true)
    const result=await supabase.from('wellness_habits').insert({category_id:creatingHabit,name:habitForm.name.trim(),target:habitForm.target===''?null:Number(habitForm.target),unit:habitForm.unit.trim()||null})
    if(result.error)setError(result.error.message)
    else{setCreatingHabit(null);await refresh()}
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

  async function removeHabit(id){
    if(!window.confirm('Delete this habit?'))return
    const result=await supabase.from('wellness_habits').delete().eq('id',id)
    if(result.error)setError(result.error.message);else await refresh()
  }

  async function removeCategory(id){
    if(!window.confirm('Delete this wellness category and its habits?'))return
    const result=await supabase.from('wellness_categories').delete().eq('id',id)
    if(result.error)setError(result.error.message);else await refresh()
  }

  return <div className="content">
    <section className="module-hero"><div className="module-icon"><Sparkles size={28}/></div><div><p className="eyebrow">ENGINEER WELLBEING SYSTEM</p><h1>Wellness</h1><p>Track habits and real daily check-ins without mixing wellness data into your engineering performance metrics.</p></div><button className="primary module-action" onClick={openCategory}><Plus size={17}/> NEW CATEGORY</button></section>
    {error&&<div className="data-error">{error}</div>}
    {creatingCategory&&<form className="panel record-form" onSubmit={saveCategory}><div className="record-form-head"><div><p className="eyebrow">CREATE CATEGORY</p><h2>New Wellness Category</h2></div><button type="button" className="ghost" onClick={()=>setCreatingCategory(false)}>CANCEL</button></div><label><span>Name</span><input required autoFocus value={categoryForm.name} onChange={e=>setCategoryForm({name:e.target.value})} placeholder="Physical, Nutrition, Growth, Spiritual..."/></label><button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:<Plus size={15}/>} SAVE CATEGORY</button></form>}
    {creatingHabit&&<form className="panel record-form" onSubmit={saveHabit}><div className="record-form-head"><div><p className="eyebrow">CREATE HABIT</p><h2>New Wellness Habit</h2></div><button type="button" className="ghost" onClick={()=>setCreatingHabit(null)}>CANCEL</button></div><label><span>Name</span><input required autoFocus value={habitForm.name} onChange={e=>setHabitForm(p=>({...p,name:e.target.value}))} placeholder="e.g. 30 min reading"/></label><label><span>Target</span><input type="number" step="any" value={habitForm.target} onChange={e=>setHabitForm(p=>({...p,target:e.target.value}))} placeholder="30"/></label><label><span>Unit</span><input value={habitForm.unit} onChange={e=>setHabitForm(p=>({...p,unit:e.target.value}))} placeholder="minutes, glasses, reps..."/></label><button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:<Plus size={15}/>} SAVE HABIT</button></form>}

    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading wellness records...</span></div>:categories.length===0?<div className="panel data-state"><Sparkles size={36}/><h2>No wellness categories yet.</h2><p>Create categories first, then add habits and check them off each day.</p><button className="primary" onClick={openCategory}><Plus size={16}/> CREATE FIRST CATEGORY</button></div>:
      <div className="curriculum-tree">{categories.map(category=>{
        const open=expanded[category.id]!==false
        return <section className="panel tree-node" key={category.id}>
          <div className="tree-row">
            <button className="tree-toggle" onClick={()=>setExpanded(p=>({...p,[category.id]:!open}))}>{open?<ChevronDown size={17}/>:<ChevronRight size={17}/>}</button>
            <div className="tree-icon"><Sparkles size={17}/></div>
            <div className="tree-main"><b>{category.name}</b><span>{(category.wellness_habits||[]).length} habits</span></div>
            <div className="tree-progress"><strong>{(category.wellness_habits||[]).filter(h=>(h.wellness_checkins||[]).some(c=>c.checkin_date===today()&&c.completed)).length}/{(category.wellness_habits||[]).length}</strong></div>
            <button className="icon-btn" title="Add habit" onClick={()=>openHabit(category.id)}><Plus size={15}/></button>
            <button className="icon-btn danger-btn" title="Delete category" onClick={()=>removeCategory(category.id)}><Trash2 size={14}/></button>
          </div>
          {open&&<div className="requirement-list">{(category.wellness_habits||[]).map(habit=>{
            const check=(habit.wellness_checkins||[]).find(c=>c.checkin_date===today())
            return <div className={'requirement '+(check?.completed?'requirement-done':'')} key={habit.id}>
              <button className={'requirement-check '+(check?.completed?'checked':'')} onClick={()=>toggleCheckin(habit)}>{check?.completed&&<Check size={13}/>}</button>
              <span>{habit.name}{habit.target!=null?' — '+habit.target+(habit.unit?' '+habit.unit:''):''}</span>
              <button className="icon-btn danger-btn" title="Delete habit" onClick={()=>removeHabit(habit.id)}><Trash2 size={12}/></button>
            </div>
          })}</div>}
        </section>
      })}</div>}
  </div>
}
