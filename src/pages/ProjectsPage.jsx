import { useEffect, useState } from 'react'
import { Check, ChevronDown, ChevronRight, GitBranch, Loader2, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const blank = { name: '', description: '', goal: '', status: 'planned', start_date: '', due_date: '' }

function projectStats(project) {
  const tasks = project.project_tasks || []
  const completed = tasks.filter(function (task) { return task.completed }).length
  return { total: tasks.length, completed: completed, progress: tasks.length ? Math.round(completed / tasks.length * 100) : 0 }
}

async function loadProjects() {
  const result = await supabase.from('projects').select(
    'id,name,description,goal,status,start_date,due_date,created_at,project_tasks(id,title,description,completed,sort_order)'
  ).order('created_at', { ascending: false })
  if (result.error) throw result.error
  return result.data || []
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [creating, setCreating] = useState(false)
  const [addingTask, setAddingTask] = useState({})
  const [expanded, setExpanded] = useState({})
  const [form, setForm] = useState(blank)
  const [taskText, setTaskText] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    try {
      const data = await loadProjects()
      data.forEach(function (project) {
        project.project_tasks = (project.project_tasks || []).sort(function (a, b) { return a.sort_order - b.sort_order })
      })
      setProjects(data)
    } catch (err) {
      setError(err.message || 'Could not load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(function () { refresh() }, [])

  function openCreate() {
    setForm(blank)
    setCreating(true)
    setError('')
  }

  async function createProject(event) {
    event.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError('')
    const result = await supabase.from('projects').insert({
      name: form.name.trim(),
      description: form.description.trim() || null,
      goal: form.goal.trim() || null,
      status: form.status,
      start_date: form.start_date || null,
      due_date: form.due_date || null,
    })
    if (result.error) setError(result.error.message)
    else {
      setCreating(false)
      setForm(blank)
      await refresh()
    }
    setSaving(false)
  }

  async function addTask(projectId) {
    const title = (taskText[projectId] || '').trim()
    if (!title) return
    const project = projects.find(function (item) { return item.id === projectId })
    const result = await supabase.from('project_tasks').insert({
      project_id: projectId,
      title: title,
      sort_order: (project?.project_tasks?.length || 0) + 1,
    })
    if (result.error) setError(result.error.message)
    else {
      setTaskText(function (prev) { return { ...prev, [projectId]: '' } })
      setAddingTask(function (prev) { return { ...prev, [projectId]: false } })
      await refresh()
    }
  }

  async function toggleTask(id, completed) {
    const result = await supabase.from('project_tasks').update({
      completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    }).eq('id', id)
    if (result.error) setError(result.error.message)
    else await refresh()
  }

  async function removeProject(id) {
    if (!window.confirm('Delete this project and its tasks?')) return
    const result = await supabase.from('projects').delete().eq('id', id)
    if (result.error) setError(result.error.message)
    else await refresh()
  }

  async function removeTask(id) {
    const result = await supabase.from('project_tasks').delete().eq('id', id)
    if (result.error) setError(result.error.message)
    else await refresh()
  }

  return (
    <div className="content">
      <section className="module-hero">
        <div className="module-icon"><GitBranch size={28} /></div>
        <div>
          <p className="eyebrow">ENGINEERING BUILD SYSTEM</p>
          <h1>Projects</h1>
          <p>Document real engineering builds with goals, status, dates, and task-based progress.</p>
        </div>
        <button className="primary module-action" onClick={openCreate}><Plus size={17} /> NEW PROJECT</button>
      </section>

      {error && <div className="data-error">{error}</div>}

      {creating && (
        <form className="panel record-form project-form" onSubmit={createProject}>
          <div className="record-form-head">
            <div><p className="eyebrow">CREATE PROJECT</p><h2>New Engineering Project</h2></div>
            <button type="button" className="ghost" onClick={function () { setCreating(false) }}>CANCEL</button>
          </div>
          <label><span>Name</span><input required autoFocus value={form.name} onChange={function (e) { setForm(function (p) { return { ...p, name: e.target.value } }) }} placeholder="e.g. Tesla X Autonomous Car" /></label>
          <label><span>Goal</span><input value={form.goal} onChange={function (e) { setForm(function (p) { return { ...p, goal: e.target.value } }) }} placeholder="What are you trying to build?" /></label>
          <label><span>Status</span><select value={form.status} onChange={function (e) { setForm(function (p) { return { ...p, status: e.target.value } }) }}><option value="planned">Planned</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
          <label><span>Start Date</span><input type="date" value={form.start_date} onChange={function (e) { setForm(function (p) { return { ...p, start_date: e.target.value } }) }} /></label>
          <label><span>Due Date</span><input type="date" value={form.due_date} onChange={function (e) { setForm(function (p) { return { ...p, due_date: e.target.value } }) }} /></label>
          <label className="wide"><span>Description</span><textarea rows="3" value={form.description} onChange={function (e) { setForm(function (p) { return { ...p, description: e.target.value } }) }} placeholder="Project description..." /></label>
          <button className="primary" disabled={saving}>{saving ? <Loader2 className="spin" size={15}/> : <Plus size={15}/>} {saving ? 'CREATING...' : 'CREATE PROJECT'}</button>
        </form>
      )}

      {loading ? (
        <div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your projects...</span></div>
      ) : projects.length === 0 ? (
        <div className="panel data-state"><GitBranch size={36}/><h2>No projects yet.</h2><p>Create your first build and use tasks to make progress measurable.</p><button className="primary" onClick={openCreate}><Plus size={16}/> CREATE FIRST PROJECT</button></div>
      ) : (
        <div className="project-list">
          {projects.map(function (project) {
            const stats = projectStats(project)
            const open = expanded[project.id] !== false
            return (
              <section className="panel project-card" key={project.id}>
                <div className="project-header">
                  <button className="tree-toggle" onClick={function () { setExpanded(function (p) { return { ...p, [project.id]: !open } }) }}>{open ? <ChevronDown size={17}/> : <ChevronRight size={17}/>}</button>
                  <div className="tree-icon"><GitBranch size={17}/></div>
                  <div className="tree-main"><b>{project.name}</b><span>{project.goal || project.description || 'Engineering project'}</span></div>
                  <span className={'project-status status-' + project.status}>{project.status.toUpperCase()}</span>
                  <strong className="project-percent">{stats.progress}%</strong>
                  <button className="icon-btn danger-btn" title="Delete project" onClick={function () { removeProject(project.id) }}><Trash2 size={14}/></button>
                </div>
                {open && <div className="project-body">
                  <div className="progress project-progress"><i style={{ width: stats.progress + '%' }}/></div>
                  {project.description && <p className="project-description">{project.description}</p>}
                  <div className="project-meta"><span>{stats.completed}/{stats.total} tasks complete</span>{project.due_date && <span>Due {project.due_date}</span>}</div>
                  <div className="task-list">
                    {(project.project_tasks || []).map(function (task) {
                      return <div className={'project-task ' + (task.completed ? 'task-done' : '')} key={task.id}>
                        <button className={'requirement-check ' + (task.completed ? 'checked' : '')} onClick={function () { toggleTask(task.id, !task.completed) }}>{task.completed && <Check size={13}/>}</button>
                        <span>{task.title}</span>
                        <button className="icon-btn danger-btn" onClick={function () { removeTask(task.id) }}><Trash2 size={12}/></button>
                      </div>
                    })}
                  </div>
                  {addingTask[project.id] ? (
                    <div className="add-task-row"><input autoFocus value={taskText[project.id] || ''} onChange={function (e) { setTaskText(function (p) { return { ...p, [project.id]: e.target.value } }) }} placeholder="Task title..." onKeyDown={function (e) { if (e.key === 'Enter') addTask(project.id) }}/><button className="primary" onClick={function () { addTask(project.id) }}>ADD</button><button className="ghost" onClick={function () { setAddingTask(function (p) { return { ...p, [project.id]: false } }) }}>CANCEL</button></div>
                  ) : <button className="secondary add-task-button" onClick={function () { setAddingTask(function (p) { return { ...p, [project.id]: true } }) }}><Plus size={14}/> ADD TASK</button>}
                </div>}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
