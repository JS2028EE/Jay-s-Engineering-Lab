import { useEffect, useState } from 'react'
import { Download, FileText, Loader2, Paperclip, Plus, Trash2, UploadCloud } from 'lucide-react'
import { supabase } from '../lib/supabase'

const BUCKET='engineering-lab-files'

function safeName(name){return name.replace(/[^a-zA-Z0-9._-]/g,'_')}

export default function FilesPage(){
  const [files,setFiles]=useState([])
  const [selected,setSelected]=useState(null)
  const [loading,setLoading]=useState(true)
  const [uploading,setUploading]=useState(false)
  const [error,setError]=useState('')

  async function refresh(){
    setLoading(true);setError('')
    const result=await supabase.from('files').select('id,file_name,mime_type,size_bytes,bucket,storage_path,created_at').order('created_at',{ascending:false})
    if(result.error)setError(result.error.message);else setFiles(result.data||[])
    setLoading(false)
  }

  useEffect(()=>{refresh()},[])

  async function upload(){
    if(!selected)return
    setUploading(true);setError('')
    const {data:{user}}=await supabase.auth.getUser()
    if(!user){setError('Your session expired. Please sign in again.');setUploading(false);return}
    const path=user.id+'/'+crypto.randomUUID()+'-'+safeName(selected.name)
    const uploadResult=await supabase.storage.from(BUCKET).upload(path,selected,{upsert:false,contentType:selected.type||'application/octet-stream'})
    if(uploadResult.error){setError(uploadResult.error.message);setUploading(false);return}
    const result=await supabase.from('files').insert({bucket:BUCKET,storage_path:path,file_name:selected.name,mime_type:selected.type||null,size_bytes:selected.size})
    if(result.error){
      await supabase.storage.from(BUCKET).remove([path])
      setError(result.error.message)
    }else{
      setSelected(null)
      await refresh()
      window.dispatchEvent(new Event('jel-record-created'))
    }
    setUploading(false)
  }

  async function download(file){
    const result=await supabase.storage.from(file.bucket).createSignedUrl(file.storage_path,60)
    if(result.error)setError(result.error.message)
    else window.open(result.data.signedUrl,'_blank','noopener,noreferrer')
  }

  async function remove(file){
    if(!window.confirm('Delete this file from the Lab?'))return
    const storage=await supabase.storage.from(file.bucket).remove([file.storage_path])
    if(storage.error){setError(storage.error.message);return}
    const result=await supabase.from('files').delete().eq('id',file.id)
    if(result.error)setError(result.error.message);else await refresh()
  }

  function formatBytes(bytes){
    const n=Number(bytes)||0
    if(n<1024)return n+' B'
    if(n<1024*1024)return Math.round(n/102.4)/10+' KB'
    return Math.round(n/104857.6)/10+' MB'
  }

  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><Paperclip size={28}/></div>
      <div><p className="eyebrow">ENGINEERING FILE STORAGE</p><h1>Files</h1><p>Store private datasheets, PDFs, schematics, photos, and other engineering artifacts in Supabase Storage.</p></div>
    </section>
    {error&&<div className="data-error">{error}</div>}

    <section className="panel upload-panel">
      <div className="upload-drop"><UploadCloud size={30}/><h2>Upload an engineering file</h2><p>Choose a PDF, image, schematic, text file, or other project artifact.</p><input id="lab-file" type="file" onChange={e=>setSelected(e.target.files?.[0]||null)}/>{selected&&<div className="selected-file"><FileText size={15}/><span>{selected.name}</span><small>{formatBytes(selected.size)}</small></div>}<button className="primary" disabled={!selected||uploading} onClick={upload}>{uploading?<Loader2 className="spin" size={15}/>:<Plus size={15}/>} {uploading?'UPLOADING...':'UPLOAD FILE'}</button></div>
    </section>

    {loading?<div className="panel data-state"><Loader2 className="spin" size={22}/><span>Loading your files...</span></div>:files.length===0?<div className="panel data-state"><Paperclip size={36}/><h2>No files yet.</h2><p>Upload a datasheet, schematic, project photo, or other engineering artifact.</p></div>:
      <div className="record-list">{files.map(file=><article className="panel record-card" key={file.id}><div className="record-card-head"><div><p className="eyebrow">ENGINEERING FILE</p><h2>{file.file_name}</h2><div className="record-meta"><span>{file.mime_type||'unknown type'}</span><span>{formatBytes(file.size_bytes)}</span><span>{new Date(file.created_at).toLocaleString()}</span></div></div><div className="record-actions"><button className="icon-btn" title="Open file" onClick={()=>download(file)}><Download size={14}/></button><button className="icon-btn danger-btn" title="Delete file" onClick={()=>remove(file)}><Trash2 size={14}/></button></div></div></article>)}</div>}
  </div>
}
