import { useMemo, useState } from 'react'
import { Calculator, CircleHelp, RefreshCw, Sigma, Wrench } from 'lucide-react'
import {
  convertElectricalUnit,
  decodeFourBandResistor,
  formatEngineeringValue,
  getElectricalUnitGroups,
  getResistorDigitColors,
  getResistorToleranceColors,
  solveOhmsLaw,
} from '../lib/engineeringMath'

function OhmsLaw(){
  const [voltage,setVoltage]=useState('')
  const [current,setCurrent]=useState('')
  const [resistance,setResistance]=useState('')
  const [power,setPower]=useState('')
  const result=useMemo(()=>solveOhmsLaw({voltage,current,resistance,power}),[voltage,current,resistance,power])
  function clear(){setVoltage('');setCurrent('');setResistance('');setPower('')}

  return <section className="panel tool-card">
    <div className="tool-head"><div className="module-icon"><Sigma size={22}/></div><div><p className="eyebrow">CORE EE TOOL</p><h2>Ohm's Law + Power</h2></div><button className="icon-btn" title="Clear" onClick={clear}><RefreshCw size={15}/></button></div>
    <p className="tool-description">Enter exactly two compatible values. The Lab solves one missing value using V = IR and P = VI.</p>
    <div className="tool-input-grid">
      <label><span>Voltage V</span><input type="number" step="any" value={voltage} onChange={e=>setVoltage(e.target.value)} placeholder="e.g. 5"/></label>
      <label><span>Current A</span><input type="number" step="any" value={current} onChange={e=>setCurrent(e.target.value)} placeholder="e.g. 0.02"/></label>
      <label><span>Resistance Ω</span><input type="number" step="any" value={resistance} onChange={e=>setResistance(e.target.value)} placeholder="e.g. 250"/></label>
      <label><span>Power W</span><input type="number" step="any" value={power} onChange={e=>setPower(e.target.value)} placeholder="e.g. 0.1"/></label>
    </div>
    <div className="tool-result">{result?<><span>{result.label}</span><strong>{formatEngineeringValue(result.value)} {result.unit}</strong></>:<><span>RESULT</span><strong>Enter exactly two compatible values</strong></>}</div>
    <p className="tool-formula mono">V = IR &nbsp;·&nbsp; P = VI &nbsp;·&nbsp; P = I²R &nbsp;·&nbsp; P = V²/R</p>
  </section>
}

function ResistorColor(){
  const digits=getResistorDigitColors()
  const firstBandOptions=getResistorDigitColors({includeBlack:false})
  const toleranceOptions=getResistorToleranceColors()
  const [b1,setB1]=useState('Brown')
  const [b2,setB2]=useState('Black')
  const [b3,setB3]=useState('Red')
  const [b4,setB4]=useState('Gold')
  const decoded=decodeFourBandResistor(b1,b2,b3,b4)

  return <section className="panel tool-card">
    <div className="tool-head"><div className="module-icon"><Calculator size={22}/></div><div><p className="eyebrow">REFERENCE TOOL</p><h2>4-Band Resistor Decoder</h2></div></div>
    <div className="tool-input-grid resistor-grid">
      <label><span>Band 1</span><select value={b1} onChange={e=>setB1(e.target.value)}>{firstBandOptions.map(color=><option key={color}>{color}</option>)}</select></label>
      <label><span>Band 2</span><select value={b2} onChange={e=>setB2(e.target.value)}>{digits.map(color=><option key={color}>{color}</option>)}</select></label>
      <label><span>Multiplier</span><select value={b3} onChange={e=>setB3(e.target.value)}>{digits.map(color=><option key={color}>{color}</option>)}</select></label>
      <label><span>Tolerance</span><select value={b4} onChange={e=>setB4(e.target.value)}>{toleranceOptions.map(color=><option key={color}>{color}</option>)}</select></label>
    </div>
    <div className="tool-result"><span>RESISTANCE</span><strong>{decoded ? formatEngineeringValue(decoded.ohms) : '—'} Ω {decoded && '± ' + decoded.tolerancePercent + '%'}</strong></div>
    <p className="tool-formula">Band 1 and Band 2 set the significant digits, Band 3 sets the multiplier, and Band 4 sets tolerance.</p>
  </section>
}

function UnitConverter(){
  const groups=getElectricalUnitGroups()
  const [group,setGroup]=useState('Resistance')
  const [value,setValue]=useState('1')
  const [from,setFrom]=useState('kΩ')
  const [to,setTo]=useState('Ω')
  const units=groups[group] || []

  function changeGroup(nextGroup) {
    const nextUnits=groups[nextGroup] || []
    setGroup(nextGroup)
    setFrom(nextUnits[0] || '')
    setTo(nextUnits[1] || nextUnits[0] || '')
  }

  const out=useMemo(()=>convertElectricalUnit(value,from,to),[value,from,to])

  return <section className="panel tool-card">
    <div className="tool-head"><div className="module-icon"><Wrench size={22}/></div><div><p className="eyebrow">UTILITY</p><h2>Electrical Unit Converter</h2></div></div>
    <div className="tool-input-grid">
      <label><span>Quantity</span><select value={group} onChange={e=>changeGroup(e.target.value)}>{Object.keys(groups).map(name=><option key={name}>{name}</option>)}</select></label>
      <label><span>Value</span><input type="number" step="any" value={value} onChange={e=>setValue(e.target.value)}/></label>
      <label><span>From</span><select value={from} onChange={e=>setFrom(e.target.value)}>{units.map(unit=><option key={unit}>{unit}</option>)}</select></label>
      <label><span>To</span><select value={to} onChange={e=>setTo(e.target.value)}>{units.map(unit=><option key={unit}>{unit}</option>)}</select></label>
    </div>
    <div className="tool-result"><span>CONVERTED</span><strong>{out===null?'Enter a valid value':formatEngineeringValue(out) + ' ' + to}</strong></div>
  </section>
}

export default function EngineeringToolsPage(){
  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><Wrench size={28}/></div>
      <div><p className="eyebrow">ENGINEERING TOOLCHAIN</p><h1>Engineering Tools</h1><p>Small, deterministic utilities for calculations you actually perform while learning and building.</p></div>
    </section>
    <div className="tool-grid"><OhmsLaw/><ResistorColor/><UnitConverter/></div>
    <section className="panel tool-note"><CircleHelp size={17}/><div><b>Good engineering habit</b><p>Use the calculator to check your work, not replace it. Keep the equation, substitution, units, and final result in your circuit or note record.</p></div></section>
  </div>
}
