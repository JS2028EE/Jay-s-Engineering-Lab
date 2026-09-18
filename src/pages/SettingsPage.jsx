import { useState } from 'react'
import { Download, Loader2, Settings, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

const tables = [
  'subjects','units','lessons','lesson_requirements','topics','notes','tests','test_questions',
  'mistakes','component_locations','components','projects','project_tasks','project_components',
  'circuits','circuit_components','study_sessions','wellness_categories','wellness_habits',
  'habit_goals','wellness_checkins','files','tags','entity_tags','relationships'
]

export default function SettingsPage() {
  const [exporting,setExporting] = useState(false)
  const [message,setMessage] = useState('')
  const [error,setError] = useState('')

  async function exportData() {
    setExporting(true)
    setMessage('')
    setError('')
    try {
      const data = {}
      for (const table of tables) {
        const result = await supabase.from(table).select('*')
        if (result.error) throw result.error
        data[table] = result.data || []
      }
      const payload = { exported_at:new Date().toISOString(), version:'0.3.1', data }
      const blob = new Blob([JSON.stringify(payload,null,2)], { type:'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'jays-engineering-lab-export-' + new Date().toISOString().slice(0,10) + '.json'
      anchor.click()
      URL.revokeObjectURL(url)
      setMessage('Export created successfully. Keep a copy somewhere safe.')
    } catch (err) {
      setError(err.message || 'Could not export your Lab data.')
    }
    setExporting(false)
  }

  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><Settings size={28}/></div>
      <div><p className="eyebrow">LAB SYSTEM CONTROL</p><h1>Settings</h1><p>Protect and manage the system behind your Engineering Lab.</p></div>
    </section>
    {error && <div className="data-error">{error}</div>}
    {message && <div className="success-message">{message}</div>}

    <section className="settings-grid">
      <div className="panel settings-card">
        <div className="panel-head"><div><p className="eyebrow">BACKUP</p><h2>Export Lab Data</h2></div><Download size={18}/></div>
        <p>Download a JSON snapshot of the records your account can access. This covers database data, while binary Storage files remain in Supabase Storage.</p>
        <button className="primary" onClick={exportData} disabled={exporting}>{exporting ? <Loader2 className="spin" size={15}/> : <Download size={15}/>} {exporting ? 'EXPORTING...' : 'EXPORT ALL DATA'}</button>
      </div>
      <div className="panel settings-card">
        <div className="panel-head"><div><p className="eyebrow">SECURITY</p><h2>Account Protection</h2></div><ShieldCheck size={18}/></div>
        <div className="health-row"><span>Authentication</span><b>SUPABASE AUTH</b></div>
        <div className="health-row"><span>Database access</span><b>RLS ENABLED</b></div>
        <div className="health-row"><span>Frontend key policy</span><b>PUBLIC ONLY</b></div>
        <p className="settings-note">Never place a service-role key in frontend environment variables or browser code.</p>
      </div>
    </section>

    <section className="panel settings-card">
      <div className="panel-head"><div><p className="eyebrow">SYSTEM PRINCIPLE</p><h2>Data Is the Source of Truth</h2></div></div>
      <p>Dashboard and Analytics values are derived from stored records. Progress bars represent calculated state, not manually assigned percentages.</p>
      <div className="workspace-tags"><span>REAL DATA</span><span>RLS</span><span>CLOUD PERSISTENCE</span><span>CALCULATED METRICS</span></div>
    </section>
  </div>
}
