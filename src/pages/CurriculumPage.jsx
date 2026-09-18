import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronRight, GraduationCap, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const emptyForm={type:'subject',parentId:'',id:null,name:'',description:''}

function lessonProgress(lesson){
  const requirements=lesson.lesson_requirements||[]
  const completed=requirements.filter(item=>item.completed).length
  return{completed,total:requirements.length,progress:requirements.length?Math.round(completed/requirements.length*100):0}
}
function unitProgress(unit){
  const lessons=unit.lessons||[]
  return lessons.length?Math.round(lessons.reduce((sum,l)=>sum+lessonProgress(l).progress,0)/lessons.length):0
}
function subjectProgress(subject){
  const units=subject.units||[]
  return units.length?Math.round(units.reduce((sum,u)=>sum+unitProgress(u),0)/units.length):0
}
async function loadCurriculum(){
  const result=await supabase.from('subjects').select('id,name,description,sort_order,units(id,name,description,sort_order,lessons(id,name,description,sort_order,lesson_requirements(id,requirement,completed,sort_order)))').order('sort_order',{ascending:true})
  if(result.error)throw result.error
  return(result.data||[]).map(subject=>{subject.units=(subject.units||[]).sort((a,b)=>a.sort_order-b.sort_order).map(unit=>{unit.lessons=(unit.lessons||[]).sort((a,b)=>a.sort_order-b.sort_order).map(lesson=>{lesson.lesson_requirements=(lesson.lesson_requirements||[]).sort((a,b)=>a.sort_order-b.sort_order);return lesson});return unit});return subject})
}

export default function CurriculumPage(){
  const [subjects,setSubjects]=useState([])
  const [expanded,setExpanded]=useState({})
  const [form,setForm]=useState(emptyForm)
  const [creating,setCreating]=useState(false)
  const [editing,setEditing]=useState(false)
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true);setError('')
    try{setSubjects(await loadCurriculum())}catch(err){setError(err.message||'Could not load your curriculum.')}finally{setLoading(false)}
  }
  useEffect(()=>{refresh()},[])

  function start(type,parentId){
    setForm({type,parentId:parentId||'',id:null,name:'',description:''});setCreating(true);setEditing(false);setError('')
  }
  function edit(type,record,parentId){
    setForm({type,parentId:parentId||'',id:record.id,name:record.name||'',description:record.description||record.requirement||''});setCreating(true);setEditing(true);setError('')
  }
  function cancel(){setCreating(false);setEditing(false);setForm(emptyForm)}

  async function save(event){
    event.preventDefault();const name=form.name.trim();if(!name)return
    setSaving(true);setError('')
    try{
      let result
      if(editing){
        const table={subject:'subjects',unit:'units',lesson:'lessons',requirement:'lesson_requirements'}[form.type]
        const payload=form.type==='subject'||form.type==='unit'||form.type==='lesson'?{name,description:form.description.trim()||null}:{requirement:name}
        result=await supabase.from(table).update(payload).eq('id',form.id)
      }else{
        const target={
          subject:{table:'subjects',payload:{name,description:form.description.trim()||null}},
          unit:{table:'units',payload:{subject_id:form.parentId,name,description:form.description.trim()||null}},
          lesson:{table:'lessons',payload:{unit_id:form.parentId,name,description:form.description.trim()||null}},
          requirement:{table:'lesson_requirements',payload:{lesson_id:form.parentId,requirement:name}},
        }[form.type]
        result=await supabase.from(target.table).insert(target.payload)
      }
      if(result.error)throw result.error
      cancel();await refresh();window.dispatchEvent(new Event('jel-record-created'))
    }catch(err){setError(err.message||'Could not save record.')}finally{setSaving(false)}
  }

  async function toggleRequirement(id,completed){
    const result=await supabase.from('lesson_requirements').update({completed,completed_at:completed?new Date().toISOString():null}).eq('id',id)
    if(result.error)setError(result.error.message);else await refresh()
  }
  async function remove(type,id){
    const label={subject:'subject',unit:'unit',lesson:'lesson',requirement:'requirement'}[type]
    if(!window.confirm('Delete this '+label+'? Child records may also be removed.'))return
    const table={subject:'subjects',unit:'units',lesson:'lessons',requirement:'lesson_requirements'}[type]
    const result=await supabase.from(table).delete().eq('id',id)
    if(result.error)setError(result.error.message);else await refresh()
  }

  const overall=useMemo(()=>subjects.length?Math.round(subjects.reduce((sum,s)=>sum+subjectProgress(s),0)/subjects.length):0,[subjects])
  const unitCount=subjects.reduce((sum,s)=>sum+(s.units||[]).length,0)
  const lessonCount=subjects.reduce((sum,s)=>sum+(s.units||[]).reduce((n,u)=>n+(u.lessons||[]).length,0),0)

  const formTitle=editing?'Edit '+({subject:'Subject',unit:'Unit',lesson:'Lesson',requirement:'Requirement'}[form.type]):'New '+({subject:'Subject',unit:'Unit',lesson:'Lesson',requirement:'Lesson Requirement'}[form.type])

  return <div className="content">
    <section className="module-hero"><div className="module-icon"><GraduationCap size={28}/></div><div><p className="eyebrow">ENGINEERING KNOWLEDGE SYSTEM</p><h1>Curriculum</h1><p>Build your own Subject → Unit → Lesson → Requirement hierarchy. Progress comes from actual completed requirements.</p></div><button className="primary module-action" onClick={()=>start('subject')}><Plus size={17}/> NEW SUBJECT</button></section>
    {error&&<div className="data-error">{error}</div>}
    <section className="panel curriculum-toolbar"><div><p className="eyebrow">OVERALL MASTERY</p><strong className="curriculum-percent">{overall}%</strong></div><div className="progress curriculum-progress"><i style={{width:overall+'%'}}/></div><div className="curriculum-counts"><span><b>{subjects.length}</b> subjects</span><span><b>{unitCount}</b> units</span><span><b>{lessonCount}</b> lessons</span></div></section>

    {creating&&<form className="panel record-form" onSubmit={save}>
      <div className="record-form-head"><div><p className="eyebrow">{editing?'EDIT RECORD':'CREATE RECORD'}</p><h2>{formTitle}</h2></div><button type="button" className="ghost" onClick={cancel}><X size={14}/> CANCEL</button></div>
      <label><span>{form.type==='requirement'?'Requirement':'Name'}</span><input autoFocus required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder={form.type==='requirement'?'e.g. Rearrange V = IR':'Enter a name...'}/></label>
      {form.type!=='requirement'&&<label><span>Description</span><textarea rows="2" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Optional..." /></label>}
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:editing?<Save size={15}/>:<Plus size={15}/>} {saving?'SAVING...':editing?'UPDATE RECORD':'SAVE RECORD'}</button>
    </form>}

    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your curriculum...</span></div>:subjects.length===0?<div className="panel data-state"><GraduationCap size={36}/><h2>Your curriculum is empty.</h2><p>Create your first subject, then build units, lessons, and requirements underneath it.</p><button className="primary" onClick={()=>start('subject')}><Plus size={16}/> CREATE FIRST SUBJECT</button></div>:
      <div className="curriculum-tree">{subjects.map(subject=>{
        const sOpen=expanded['s:'+subject.id]!==false
        return <section className="panel tree-node" key={subject.id}>
          <div className="tree-row">
            <button className="tree-toggle" onClick={()=>setExpanded(p=>({...p,['s:'+subject.id]:!sOpen}))}>{sOpen?<ChevronDown size={17}/>:<ChevronRight size={17}/>}</button>
            <div className="tree-icon"><GraduationCap size={17}/></div>
            <div className="tree-main"><b>{subject.name}</b><span>{subject.description||((subject.units||[]).length+' units')}</span></div>
            <div className="tree-progress"><strong>{subjectProgress(subject)}%</strong><div className="progress thin"><i style={{width:subjectProgress(subject)+'%'}}/></div></div>
            <div className="record-actions"><button className="icon-btn" title="Edit subject" onClick={()=>edit('subject',subject)}><Pencil size={14}/></button><button className="icon-btn" title="Add unit" onClick={()=>start('unit',subject.id)}><Plus size={15}/></button><button className="icon-btn danger-btn" title="Delete subject" onClick={()=>remove('subject',subject.id)}><Trash2 size={14}/></button></div>
          </div>
          {sOpen&&<div className="tree-children">{(subject.units||[]).map(unit=>{
            const uOpen=expanded['u:'+unit.id]!==false
            return <div className="tree-node nested" key={unit.id}>
              <div className="tree-row">
                <button className="tree-toggle" onClick={()=>setExpanded(p=>({...p,['u:'+unit.id]:!uOpen}))}>{uOpen?<ChevronDown size={15}/>:<ChevronRight size={15}/>}</button>
                <div className="tree-icon small"><span>U</span></div>
                <div className="tree-main"><b>{unit.name}</b><span>{unit.description||((unit.lessons||[]).length+' lessons')}</span></div>
                <div className="tree-progress"><strong>{unitProgress(unit)}%</strong><div className="progress thin"><i style={{width:unitProgress(unit)+'%'}}/></div></div>
                <div className="record-actions"><button className="icon-btn" title="Edit unit" onClick={()=>edit('unit',unit,subject.id)}><Pencil size={13}/></button><button className="icon-btn" title="Add lesson" onClick={()=>start('lesson',unit.id)}><Plus size={14}/></button><button className="icon-btn danger-btn" title="Delete unit" onClick={()=>remove('unit',unit.id)}><Trash2 size={13}/></button></div>
              </div>
              {uOpen&&<div className="tree-children">{(unit.lessons||[]).map(lesson=>{
                const lOpen=expanded['l:'+lesson.id]!==false;const stats=lessonProgress(lesson)
                return <div className="tree-node nested lesson-node" key={lesson.id}>
                  <div className="tree-row">
                    <button className="tree-toggle" onClick={()=>setExpanded(p=>({...p,['l:'+lesson.id]:!lOpen}))}>{lOpen?<ChevronDown size={14}/>:<ChevronRight size={14}/>}</button>
                    <div className="tree-icon small"><span>L</span></div>
                    <div className="tree-main"><b>{lesson.name}</b><span>{lesson.description||(stats.completed+'/'+stats.total+' requirements')}</span></div>
                    <div className="tree-progress"><strong>{stats.progress}%</strong><div className="progress thin"><i style={{width:stats.progress+'%'}}/></div></div>
                    <div className="record-actions"><button className="icon-btn" title="Edit lesson" onClick={()=>edit('lesson',lesson,unit.id)}><Pencil size={13}/></button><button className="icon-btn" title="Add requirement" onClick={()=>start('requirement',lesson.id)}><Plus size={14}/></button><button className="icon-btn danger-btn" title="Delete lesson" onClick={()=>remove('lesson',lesson.id)}><Trash2 size={13}/></button></div>
                  </div>
                  {lOpen&&<div className="requirement-list">{(lesson.lesson_requirements||[]).map(req=><div className={'requirement '+(req.completed?'requirement-done':'')} key={req.id}><button className={'requirement-check '+(req.completed?'checked':'')} onClick={()=>toggleRequirement(req.id,!req.completed)}>{req.completed&&<Check size={13}/>}</button><span>{req.requirement}</span><div className="record-actions"><button className="icon-btn" title="Edit requirement" onClick={()=>edit('requirement',req,lesson.id)}><Pencil size={12}/></button><button className="icon-btn danger-btn" title="Delete requirement" onClick={()=>remove('requirement',req.id)}><Trash2 size={12}/></button></div></div>)}</div>}
                </div>
              })}</div>}
            </div>
          })}</div>}
        </section>
      })}</div>}
  </div>
}
