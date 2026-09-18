import { supabase } from './supabase'

function round(value, decimals=0){
  const factor=10**decimals
  return Math.round(value*factor)/factor
}

function isoDay(date){
  return new Date(date).toISOString().slice(0,10)
}

function buildProgressHistory(requirements){
  const total=requirements.length
  if(!total)return[]
  const dated=requirements.filter(item=>item.completed&&item.completed_at).map(item=>new Date(item.completed_at)).filter(date=>!Number.isNaN(date.getTime())).sort((a,b)=>a-b)
  if(!dated.length){
    const created=requirements.map(item=>new Date(item.created_at)).filter(date=>!Number.isNaN(date.getTime())).sort((a,b)=>a-b)[0]
    return created?[{label:created.toLocaleDateString([],{month:'short',day:'numeric'}),percent:0}]:[]
  }
  const byDay=new Map()
  dated.forEach(date=>{const key=isoDay(date);byDay.set(key,(byDay.get(key)||0)+1)})
  let completed=0
  const points=[]
  Array.from(byDay.entries()).forEach(([key,count])=>{
    completed+=count
    const date=new Date(key+'T12:00:00')
    points.push({label:date.toLocaleDateString([],{month:'short',day:'numeric'}),percent:round(completed/total*100)})
  })
  if(points.length===1)points.unshift({label:'START',percent:0})
  if(points.length>7){
    const sampled=[];const step=(points.length-1)/6
    for(let i=0;i<7;i+=1)sampled.push(points[Math.round(i*step)])
    return sampled
  }
  return points
}

function buildRecentActivity({notes,tests,circuits,components,projects,mistakes,study}){
  const items=[]
  notes.forEach(item=>items.push({at:item.updated_at||item.created_at,type:'Note',verb:'Updated',text:item.title}))
  tests.forEach(item=>items.push({at:item.created_at,type:'Test',verb:'Recorded',text:item.name}))
  circuits.forEach(item=>items.push({at:item.created_at,type:'Circuit',verb:'Saved',text:item.name}))
  components.forEach(item=>items.push({at:item.created_at,type:'Component',verb:'Added',text:item.name+' × '+item.quantity}))
  projects.forEach(item=>items.push({at:item.created_at,type:'Project',verb:'Created',text:item.name}))
  mistakes.forEach(item=>items.push({at:item.created_at,type:'Mistake',verb:'Logged',text:(item.question||'Engineering mistake').slice(0,80)}))
  study.filter(item=>item.ended_at).forEach(item=>items.push({at:item.started_at,type:'Study',verb:'Studied',text:(Number(item.duration_minutes)||0)+' min'+(item.summary?' · '+item.summary.slice(0,55):'')}))
  return items.filter(item=>item.at).sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,8)
}

export async function getDashboardData(){
  const results=await Promise.all([
    supabase.from('subject_progress').select('id,name,unit_count,progress').order('name'),
    supabase.from('lesson_progress').select('id,unit_id,requirement_count,completed_count,progress'),
    supabase.from('lesson_requirements').select('id,lesson_id,completed,completed_at,created_at'),
    supabase.from('notes').select('id,title,created_at,updated_at').order('updated_at',{ascending:false}).limit(20),
    supabase.from('tests').select('id,name,score,max_score,test_date,created_at').order('test_date',{ascending:false}).limit(20),
    supabase.from('circuits').select('id,name,created_at').order('created_at',{ascending:false}).limit(20),
    supabase.from('components').select('id,name,quantity,created_at').order('created_at',{ascending:false}).limit(100),
    supabase.from('projects').select('id,name,status,created_at').order('created_at',{ascending:false}).limit(50),
    supabase.from('mistakes').select('id,question,resolved,created_at').order('created_at',{ascending:false}).limit(50),
    supabase.from('study_sessions').select('id,started_at,ended_at,duration_minutes,summary').order('started_at',{ascending:false}).limit(100),
  ])
  const firstError=results.map(item=>item.error).find(Boolean)
  if(firstError)throw firstError

  const subjects=results[0].data||[]
  const lessons=results[1].data||[]
  const requirements=results[2].data||[]
  const notes=results[3].data||[]
  const tests=results[4].data||[]
  const circuits=results[5].data||[]
  const components=results[6].data||[]
  const projects=results[7].data||[]
  const mistakes=results[8].data||[]
  const study=results[9].data||[]

  const totalRequirements=requirements.length
  const completedRequirements=requirements.filter(item=>item.completed).length
  const overallProgress=totalRequirements?round(completedRequirements/totalRequirements*100):0
  const coreLoad=totalRequirements?round((totalRequirements-completedRequirements)/totalRequirements*100):0

  const scoredTests=tests.filter(item=>item.score!=null&&item.max_score)
  const testAverage=scoredTests.length?round(scoredTests.reduce((sum,item)=>sum+Number(item.score)/Number(item.max_score)*100,0)/scoredTests.length,1):null
  const studyMinutes=study.reduce((sum,item)=>sum+(Number(item.duration_minutes)||0),0)
  const componentQuantity=components.reduce((sum,item)=>sum+(Number(item.quantity)||0),0)

  const weekStart=new Date();weekStart.setHours(0,0,0,0);weekStart.setDate(weekStart.getDate()-weekStart.getDay())
  const weekStudyMinutes=study.filter(item=>item.started_at&&new Date(item.started_at)>=weekStart).reduce((sum,item)=>sum+(Number(item.duration_minutes)||0),0)

  const testTrend=scoredTests.slice().sort((a,b)=>new Date(a.test_date)-new Date(b.test_date)).slice(-8).map(test=>({label:new Date(test.test_date+'T12:00:00').toLocaleDateString([],{month:'short',day:'numeric'}),percent:round(Number(test.score)/Number(test.max_score)*100,1)}))

  return{
    overallProgress,coreLoad,totalRequirements,completedRequirements,
    masteredLessons:lessons.filter(item=>item.requirement_count>0&&item.progress===100).length,
    lessonCount:lessons.length,
    studyHours:round(studyMinutes/60,1),
    weekStudyHours:round(weekStudyMinutes/60,1),
    studySessionCount:study.filter(item=>item.ended_at).length,
    projectCount:projects.length,
    activeProjectCount:projects.filter(item=>item.status==='active').length,
    notesCount:notes.length,
    testCount:tests.length,
    testAverage,
    circuitsCount:circuits.length,
    componentCount:components.length,
    componentQuantity,
    mistakesCount:mistakes.length,
    unresolvedMistakes:mistakes.filter(item=>!item.resolved).length,
    subjects,lessons,
    progressHistory:buildProgressHistory(requirements),
    latestTests:tests.slice(0,5),
    testTrend,
    recentActivity:buildRecentActivity({notes,tests,circuits,components,projects,mistakes,study}),
  }
}
