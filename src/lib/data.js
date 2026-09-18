import { supabase } from './supabase'

function round(value, decimals = 0) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function buildProgressHistory(requirements) {
  const total = requirements.length
  if (!total) return []

  const dated = requirements
    .filter(item => item.completed && item.completed_at)
    .map(item => ({ date: new Date(item.completed_at), createdAt: new Date(item.created_at) }))
    .sort((a, b) => a.date - b.date)

  if (!dated.length) {
    const created = requirements
      .map(item => new Date(item.created_at))
      .filter(date => !Number.isNaN(date.getTime()))
      .sort((a, b) => a - b)[0]

    return created
      ? [{ label: created.toLocaleDateString([], { month: 'short', day: 'numeric' }), percent: 0 }]
      : []
  }

  const byDay = new Map()
  dated.forEach(item => {
    const key = item.date.toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) || 0) + 1)
  })

  let completed = 0
  const points = []
  Array.from(byDay.entries()).forEach(([key, count]) => {
    completed += count
    const date = new Date(key + 'T12:00:00')
    points.push({
      label: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      percent: round((completed / total) * 100),
    })
  })

  if (points.length === 1) {
    points.unshift({ label: 'START', percent: 0 })
  }

  if (points.length > 7) {
    const sampled = []
    const step = (points.length - 1) / 6
    for (let i = 0; i < 7; i += 1) {
      sampled.push(points[Math.round(i * step)])
    }
    return sampled
  }

  return points
}

export async function getDashboardData() {
  const results = await Promise.all([
    supabase.from('subject_progress').select('id,name,unit_count,progress').order('name'),
    supabase.from('lesson_progress').select('id,unit_id,requirement_count,completed_count,progress'),
    supabase.from('lesson_requirements').select('id,lesson_id,completed,completed_at,created_at'),
    supabase.from('notes').select('id', { count: 'exact', head: true }),
    supabase.from('tests').select('id,score,max_score,test_date').order('test_date', { ascending: false }),
    supabase.from('circuits').select('id', { count: 'exact', head: true }),
    supabase.from('components').select('id,quantity'),
    supabase.from('projects').select('id,status'),
    supabase.from('mistakes').select('id,resolved'),
    supabase.from('study_sessions').select('id,duration_minutes'),
  ])

  const firstError = results.map(item => item.error).find(Boolean)
  if (firstError) throw firstError

  const subjects = results[0].data || []
  const lessons = results[1].data || []
  const requirements = results[2].data || []
  const notesCount = results[3].count || 0
  const tests = results[4].data || []
  const circuitsCount = results[5].count || 0
  const components = results[6].data || []
  const projects = results[7].data || []
  const mistakes = results[8].data || []
  const study = results[9].data || []

  const totalRequirements = requirements.length
  const completedRequirements = requirements.filter(item => item.completed).length
  const overallProgress = totalRequirements ? round((completedRequirements / totalRequirements) * 100) : 0
  const coreLoad = totalRequirements ? round(((totalRequirements - completedRequirements) / totalRequirements) * 100) : 0

  const scoredTests = tests.filter(item => item.score != null && item.max_score)
  const testAverage = scoredTests.length
    ? round(scoredTests.reduce((sum, item) => sum + (Number(item.score) / Number(item.max_score)) * 100, 0) / scoredTests.length, 1)
    : null

  const studyMinutes = study.reduce((sum, item) => sum + (Number(item.duration_minutes) || 0), 0)
  const componentQuantity = components.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

  return {
    overallProgress,
    coreLoad,
    totalRequirements,
    completedRequirements,
    masteredLessons: lessons.filter(item => item.requirement_count > 0 && item.progress === 100).length,
    lessonCount: lessons.length,
    studyHours: round(studyMinutes / 60, 1),
    projectCount: projects.length,
    activeProjectCount: projects.filter(item => item.status === 'active').length,
    notesCount,
    testCount: tests.length,
    testAverage,
    circuitsCount,
    componentCount: components.length,
    componentQuantity,
    mistakesCount: mistakes.length,
    unresolvedMistakes: mistakes.filter(item => !item.resolved).length,
    subjects,
    lessons,
    progressHistory: buildProgressHistory(requirements),
    latestTests: tests.slice(0, 5),
  }
}
