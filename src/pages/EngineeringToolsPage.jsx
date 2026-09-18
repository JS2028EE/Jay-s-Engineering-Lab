import { useMemo, useState } from 'react'
import { Activity, Calculator, CircleHelp, Clock3, RefreshCw, Sigma, Wrench, Zap } from 'lucide-react'
import {
  convertElectricalUnit,
  decodeFourBandResistor,
  formatEngineeringValue,
  getElectricalUnitGroups,
  getResistorDigitColors,
  getResistorToleranceColors,
  solveCapacitor,
  solveCoreEE,
  solveFrequencyPeriod,
  solveInductor,
} from '../lib/engineeringMath'

const CORE_METHODS = {
  voltage: [
    { value: 'current_resistance', label: 'Current + Resistance', formula: 'V = IR', fields: [['current', 'Current', 'A', 'e.g. 0.02'], ['resistance', 'Resistance', 'Ω', 'e.g. 250']] },
    { value: 'current_power', label: 'Current + Power', formula: 'V = P / I', fields: [['current', 'Current', 'A', 'e.g. 0.05'], ['power', 'Power', 'W', 'e.g. 0.25']] },
    { value: 'resistance_power', label: 'Resistance + Power', formula: 'V = √(PR)', fields: [['resistance', 'Resistance', 'Ω', 'e.g. 100'], ['power', 'Power', 'W', 'e.g. 0.4']] },
  ],
  current: [
    { value: 'voltage_resistance', label: 'Voltage + Resistance', formula: 'I = V / R', fields: [['voltage', 'Voltage', 'V', 'e.g. 5'], ['resistance', 'Resistance', 'Ω', 'e.g. 250']] },
    { value: 'voltage_power', label: 'Voltage + Power', formula: 'I = P / V', fields: [['voltage', 'Voltage', 'V', 'e.g. 5'], ['power', 'Power', 'W', 'e.g. 0.25']] },
    { value: 'resistance_power', label: 'Resistance + Power', formula: 'I = √(P / R)', fields: [['resistance', 'Resistance', 'Ω', 'e.g. 100'], ['power', 'Power', 'W', 'e.g. 0.4']] },
  ],
  resistance: [
    { value: 'voltage_current', label: 'Voltage + Current', formula: 'R = V / I', fields: [['voltage', 'Voltage', 'V', 'e.g. 5'], ['current', 'Current', 'A', 'e.g. 0.02']] },
    { value: 'voltage_power', label: 'Voltage + Power', formula: 'R = V² / P', fields: [['voltage', 'Voltage', 'V', 'e.g. 5'], ['power', 'Power', 'W', 'e.g. 0.1']] },
    { value: 'current_power', label: 'Current + Power', formula: 'R = P / I²', fields: [['current', 'Current', 'A', 'e.g. 0.02'], ['power', 'Power', 'W', 'e.g. 0.1']] },
  ],
  power: [
    { value: 'voltage_current', label: 'Voltage + Current', formula: 'P = VI', fields: [['voltage', 'Voltage', 'V', 'e.g. 5'], ['current', 'Current', 'A', 'e.g. 0.02']] },
    { value: 'voltage_resistance', label: 'Voltage + Resistance', formula: 'P = V² / R', fields: [['voltage', 'Voltage', 'V', 'e.g. 5'], ['resistance', 'Resistance', 'Ω', 'e.g. 250']] },
    { value: 'current_resistance', label: 'Current + Resistance', formula: 'P = I²R', fields: [['current', 'Current', 'A', 'e.g. 0.02'], ['resistance', 'Resistance', 'Ω', 'e.g. 250']] },
  ],
}

const INDUCTOR_METHODS = {
  inductance: [
    { value: 'voltage_rate', label: 'Voltage + dI/dt', formula: 'L = V / (dI/dt)', fields: [['voltage', 'Voltage', 'V', 'e.g. 2'], ['rate', 'dI/dt', 'A/s', 'e.g. 400']] },
    { value: 'reactance_frequency', label: 'Reactance + Frequency', formula: 'L = Xₗ / (2πf)', fields: [['reactance', 'Inductive Reactance', 'Ω', 'e.g. 31.42'], ['frequency', 'Frequency', 'Hz', 'e.g. 1000']] },
    { value: 'energy_current', label: 'Stored Energy + Current', formula: 'L = 2E / I²', fields: [['energy', 'Stored Energy', 'J', 'e.g. 0.002'], ['current', 'Current', 'A', 'e.g. 0.5']] },
  ],
  voltage: [
    { value: 'inductance_rate', label: 'Inductance + dI/dt', formula: 'V = L(dI/dt)', fields: [['inductance', 'Inductance', 'H', 'e.g. 0.005'], ['rate', 'dI/dt', 'A/s', 'e.g. 400']] },
  ],
  rate: [
    { value: 'voltage_inductance', label: 'Voltage + Inductance', formula: 'dI/dt = V / L', fields: [['voltage', 'Voltage', 'V', 'e.g. 2'], ['inductance', 'Inductance', 'H', 'e.g. 0.005']] },
  ],
  current: [
    { value: 'energy_inductance', label: 'Stored Energy + Inductance', formula: 'I = √(2E / L)', fields: [['energy', 'Stored Energy', 'J', 'e.g. 0.002'], ['inductance', 'Inductance', 'H', 'e.g. 0.016']] },
  ],
  energy: [
    { value: 'inductance_current', label: 'Inductance + Current', formula: 'E = ½LI²', fields: [['inductance', 'Inductance', 'H', 'e.g. 0.005'], ['current', 'Current', 'A', 'e.g. 0.5']] },
  ],
  reactance: [
    { value: 'frequency_inductance', label: 'Frequency + Inductance', formula: 'Xₗ = 2πfL', fields: [['frequency', 'Frequency', 'Hz', 'e.g. 1000'], ['inductance', 'Inductance', 'H', 'e.g. 0.005']] },
  ],
  frequency: [
    { value: 'reactance_inductance', label: 'Reactance + Inductance', formula: 'f = Xₗ / (2πL)', fields: [['reactance', 'Inductive Reactance', 'Ω', 'e.g. 31.42'], ['inductance', 'Inductance', 'H', 'e.g. 0.005']] },
  ],
}

const CAPACITOR_METHODS = {
  capacitance: [
    { value: 'charge_voltage', label: 'Charge + Voltage', formula: 'C = Q / V', fields: [['charge', 'Charge', 'C', 'e.g. 0.001'], ['voltage', 'Voltage', 'V', 'e.g. 5']] },
    { value: 'energy_voltage', label: 'Stored Energy + Voltage', formula: 'C = 2E / V²', fields: [['energy', 'Stored Energy', 'J', 'e.g. 0.0125'], ['voltage', 'Voltage', 'V', 'e.g. 5']] },
    { value: 'reactance_frequency', label: 'Reactance + Frequency', formula: 'C = 1 / (2πfX꜀)', fields: [['reactance', 'Capacitive Reactance', 'Ω', 'e.g. 159.15'], ['frequency', 'Frequency', 'Hz', 'e.g. 1000']] },
  ],
  voltage: [
    { value: 'charge_capacitance', label: 'Charge + Capacitance', formula: 'V = Q / C', fields: [['charge', 'Charge', 'C', 'e.g. 0.001'], ['capacitance', 'Capacitance', 'F', 'e.g. 0.0002']] },
    { value: 'energy_capacitance', label: 'Stored Energy + Capacitance', formula: 'V = √(2E / C)', fields: [['energy', 'Stored Energy', 'J', 'e.g. 0.0025'], ['capacitance', 'Capacitance', 'F', 'e.g. 0.0002']] },
  ],
  charge: [
    { value: 'capacitance_voltage', label: 'Capacitance + Voltage', formula: 'Q = CV', fields: [['capacitance', 'Capacitance', 'F', 'e.g. 0.0002'], ['voltage', 'Voltage', 'V', 'e.g. 5']] },
  ],
  energy: [
    { value: 'capacitance_voltage', label: 'Capacitance + Voltage', formula: 'E = ½CV²', fields: [['capacitance', 'Capacitance', 'F', 'e.g. 0.0002'], ['voltage', 'Voltage', 'V', 'e.g. 5']] },
  ],
  reactance: [
    { value: 'frequency_capacitance', label: 'Frequency + Capacitance', formula: 'X꜀ = 1 / (2πfC)', fields: [['frequency', 'Frequency', 'Hz', 'e.g. 1000'], ['capacitance', 'Capacitance', 'F', 'e.g. 0.000001']] },
  ],
  frequency: [
    { value: 'reactance_capacitance', label: 'Reactance + Capacitance', formula: 'f = 1 / (2πX꜀C)', fields: [['reactance', 'Capacitive Reactance', 'Ω', 'e.g. 159.15'], ['capacitance', 'Capacitance', 'F', 'e.g. 0.000001']] },
  ],
  current: [
    { value: 'capacitance_rate', label: 'Capacitance + dV/dt', formula: 'I = C(dV/dt)', fields: [['capacitance', 'Capacitance', 'F', 'e.g. 0.000001'], ['rate', 'dV/dt', 'V/s', 'e.g. 1000']] },
  ],
  rate: [
    { value: 'current_capacitance', label: 'Current + Capacitance', formula: 'dV/dt = I / C', fields: [['current', 'Current', 'A', 'e.g. 0.001'], ['capacitance', 'Capacitance', 'F', 'e.g. 0.000001']] },
  ],
}

function TargetCalculator({ eyebrow, title, icon, description, targets, methods, solver, defaultTarget }) {
  const [target, setTarget] = useState(defaultTarget)
  const [method, setMethod] = useState(methods[defaultTarget][0].value)
  const [inputs, setInputs] = useState({})
  const currentMethod = methods[target].find(item => item.value === method) || methods[target][0]

  function changeTarget(nextTarget) {
    setTarget(nextTarget)
    setMethod(methods[nextTarget][0].value)
    setInputs({})
  }

  function changeMethod(nextMethod) {
    setMethod(nextMethod)
    setInputs({})
  }

  const values = Object.fromEntries(currentMethod.fields.map(([key]) => [key, inputs[key] ?? '']))
  const result = useMemo(() => solver(target, values), [solver, target, values.current, values.resistance, values.voltage, values.power, values.inductance, values.rate, values.energy, values.reactance, values.frequency, values.current, values.capacitance, values.charge])

  return <section className="panel tool-card tool-card-wide">
    <div className="tool-head"><div className="module-icon">{icon}</div><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><button className="icon-btn" title="Clear calculator" onClick={() => setInputs({})}><RefreshCw size={15}/></button></div>
    <p className="tool-description">{description}</p>
    <div className="tool-selector-row">
      <label><span>Calculate</span><select value={target} onChange={e=>changeTarget(e.target.value)}>{targets.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <label><span>Using</span><select value={method} onChange={e=>changeMethod(e.target.value)}>{methods[target].map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
    </div>
    <div className="tool-input-grid tool-two-inputs">
      {currentMethod.fields.map(([key,label,unit,placeholder]) => <label key={key}><span>{label} {unit}</span><input type="number" step="any" value={inputs[key] ?? ''} onChange={e=>setInputs(prev=>({...prev,[key]:e.target.value}))} placeholder={placeholder}/></label>)}
    </div>
    <div className="tool-result"><span>{result?.label?.toUpperCase() || 'RESULT'}</span><strong>{result ? formatEngineeringValue(result.value) + ' ' + result.unit : 'Enter the two values for the selected method'}</strong></div>
    <p className="tool-formula mono">{currentMethod.formula}</p>
  </section>
}

function CoreEE() {
  return <TargetCalculator
    eyebrow="CORE EE TOOL"
    title="Ohm's Law + Power"
    icon={<Sigma size={22}/>}
    description="Choose the exact quantity to calculate, then choose which two known values you want to use. No hidden inference."
    targets={[
      { value: 'voltage', label: 'Voltage (V)' },
      { value: 'current', label: 'Current (I)' },
      { value: 'resistance', label: 'Resistance (R)' },
      { value: 'power', label: 'Power (P)' },
    ]}
    methods={CORE_METHODS}
    solver={solveCoreEE}
    defaultTarget="resistance"
  />
}

function PassiveComponentTool({ type }) {
  const isInductor = type === 'inductor'
  return <TargetCalculator
    eyebrow={isInductor ? 'PASSIVE COMPONENT TOOL' : 'PASSIVE COMPONENT TOOL'}
    title={isInductor ? 'Inductor Calculator' : 'Capacitor Calculator'}
    icon={isInductor ? <Zap size={22}/> : <Activity size={22}/>}
    description={isInductor
      ? 'Work with L, v, dI/dt, stored energy, inductive reactance, and frequency.'
      : 'Work with C, Q, V, stored energy, capacitive reactance, frequency, and capacitor current.'}
    targets={isInductor
      ? [
        { value: 'inductance', label: 'Inductance (L)' },
        { value: 'voltage', label: 'Voltage (V)' },
        { value: 'rate', label: 'Rate of Current Change (dI/dt)' },
        { value: 'current', label: 'Current (I)' },
        { value: 'energy', label: 'Stored Energy (E)' },
        { value: 'reactance', label: 'Inductive Reactance (Xₗ)' },
        { value: 'frequency', label: 'Frequency (f)' },
      ]
      : [
        { value: 'capacitance', label: 'Capacitance (C)' },
        { value: 'voltage', label: 'Voltage (V)' },
        { value: 'charge', label: 'Charge (Q)' },
        { value: 'energy', label: 'Stored Energy (E)' },
        { value: 'reactance', label: 'Capacitive Reactance (X꜀)' },
        { value: 'frequency', label: 'Frequency (f)' },
        { value: 'current', label: 'Current (I)' },
        { value: 'rate', label: 'Rate of Voltage Change (dV/dt)' },
      ]}
    methods={isInductor ? INDUCTOR_METHODS : CAPACITOR_METHODS}
    solver={isInductor ? solveInductor : solveCapacitor}
    defaultTarget={isInductor ? 'inductance' : 'capacitance'}
  />
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
    <p className="tool-description">Select the exact electrical quantity first, then choose the source and destination units. Conversions stay dimension-safe.</p>
    <div className="tool-input-grid">
      <label><span>Convert</span><select value={group} onChange={e=>changeGroup(e.target.value)}>{Object.keys(groups).map(name=><option key={name}>{name}</option>)}</select></label>
      <label><span>Value</span><input type="number" step="any" value={value} onChange={e=>setValue(e.target.value)}/></label>
      <label><span>From</span><select value={from} onChange={e=>setFrom(e.target.value)}>{units.map(unit=><option key={unit}>{unit}</option>)}</select></label>
      <label><span>To</span><select value={to} onChange={e=>setTo(e.target.value)}>{units.map(unit=><option key={unit}>{unit}</option>)}</select></label>
    </div>
    <div className="tool-result"><span>CONVERTED</span><strong>{out===null?'Enter a valid value':formatEngineeringValue(out) + ' ' + to}</strong></div>
  </section>
}

function FrequencyUtility() {
  const [target,setTarget]=useState('frequency')
  const [value,setValue]=useState('')
  const result=useMemo(()=>target==='frequency'
    ? solveFrequencyPeriod('frequency',{period:value})
    : solveFrequencyPeriod('period',{frequency:value}),[target,value])
  return <section className="panel tool-card">
    <div className="tool-head"><div className="module-icon"><Clock3 size={22}/></div><div><p className="eyebrow">UTILITY</p><h2>Frequency ↔ Period</h2></div></div>
    <p className="tool-description">Choose whether you want frequency or period, then enter the single known value.</p>
    <div className="tool-selector-row">
      <label><span>Calculate</span><select value={target} onChange={e=>{setTarget(e.target.value);setValue('')}}><option value="frequency">Frequency (f)</option><option value="period">Period (T)</option></select></label>
      <label><span>Known value</span><input type="number" step="any" value={value} onChange={e=>setValue(e.target.value)} placeholder={target==='frequency'?'Period in seconds':'Frequency in Hz'}/></label>
    </div>
    <div className="tool-result"><span>{result?.label?.toUpperCase() || 'RESULT'}</span><strong>{result ? formatEngineeringValue(result.value) + ' ' + result.unit : 'Enter a positive known value'}</strong></div>
    <p className="tool-formula mono">f = 1/T &nbsp;·&nbsp; T = 1/f</p>
  </section>
}

export default function EngineeringToolsPage(){
  return <div className="content">
    <section className="module-hero">
      <div className="module-icon"><Wrench size={28}/></div>
      <div><p className="eyebrow">ENGINEERING TOOLCHAIN</p><h1>Engineering Tools</h1><p>Deterministic calculators and unit utilities for real electrical-engineering work.</p></div>
    </section>
    <div className="tool-grid">
      <CoreEE/>
      <ResistorColor/>
      <PassiveComponentTool type="inductor"/>
      <PassiveComponentTool type="capacitor"/>
      <UnitConverter/>
      <FrequencyUtility/>
    </div>
    <section className="panel tool-note"><CircleHelp size={17}/><div><b>Good engineering habit</b><p>Use the Lab to verify your work, not replace it. Keep the equation, known values, units, substitution, assumptions, and final result in your circuit or note record.</p></div></section>
  </div>
}
