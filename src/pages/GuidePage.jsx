import { BookOpen, Database, GitBranch, ShieldCheck, Wrench } from 'lucide-react'

const sections=[
  {icon:BookOpen,title:'Start with Curriculum',text:'Build Subject → Unit → Lesson → Requirement. Mark requirements complete as you actually master them. Engineering Progress and Core Load update automatically.'},
  {icon:BookOpen,title:'Capture Learning',text:'Use Notes for explanations and Test records for assessment results. Add question-level evidence when you want to understand exactly what happened.'},
  {icon:ShieldCheck,title:'Turn Errors into Data',text:'Use Mistakes to record the problem, your answer, the correct answer, what went wrong, and what you learned. Resolved mistakes stay in your history.'},
  {icon:GitBranch,title:'Connect Builds',text:'Circuits and Projects can link components and later connect to notes, tests, and mistakes through the knowledge graph.'},
  {icon:Database,title:'Protect Your Data',text:'Your rows are authenticated and protected by Supabase RLS. Files use a private Storage bucket with user-scoped folders. Never put a service-role key in the browser.'},
  {icon:Wrench,title:'Use Engineering Tools',text:'The Tools workspace provides quick Ohm’s Law, power, resistor, and electrical-unit calculations. Save the reasoning in your records when the result matters.'},
]

export default function GuidePage(){
  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><BookOpen size={28}/></div>
      <div><p className="eyebrow">SYSTEM MANUAL</p><h1>Lab Guide</h1><p>A practical guide to using Jay's Engineering Lab without guessing what each module is for.</p></div>
    </section>
    <div className="guide-grid">{sections.map(({icon:Icon,title,text})=><article className="panel guide-card" key={title}><div className="guide-icon"><Icon size={18}/></div><div><p className="eyebrow">WORKFLOW</p><h2>{title}</h2><p>{text}</p></div></article>)}</div>
    <section className="panel guide-card guide-rule"><div className="guide-icon"><ShieldCheck size={18}/></div><div><p className="eyebrow">LAB RULE</p><h2>A button is not a finished feature.</h2><p>A workflow is finished only when the record saves, survives refresh, can be edited or removed safely, respects ownership, and contributes correctly to the data that depends on it.</p></div></section>
  </div>
}
