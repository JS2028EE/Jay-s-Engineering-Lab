import { supabase } from './supabase'

export async function getDashboardData() {
  const results = await Promise.all([
    supabase.from('subject_progress').select('id,name,unit_count,progress').order('name'),
    supabase.from('lesson_progress').select('id,progress'),
    supabase.from('projects').select('id,status'),
    supabase.from('study_sessions').select('duration_minutes').not('duration_minutes', 'is', null),
  ])

  const firstError = results.map(function (item) { return item.error }).find(Boolean)
  if (firstError) throw firstError

  const subjects = results[0].data || []
  const lessons = results[1].data || []
  const projects = results[2].data || []
  const study = results[3].data || []

  return {
    overallProgress: subjects.length ? Math.round(subjects.reduce(function (sum, item) { return sum + item.progress }, 0) / subjects.length) : 0,
    masteredLessons: lessons.filter(function (item) { return item.progress === 100 }).length,
    studyHours: Math.round((study.reduce(function (sum, item) { return sum + (item.duration_minutes || 0) }, 0) / 60) * 10) / 10,
    projectCount: projects.length,
    activeProjectCount: projects.filter(function (item) { return item.status === 'active' }).length,
    subjects: subjects,
  }
}
