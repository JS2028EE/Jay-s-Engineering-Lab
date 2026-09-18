import { useMemo, useState } from 'react'
import { Calculator, CircleHelp, RefreshCw, Sigma, Wrench } from 'lucide-react'

const units = {
  V: 1,
  mV: 1e-3,
  kV: 1e3,
  A: 1,
  mA: 1e-3,
  uA: 1e-6,
  ohm: 1,
  kohm: 1e3,
  Mohm: 1e6,
  W: 1,
  mW: 1e-3,
}

function format(value){
  if(!Number.isFinite(value)) return '—'
  const abs=Math.abs(value)
  if(abs===0) return '0'
  if(abs>=1e6 || abs<1e-3) return value.toExponential(5)
  return Number(value.toPrecision(6)).toString()
}

function OhmsLaw(){
  const [voltage,setVoltage]=useState('')
  const [current,setCurrent]=useState('')
  const [resistance,setResistance]=useState('')
  const [power,setPower]=useState('')

  const result=useMemo(()=>{
    const v=Number(voltage),i=Number(current),r=Number(resistance),p=Number(power)
    if(v && i) return {label:'Resistance',value:v/i,unit:'Ω'}
    if(v && r) return {label:'Current',value:v/r,unit:'A'}
    if(i && r) return {label:'Voltage',value:i*r,unit:'V'}
    if(v && p) return {label:'Current',value:p/v,unit:'A'}
    if(i && p) return {label:'Voltage',value:p/i,unit:'V'}
    if(r && p) return {label:'Current',value:Math.sqrt(p/r),unit:'A'}
    return null
  },[voltage,current,resistance,power])

  function clear(){setVoltage('');setCurrent('');setResistance('');setPower('')}

  return <section className="panel tool-card">
    <div className="tool-head"><div className="module-icon"><Sigma size={22}/></div><div><p className="eyebrow">CORE EE TOOL</p><h2>Ohm's Law + Power</h2></div><button className="icon-btn" title="Clear" onClick={clear}><RefreshCw size={15}/></button></div>
    <p className="tool-description">Enter any two compatible values. The Lab solves one missing value using V = IR and P = VI.</p>
    <div className="tool-input-grid">
      <label><span>Voltage V</span><input type="number" step="any" value={voltage} onChange={e=>setVoltage(e.target.value)} placeholder="e.g. 5"/></label>
      <label><span>Current A</span><input type="number" step="any" value={current} onChange={e=>setCurrent(e.target.value)} placeholder="e.g. 0.02"/></label>
      <label><span>Resistance Ω</span><input type="number" step="any" value={resistance} onChange={e=>setResistance(e.target.value)} placeholder="e.g. 250"/></label>
      <label><span>Power W</span><input type="number" step="any" value={power} onChange={e=>setPower(e.target.value)} placeholder="e.g. 0.1"/></label>
    </div>
    <div className="tool-result">{result?<><span>{result.label}</span><strong>{format(result.value)} {result.unit}</strong></>:<><span>RESULT</span><strong>Enter two values</strong></>}</div>
    <p className="tool-formula mono">V = IR &nbsp;·&nbsp; P = VI &nbsp;·&nbsp; P = I²R &nbsp;·&nbsp; P = V²/R</p>
  </section>
}

function ResistorColor(){
  const colors=[
    ['Black',0,1],
    ['Brown',1,10],
    ['Red',2,100],
    ['Orange',3,1000],
    ['Yellow',4,10000],
    ['Green',5,100000],
    ['Blue',6,1000000],
    ['Violet',7,10000000],
    ['Gray',8,100000000],
    ['White',9,1000000000],
  ]
  const [b1,setB1]=useState('Brown'),[b2,setB2]=useState('Black'),[b3,setB3]=useState('Red')
  const c1=colors.find(c=>c[0]===b1),c2=colors.find(c=>c[0]===b2),c3=colors.find(c=>c[0]===b3)
  const ohms=(c1?.[1]*10+c2?.[1])*c3?.[2]
  return <section className="panel tool-card">
    <div className="tool-head"><div className="module-icon"><Calculator size={22}/></div><div><p className="eyebrow">REFERENCE TOOL</p><h2>4-Band Resistor Decoder</h2></div></div>
    <div className="tool-input-grid resistor-grid">
      <label><span>Band 1</span><select value={b1} onChange={e=>setB1(e.target.value)}>{colors.map(c=><option key={c[0]}>{c[0]}</option>)}</select></label>
      <label><span>Band 2</span><select value={b2} onChange={e=>setB2(e.target.value)}>{colors.map(c=><option key={c[0]}>{c[0]}</option>)}</select></label>
      <label><span>Multiplier</span><select value={b3} onChange={e=>setB3(e.target.value)}>{colors.map(c=><option key={c[0]}>{c[0]}</option>)}</select></label>
    </div>
    <div className="tool-result"><span>RESISTANCE</span><strong>{format(ohms)} Ω</strong></div>
    <p className="tool-formula">4-band tolerance is a separate fourth band; this decoder focuses on the resistance value.</p>
  </section>
}

function UnitConverter(){
  const [value,setValue]=useState('1'),[from,setFrom]=useState('kΩ'),[to,setTo]=useState('Ω')
  const table={V:1,mV:1e-3,kV:1e3,A:1,mA:1e-3,uA:1e-6,'Ω':1,'kΩ':1e3,'MΩ':1e6,W:1,mW:1e-3}
  const out=Number(value)*table[from]/table[to]
  return <section className="panel tool-card">
    <div className="tool-head"><div className="module-icon"><Wrench size={22}/></div><div><p className="eyebrow">UTILITY</p><h2>Electrical Unit Converter</h2></div></div>
    <div className="tool-input-grid">
      <label><span>Value</span><input type="number" step="any" value={value} onChange={e=>setValue(e.target.value)}/></label>
      <label><span>From</span><select value={from} onChange={e=>setFrom(e.target.value)}>{Object.keys(table).map(u=><option key={u}>{u}</option>)}</select></label>
      <label><span>To</span><select value={to} onChange={e=>setTo(e.target.value)}>{Object.keys(table).map(u=><option key={u}>{u}</option>)}</select></label>
    </div>
    <div className="tool-result"><span>CONVERTED</span><strong>{format(out)} {to}</strong></div>
  </section>
}

export default function EngineeringToolsPage(){
  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><Wrench size={28}/></div>
      <div><p className="eyebrow">ENGINEERING TOOLCHAIN</p><h1>Engineering Tools</h1><p>Small, reliable utilities for calculations you actually perform while learning and building.</p></div>
    </section>
    <div className="tool-grid"><OhmsLaw/><ResistorColor/><UnitConverter/></div>
    <section className="panel tool-note"><CircleHelp size={17}/><div><b>Good engineering habit</b><p>Use the calculator to check your work, not replace it. Keep the equation, substitution, units, and final result in your circuit or note record.</p></div></section>
  </div>
}
