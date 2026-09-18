import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronRight, GraduationCap, Loader2, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const emptyForm = { type: 'subject', parentId: '', name: '', description: '' }

function lessonProgress(lesson) {
  const requirements = lesson.lesson_requirements || []
  const completed = requirements.filter(function (item) { return item.completed }).length
  return {
    completed: completed,
    total: requirements.length,
    progress: requirements.length ? Math.round((completed / requirements.length) * 100) : 0,
  }
}

function unitProgress(unit) {
  const lessons = unit.lessons || []
  return lessons.length
    ? Math.round(lessons.reduce(function (sum, lesson) { return sum + lessonProgress(lesson).progress }, 0) / lessons.length)
    : 0
}

function subjectProgress(subject) {
  const units = subject.units || []
  return units.length
    ? Math.round(units.reduce(function (sum, unit) { return sum + unitProgress(unit) }, 0) / units.length)
    : 0
}

async function loadCurriculum() {
  const result = await supabase.from('subjects').select(
    'id, name, description, sort_order, units (id, name, description, sort_order, lessons (id, name, description, sort_order, lesson_requirements (id, requirement, completed, sort_order)))'
  ).order('sort_order', { ascending: true })
  if (result.error) throw result.error

  return (result.data || []).map(function (subject) {
    subject.units = (subject.units || []).sort(function (a, b) { return a.sort_order - b.sort_order }).map(function (unit) {
      unit.lessons = (unit.lessons || []).sort(function (a, b) { return a.sort_order - b.sort_order }).map(function (lesson) {
        lesson.lesson_requirements = (lesson.lesson_requirements || []).sort(function (a, b) { return a.sort_order - b.sort_order })
        return lesson
      })
      return unit
    })
    return subject
  })
}

export default function CurriculumPage() {
  const [subjects, setSubjects] = useState([])
  const [expanded, setExpanded] = useState({})
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      setSubjects(await loadCurriculum())
    } catch (err) {
      setError(err.message || 'Could not load your curriculum.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(function () { refresh() }, [])

  function start(type, parentId) {
    setForm({ type: type, parentId: parentId || '', name: '', description: '' })
    setError('')
  }

  function cancel() {
    setForm(emptyForm)
  }

  async function createRecord(event) {
    event.preventDefault()
    const name = form.name.trim()
    if (!name) return

    setSaving(true)
    setError('')
    try {
      const tables = {
        subject: { table: 'subjects', payload: { name: name, description: form.description.trim() || null } },
        unit: { table: 'units', payload: { subject_id: form.parentId, name: name, description: form.description.trim() || null } },
        lesson: { table: 'lessons', payload: { unit_id: form.parentId, name: name, description: form.description.trim() || null } },
        requirement: { table: 'lesson_requirements', payload: { lesson_id: form.parentId, requirement: name } },
      }
      const target = tables[form.type]
      const result = await supabase.from(target.table).insert(target.payload)
      if (result.error) throw result.error
      cancel()
      await refresh()
    } catch (err) {
      setError(err.message || 'Could not save record.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleRequirement(id, completed) {
    setError('')
    const result = await supabase.from('lesson_requirements').update({
      completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    }).eq('id', id)
    if (result.error) setError(result.error.message)
    else await refresh()
  }

  async function remove(type, id) {
    const labels = { subject: 'subject', unit: 'unit', lesson: 'lesson', requirement: 'requirement' }
    if (!window.confirm('Delete this ' + labels[type] + '? Child records may also be removed.')) return
    const tables = { subject: 'subjects', unit: 'units', lesson: 'lessons', requirement: 'lesson_requirements' }
    const result = await supabase.from(tables[type]).delete().eq('id', id)
    if (result.error) setError(result.error.message)
    else await refresh()
  }

  const overall = useMemo(function () {
    return subjects.length
      ? Math.round(subjects.reduce(function (sum, subject) { return sum + subjectProgress(subject) }, 0) / subjects.length)
      : 0
  }, [subjects])

  const unitCount = subjects.reduce(function (sum, subject) { return sum + (subject.units || []).length }, 0)
  const lessonCount = subjects.reduce(function (sum, subject) {
    return sum + (subject.units || []).reduce(function (n, unit) { return n + (unit.lessons || []).length }, 0)
  }, 0)

  return (
    <div className="content">
      <section className="module-hero">
        <div className="module-icon"><GraduationCap size={28} /></div>
        <div>
          <p className="eyebrow">ENGINEERING KNOWLEDGE SYSTEM</p>
          <h1>Curriculum</h1>
          <p>Build your own Subject → Unit → Lesson → Requirement hierarchy. Progress comes from your actual completed requirements.</p>
        </div>
        <button className="primary module-action" onClick={function () { start('subject') }}><Plus size={17} /> NEW SUBJECT</button>
      </section>

      {error && <div className="data-error">{error}</div>}

      <section className="panel curriculum-toolbar">
        <div>
          <p className="eyebrow">OVERALL MASTERY</p>
          <strong className="curriculum-percent">{overall}%</strong>
        </div>
        <div className="progress curriculum-progress"><i style={{ width: overall + '%' }} /></div>
        <div className="curriculum-counts">
          <span><b>{subjects.length}</b> subjects</span>
          <span><b>{unitCount}</b> units</span>
          <span><b>{lessonCount}</b> lessons</span>
        </div>
      </section>

      {(form.name || form.type !== 'subject') && (
        <form className="panel record-form" onSubmit={createRecord}>
          <div className="record-form-head">
            <div><p className="eyebrow">CREATE RECORD</p><h2>{form.type === 'subject' ? 'New Subject' : form.type === 'unit' ? 'New Unit' : form.type === 'lesson' ? 'New Lesson' : 'New Lesson Requirement'}</h2></div>
            <button type="button" className="ghost" onClick={cancel}>CANCEL</button>
          </div>
          <label><span>{form.type === 'requirement' ? 'Requirement' : 'Name'}</span><input autoFocus required value={form.name} onChange={function (event) { setForm(function (prev) { return { ...prev, name: event.target.value } }) }} placeholder={form.type === 'requirement' ? 'e.g. Rearrange V = IR' : 'Enter a name...'} /></label>
          {form.type !== 'requirement' && <label><span>Description</span><textarea rows="2" value={form.description} onChange={function (event) { setForm(function (prev) { return { ...prev, description: event.target.value } }) }} placeholder="Optional..." /></label>}
          <button className="primary" disabled={saving}>{saving ? <Loader2 className="spin" size={15}/> : <Plus size={15}/>} {saving ? 'SAVING...' : 'SAVE RECORD'}</button>
        </form>
      )}

      {loading ? (
        <div className="panel data-state"><Loader2 className="spin" size={22} /><span>Loading your curriculum...</span></div>
      ) : subjects.length === 0 ? (
        <div className="panel data-state">
          <GraduationCap size={36} />
          <h2>Your curriculum is empty.</h2>
          <p>Start from scratch. Create your first subject, then build units, lessons, and mastery requirements underneath it.</p>
          <button className="primary" onClick={function () { start('subject') }}><Plus size={16}/> CREATE FIRST SUBJECT</button>
        </div>
      ) : (
        <div className="curriculum-tree">
          {subjects.map(function (subject) {
            const open = expanded['s:' + subject.id] !== false
            return (
              <section className="panel tree-node" key={subject.id}>
                <div className="tree-row">
                  <button className="tree-toggle" onClick={function () { setExpanded(function (prev) { return { ...prev, ['s:' + subject.id]: !open } }) }}>{open ? <ChevronDown size={17}/> : <ChevronRight size={17}/>}</button>
                  <div className="tree-icon"><GraduationCap size={17}/></div>
                  <div className="tree-main"><b>{subject.name}</b><span>{subject.description || ((subject.units || []).length + ' units')}</span></div>
                  <div className="tree-progress"><strong>{subjectProgress(subject)}%</strong><div className="progress thin"><i style={{ width: subjectProgress(subject) + '%' }}/></div></div>
                  <button className="icon-btn" title="Add unit" onClick={function () { start('unit', subject.id) }}><Plus size={15}/></button>
                  <button className="icon-btn danger-btn" title="Delete subject" onClick={function () { remove('subject', subject.id) }}><Trash2 size={14}/></button>
                </div>
                {open && <div className="tree-children">
                  {(subject.units || []).map(function (unit) {
                    const unitOpen = expanded['u:' + unit.id] !== false
                    return (
                      <div className="tree-node nested" key={unit.id}>
                        <div className="tree-row">
                          <button className="tree-toggle" onClick={function () { setExpanded(function (prev) { return { ...prev, ['u:' + unit.id]: !unitOpen } }) }}>{unitOpen ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}</button>
                          <div className="tree-icon small"><span>U</span></div>
                          <div className="tree-main"><b>{unit.name}</b><span>{unit.description || ((unit.lessons || []).length + ' lessons')}</span></div>
                          <div className="tree-progress"><strong>{unitProgress(unit)}%</strong><div className="progress thin"><i style={{ width: unitProgress(unit) + '%' }}/></div></div>
                          <button className="icon-btn" title="Add lesson" onClick={function () { start('lesson', unit.id) }}><Plus size={15}/></button>
                          <button className="icon-btn danger-btn" title="Delete unit" onClick={function () { remove('unit', unit.id) }}><Trash2 size={14}/></button>
                        </div>
                        {unitOpen && <div className="tree-children">
                          {(unit.lessons || []).map(function (lesson) {
                            const lessonOpen = expanded['l:' + lesson.id] !== false
                            const stats = lessonProgress(lesson)
                            return (
                              <div className="tree-node nested lesson-node" key={lesson.id}>
                                <div className="tree-row">
                                  <button className="tree-toggle" onClick={function () { setExpanded(function (prev) { return { ...prev, ['l:' + lesson.id]: !lessonOpen } }) }}>{lessonOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</button>
                                  <div className="tree-icon small lesson-icon"><span>L</span></div>
                                  <div className="tree-main"><b>{lesson.name}</b><span>{lesson.description || (stats.completed + '/' + stats.total + ' requirements')}</span></div>
                                  <div className="tree-progress"><strong>{stats.progress}%</strong><div className="progress thin"><i style={{ width: stats.progress + '%' }}/></div></div>
                                  <button className="icon-btn" title="Add requirement" onClick={function () { start('requirement', lesson.id) }}><Plus size={14}/></button>
                                  <button className="icon-btn danger-btn" title="Delete lesson" onClick={function () { remove('lesson', lesson.id) }}><Trash2 size={13}/></button>
                                </div>
                                {lessonOpen && <div className="requirement-list">
                                  {(lesson.lesson_requirements || []).map(function (requirement) {
                                    return (
                                      <div className={'requirement ' + (requirement.completed ? 'requirement-done' : '')} key={requirement.id}>
                                        <button className={'requirement-check ' + (requirement.completed ? 'checked' : '')} onClick={function () { toggleRequirement(requirement.id, !requirement.completed) }}>{requirement.completed && <Check size={13}/>}</button>
                                        <span>{requirement.requirement}</span>
                                        <button className="icon-btn danger-btn" title="Delete requirement" onClick={function () { remove('requirement', requirement.id) }}><Trash2 size={12}/></button>
                                      </div>
                                    )
                                  })}
                                </div>}
                              </div>
                            )
                          })}
                        </div>}
                      </div>
                    )
                  })}
                </div>}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
