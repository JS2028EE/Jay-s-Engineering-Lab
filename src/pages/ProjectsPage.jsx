import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronRight, GitBranch, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank={name:'',description:'',goal:'',status:'planned',start_date:'',due_date:''}

function projectStats(project){
  const tasks=project.project_tasks||[]
  const completed=tasks.filter(t=>t.completed).length
  return{total:tasks.length,completed,progress:tasks.length?Math.round(completed/tasks.length*100):0}
}

async function loadProjects(){
  const result=await supabase.from('projects').select('id,name,description,goal,status,start_date,due_date,created_at,updated_at,project_tasks(id,title,description,completed,sort_order),project_components(component_id,quantity,components(id,name,value,type))').order('created_at',{ascending:false})
  if(result.error)throw result.error
  return result.data||[]
}

export default function ProjectsPage(){
  const [projects,setProjects]=useState([])
  const [components,setComponents]=useState([])
  const [creating,setCreating]=useState(false)
  const [editingId,setEditingId]=useState(null)
  const [addingTask,setAddingTask]=useState({})
  const [expanded,setExpanded]=useState({})
  const [form,setForm]=useState(blank)
  const [taskText,setTaskText]=useState({})
  const [selectedParts,setSelectedParts]=useState([])
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true);setError('')
    try{
      const [projectData,componentResult]=await Promise.all([
        loadProjects(),
        supabase.from('components').select('id,name,value,type,quantity').order('name')
      ])
      if(componentResult.error) throw componentResult.error
      projectData.forEach(p=>{p.project_tasks=(p.project_tasks||[]).sort((a,b)=>a.sort_order-b.sort_order)})
      setProjects(projectData)
      setComponents(componentResult.data||[])
    }catch(err){
      setError(err.message||'Could not load projects.')
    }finally{
      setLoading(false)
    }
  }
  useEffect(()=>{refresh()},[])

  function startCreate(){setEditingId(null);setForm(blank);setSelectedParts([]);setCreating(true);setError('')}
  function startEdit(project){setEditingId(project.id);setForm({name:project.name||'',description:project.description||'',goal:project.goal||'',status:project.status||'planned',start_date:project.start_date||'',due_date:project.due_date||''});setSelectedParts((project.project_components||[]).map(x=>x.component_id+':'+x.quantity));setCreating(true);setError('')}
  function cancel(){setCreating(false);setEditingId(null);setForm(blank);setSelectedParts([])}

  async function saveProject(event){
    event.preventDefault();if(!form.name.trim())return
    setSaving(true);setError('')
    const payload={name:form.name.trim(),description:form.description.trim()||null,goal:form.goal.trim()||null,status:form.status,start_date:form.start_date||null,due_date:form.due_date||null}
    const result=editingId?await supabase.from('projects').update(payload).eq('id',editingId):await supabase.from('projects').insert(payload).select('id').single()
    if(result.error){setError(result.error.message);setSaving(false);return}
    const projectId=editingId||result.data.id
    const del=await supabase.from('project_components').delete().eq('project_id',projectId)
    if(del.error){setError(del.error.message);setSaving(false);return}
    const rows=selectedParts.map(item=>{const [component_id,quantity]=item.split(':');return{project_id:projectId,component_id,quantity:Math.max(1,Number(quantity)||1)}})
    if(rows.length){const link=await supabase.from('project_components').insert(rows);if(link.error){setError(link.error.message);setSaving(false);return}}
    cancel();await refresh();window.dispatchEvent(new Event('jel-record-created'));setSaving(false)
  }

  function togglePart(id){setSelectedParts(p=>{const index=p.findIndex(x=>x.startsWith(id+':'));if(index>=0){const n=[...p];n.splice(index,1);return n}return[...p,id+':1']})}
  function quantityFor(id){const row=selectedParts.find(x=>x.startsWith(id+':'));return row?row.split(':')[1]:'1'}
  function setQuantity(id,value){setSelectedParts(p=>p.map(x=>x.startsWith(id+':')?id+':'+value:x))}

  async function addTask(projectId){
    const title=(taskText[projectId]||'').trim();if(!title)return
    const project=projects.find(x=>x.id===projectId)
    const result=await supabase.from('project_tasks').insert({project_id:projectId,title,sort_order:(project?.project_tasks?.length||0)+1})
    if(result.error)setError(result.error.message)
    else{setTaskText(p=>({...p,[projectId]:''}));setAddingTask(p=>({...p,[projectId]:false}));await refresh()}
  }

  async function toggleTask(id,completed){const result=await supabase.from('project_tasks').update({completed,completed_at:completed?new Date().toISOString():null}).eq('id',id);if(result.error)setError(result.error.message);else await refresh()}
  async function removeProject(id){if(!window.confirm('Delete this project and its tasks?'))return;const result=await supabase.from('projects').delete().eq('id',id);if(result.error)setError(result.error.message);else await refresh()}
  async function removeTask(id){const result=await supabase.from('project_tasks').delete().eq('id',id);if(result.error)setError(result.error.message);else await refresh()}

  const activeCount=useMemo(()=>projects.filter(p=>p.status==='active').length,[projects])

  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><GitBranch size={28}/></div>
      <div><p className="eyebrow">ENGINEERING BUILD SYSTEM</p><h1>Projects</h1><p>Document real engineering builds with goals, tasks, dates, inventory, and measurable progress.</p></div>
      <button className="primary module-action" onClick={startCreate}><Plus size={17}/> NEW PROJECT</button>
    </section>
    {error&&<div className="data-error">{error}</div>}

    {creating&&<form className="panel record-form project-form" onSubmit={saveProject}>
      <div className="record-form-head"><div><p className="eyebrow">{editingId?'EDIT PROJECT':'CREATE PROJECT'}</p><h2>{editingId?'Edit Engineering Project':'New Engineering Project'}</h2></div><button type="button" className="ghost" onClick={cancel}><X size={14}/> CANCEL</button></div>
      <label><span>Name</span><input required autoFocus value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Tesla X Autonomous Car"/></label>
      <label><span>Goal</span><input value={form.goal} onChange={e=>setForm(p=>({...p,goal:e.target.value}))} placeholder="What are you trying to build?"/></label>
      <label><span>Status</span><select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}><option value="planned">Planned</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
      <label><span>Start Date</span><input type="date" value={form.start_date} onChange={e=>setForm(p=>({...p,start_date:e.target.value}))}/></label>
      <label><span>Due Date</span><input type="date" value={form.due_date} onChange={e=>setForm(p=>({...p,due_date:e.target.value}))}/></label>
      <label className="wide"><span>Description</span><textarea rows="3" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Project description..."/></label>
      <div className="wide component-picker"><div className="record-form-head"><div><p className="eyebrow">COMPONENTS USED</p><h3>Link inventory parts to this project</h3></div></div>{components.length===0?<span className="muted">Add components in Inventory first.</span>:<div className="picker-grid">{components.map(c=>{const selected=selectedParts.some(x=>x.startsWith(c.id+':'));return <div className={'picker-item '+(selected?'selected':'')} key={c.id}><button type="button" className="picker-main" onClick={()=>togglePart(c.id)}><span>{c.name}</span><small>{c.type||'component'}{c.value?' · '+c.value:''}</small></button>{selected&&<input type="number" min="1" value={quantityFor(c.id)} onChange={e=>setQuantity(c.id,e.target.value)}/>}</div>})}</div>}</div>
      <button className="primary" disabled={saving}>{saving?<Loader2 className="spin" size={15}/>:editingId?<Save size={15}/>:<Plus size={15}/>} {saving?'SAVING...':editingId?'UPDATE PROJECT':'CREATE PROJECT'}</button>
    </form>}

    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your projects...</span></div>:projects.length===0?<div className="panel data-state"><GitBranch size={36}/><h2>No projects yet.</h2><p>Create your first build and make progress measurable with tasks.</p><button className="primary" onClick={startCreate}><Plus size={16}/> CREATE FIRST PROJECT</button></div>:
      <div className="project-list"><div className="panel study-summary"><div><span>PROJECTS</span><strong>{projects.length}</strong></div><div><span>ACTIVE</span><strong>{activeCount}</strong></div></div>
        {projects.map(project=>{
          const stats=projectStats(project);const open=expanded[project.id]!==false
          return <section className="panel project-card" key={project.id}>
            <div className="project-header">
              <button className="tree-toggle" onClick={()=>setExpanded(p=>({...p,[project.id]:!open}))}>{open?<ChevronDown size={17}/>:<ChevronRight size={17}/>}</button>
              <div className="tree-icon"><GitBranch size={17}/></div>
              <div className="tree-main"><b>{project.name}</b><span>{project.goal||project.description||'Engineering project'}</span></div>
              <span className={'project-status status-'+project.status}>{project.status.toUpperCase()}</span>
              <strong className="project-percent">{stats.progress}%</strong>
              <div className="record-actions"><button className="icon-btn" title="Edit project" onClick={()=>startEdit(project)}><Pencil size={14}/></button><button className="icon-btn danger-btn" title="Delete project" onClick={()=>removeProject(project.id)}><Trash2 size={14}/></button></div>
            </div>
            {open&&<div className="project-body">
              <div className="progress project-progress"><i style={{width:stats.progress+'%'}}/></div>
              {project.description&&<p className="project-description">{project.description}</p>}
              <div className="project-meta"><span>{stats.completed}/{stats.total} tasks complete</span>{project.due_date&&<span>Due {project.due_date}</span>}</div>
              {(project.project_components||[]).length>0&&<div className="component-chip-list"><span className="eyebrow">PARTS USED</span>{project.project_components.map(link=><span className="tag" key={link.component_id}>{link.components?.name||'Component'} × {link.quantity}</span>)}</div>}
              <div className="task-list">{(project.project_tasks||[]).map(task=><div className={'project-task '+(task.completed?'task-done':'')} key={task.id}><button className={'requirement-check '+(task.completed?'checked':'')} onClick={()=>toggleTask(task.id,!task.completed)}>{task.completed&&<Check size={13}/>}</button><span>{task.title}</span><button className="icon-btn danger-btn" onClick={()=>removeTask(task.id)}><Trash2 size={12}/></button></div>)}</div>
              {addingTask[project.id]?<div className="add-task-row"><input autoFocus value={taskText[project.id]||''} onChange={e=>setTaskText(p=>({...p,[project.id]:e.target.value}))} placeholder="Task title..." onKeyDown={e=>{if(e.key==='Enter')addTask(project.id)}}/><button className="primary" onClick={()=>addTask(project.id)}>ADD</button><button className="ghost" onClick={()=>setAddingTask(p=>({...p,[project.id]:false}))}>CANCEL</button></div>:<button className="secondary add-task-button" onClick={()=>setAddingTask(p=>({...p,[project.id]:true}))}><Plus size={14}/> ADD TASK</button>}
            </div>}
          </section>
        })}
      </div>}
  </div>
}
