const RESISTOR_DIGIT_COLORS = [
  ['Black', 0, 1],
  ['Brown', 1, 10],
  ['Red', 2, 100],
  ['Orange', 3, 1000],
  ['Yellow', 4, 10000],
  ['Green', 5, 100000],
  ['Blue', 6, 1000000],
  ['Violet', 7, 10000000],
  ['Gray', 8, 100000000],
  ['White', 9, 1000000000],
]

const RESISTOR_TOLERANCES = { Brown: 1, Red: 2, Gold: 5, Silver: 10 }

const ELECTRICAL_UNITS = {
  V: { group: 'Voltage', factor: 1 },
  mV: { group: 'Voltage', factor: 1e-3 },
  kV: { group: 'Voltage', factor: 1e3 },
  A: { group: 'Current', factor: 1 },
  mA: { group: 'Current', factor: 1e-3 },
  uA: { group: 'Current', factor: 1e-6 },
  'Ω': { group: 'Resistance', factor: 1 },
  'kΩ': { group: 'Resistance', factor: 1e3 },
  'MΩ': { group: 'Resistance', factor: 1e6 },
  W: { group: 'Power', factor: 1 },
  mW: { group: 'Power', factor: 1e-3 },
  Hz: { group: 'Frequency', factor: 1 },
  kHz: { group: 'Frequency', factor: 1e3 },
  MHz: { group: 'Frequency', factor: 1e6 },
  GHz: { group: 'Frequency', factor: 1e9 },
  s: { group: 'Time', factor: 1 },
  ms: { group: 'Time', factor: 1e-3 },
  'us': { group: 'Time', factor: 1e-6 },
  ns: { group: 'Time', factor: 1e-9 },
  H: { group: 'Inductance', factor: 1 },
  mH: { group: 'Inductance', factor: 1e-3 },
  'uH': { group: 'Inductance', factor: 1e-6 },
  nH: { group: 'Inductance', factor: 1e-9 },
  F: { group: 'Capacitance', factor: 1 },
  mF: { group: 'Capacitance', factor: 1e-3 },
  'uF': { group: 'Capacitance', factor: 1e-6 },
  nF: { group: 'Capacitance', factor: 1e-9 },
  pF: { group: 'Capacitance', factor: 1e-12 },
  C: { group: 'Charge', factor: 1 },
  mC: { group: 'Charge', factor: 1e-3 },
  uC: { group: 'Charge', factor: 1e-6 },
  nC: { group: 'Charge', factor: 1e-9 },
  J: { group: 'Energy', factor: 1 },
  mJ: { group: 'Energy', factor: 1e-3 },
  uJ: { group: 'Energy', factor: 1e-6 },
}

export function formatEngineeringValue(value) {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs === 0) return '0'
  if (abs >= 1e6 || abs < 1e-3) return value.toExponential(5)
  return Number(value.toPrecision(6)).toString()
}

export function solveCoreEE(target, values) {
  const parsed = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, parseOptionalNumber(value)]),
  )
  const supplied = Object.entries(parsed).filter(([, value]) => value !== null)
  if (!['voltage', 'current', 'resistance', 'power'].includes(target) || supplied.length !== 2) return null

  const known = Object.fromEntries(supplied)
  const has = (...keys) => keys.every(key => known[key] !== undefined)

  if (target === 'resistance' && has('voltage', 'current') && known.current !== 0) {
    return { label: 'Resistance', value: known.voltage / known.current, unit: 'Ω' }
  }
  if (target === 'resistance' && has('voltage', 'power') && known.power !== 0) {
    return { label: 'Resistance', value: (known.voltage ** 2) / known.power, unit: 'Ω' }
  }
  if (target === 'resistance' && has('current', 'power') && known.current !== 0) {
    return { label: 'Resistance', value: known.power / (known.current ** 2), unit: 'Ω' }
  }

  if (target === 'current' && has('voltage', 'resistance') && known.resistance !== 0) {
    return { label: 'Current', value: known.voltage / known.resistance, unit: 'A' }
  }
  if (target === 'current' && has('voltage', 'power') && known.voltage !== 0) {
    return { label: 'Current', value: known.power / known.voltage, unit: 'A' }
  }
  if (target === 'current' && has('power', 'resistance') && known.resistance > 0 && known.power >= 0) {
    return { label: 'Current (magnitude)', value: Math.sqrt(known.power / known.resistance), unit: 'A' }
  }

  if (target === 'voltage' && has('current', 'resistance')) {
    return { label: 'Voltage', value: known.current * known.resistance, unit: 'V' }
  }
  if (target === 'voltage' && has('current', 'power') && known.current !== 0) {
    return { label: 'Voltage', value: known.power / known.current, unit: 'V' }
  }
  if (target === 'voltage' && has('resistance', 'power') && known.resistance > 0 && known.power >= 0) {
    return { label: 'Voltage (magnitude)', value: Math.sqrt(known.power * known.resistance), unit: 'V' }
  }

  if (target === 'power' && has('voltage', 'current')) {
    return { label: 'Power', value: known.voltage * known.current, unit: 'W' }
  }
  if (target === 'power' && has('voltage', 'resistance') && known.resistance !== 0) {
    return { label: 'Power', value: (known.voltage ** 2) / known.resistance, unit: 'W' }
  }
  if (target === 'power' && has('current', 'resistance')) {
    return { label: 'Power', value: (known.current ** 2) * known.resistance, unit: 'W' }
  }

  return null
}

export function solveOhmsLaw({ voltage, current, resistance, power }) {
  const values = { voltage, current, resistance, power }
  const parsed = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, parseOptionalNumber(value)]))
  const supplied = Object.entries(parsed).filter(([, value]) => value !== null)
  if (supplied.length !== 2) return null
  const [first, second] = supplied
  const target = ['voltage', 'current', 'resistance', 'power'].find(key => key !== first[0] && key !== second[0])
  const candidates = ['resistance', 'current', 'voltage', 'power'].map(key => key).filter(key => {
    const clone = { ...values, [key]: undefined }
    return key !== first[0] && key !== second[0] && clone[key] === undefined
  })
  if (candidates.length === 0) return null
  const inferred = inferOhmsTarget(first[0], second[0])
  return inferred ? solveCoreEE(inferred, values) : (target ? solveCoreEE(target, values) : null)
}

function inferOhmsTarget(a, b) {
  const pair = [a, b].sort().join('+')
  const map = {
    'current+voltage': 'resistance',
    'resistance+voltage': 'current',
    'current+resistance': 'voltage',
    'power+voltage': 'current',
    'current+power': 'voltage',
    'power+resistance': 'current',
  }
  return map[pair] || null
}

export function solveInductor(target, values) {
  const parsed = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, parseOptionalNumber(value)]),
  )
  const supplied = Object.entries(parsed).filter(([, value]) => value !== null)
  if (!['inductance', 'voltage', 'rate', 'current', 'energy', 'reactance', 'frequency'].includes(target) || supplied.length !== 2) return null
  const known = Object.fromEntries(supplied)
  const has = (...keys) => keys.every(key => known[key] !== undefined)
  const twoPi = 2 * Math.PI

  if (target === 'inductance' && has('voltage', 'rate') && known.rate !== 0) {
    return { label: 'Inductance', value: known.voltage / known.rate, unit: 'H' }
  }
  if (target === 'inductance' && has('reactance', 'frequency') && known.frequency > 0) {
    return { label: 'Inductance', value: known.reactance / (twoPi * known.frequency), unit: 'H' }
  }
  if (target === 'inductance' && has('energy', 'current') && known.current !== 0 && known.energy >= 0) {
    return { label: 'Inductance', value: (2 * known.energy) / (known.current ** 2), unit: 'H' }
  }
  if (target === 'voltage' && has('inductance', 'rate')) {
    return { label: 'Voltage', value: known.inductance * known.rate, unit: 'V' }
  }
  if (target === 'rate' && has('voltage', 'inductance') && known.inductance !== 0) {
    return { label: 'Rate of Current Change', value: known.voltage / known.inductance, unit: 'A/s' }
  }
  if (target === 'current' && has('energy', 'inductance') && known.inductance > 0 && known.energy >= 0) {
    return { label: 'Current (magnitude)', value: Math.sqrt((2 * known.energy) / known.inductance), unit: 'A' }
  }
  if (target === 'energy' && has('inductance', 'current') && known.inductance >= 0) {
    return { label: 'Stored Energy', value: 0.5 * known.inductance * known.current ** 2, unit: 'J' }
  }
  if (target === 'reactance' && has('frequency', 'inductance')) {
    return { label: 'Inductive Reactance', value: twoPi * known.frequency * known.inductance, unit: 'Ω' }
  }
  if (target === 'frequency' && has('reactance', 'inductance') && known.inductance !== 0) {
    return { label: 'Frequency', value: known.reactance / (twoPi * known.inductance), unit: 'Hz' }
  }
  return null
}

export function solveCapacitor(target, values) {
  const parsed = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, parseOptionalNumber(value)]),
  )
  const supplied = Object.entries(parsed).filter(([, value]) => value !== null)
  if (!['capacitance', 'charge', 'voltage', 'energy', 'reactance', 'frequency', 'current', 'rate'].includes(target) || supplied.length !== 2) return null
  const known = Object.fromEntries(supplied)
  const has = (...keys) => keys.every(key => known[key] !== undefined)
  const twoPi = 2 * Math.PI

  if (target === 'capacitance' && has('charge', 'voltage') && known.voltage !== 0) {
    return { label: 'Capacitance', value: known.charge / known.voltage, unit: 'F' }
  }
  if (target === 'capacitance' && has('energy', 'voltage') && known.voltage !== 0 && known.energy >= 0) {
    return { label: 'Capacitance', value: (2 * known.energy) / (known.voltage ** 2), unit: 'F' }
  }
  if (target === 'capacitance' && has('reactance', 'frequency') && known.reactance !== 0 && known.frequency > 0) {
    return { label: 'Capacitance', value: 1 / (twoPi * known.frequency * known.reactance), unit: 'F' }
  }
  if (target === 'voltage' && has('charge', 'capacitance') && known.capacitance !== 0) {
    return { label: 'Voltage', value: known.charge / known.capacitance, unit: 'V' }
  }
  if (target === 'voltage' && has('energy', 'capacitance') && known.capacitance > 0 && known.energy >= 0) {
    return { label: 'Voltage (magnitude)', value: Math.sqrt((2 * known.energy) / known.capacitance), unit: 'V' }
  }
  if (target === 'charge' && has('capacitance', 'voltage')) {
    return { label: 'Charge', value: known.capacitance * known.voltage, unit: 'C' }
  }
  if (target === 'energy' && has('capacitance', 'voltage') && known.capacitance >= 0) {
    return { label: 'Stored Energy', value: 0.5 * known.capacitance * known.voltage ** 2, unit: 'J' }
  }
  if (target === 'reactance' && has('frequency', 'capacitance') && known.frequency > 0 && known.capacitance !== 0) {
    return { label: 'Capacitive Reactance', value: 1 / (twoPi * known.frequency * known.capacitance), unit: 'Ω' }
  }
  if (target === 'frequency' && has('reactance', 'capacitance') && known.reactance !== 0 && known.capacitance !== 0) {
    return { label: 'Frequency', value: 1 / (twoPi * known.reactance * known.capacitance), unit: 'Hz' }
  }
  if (target === 'current' && has('capacitance', 'rate')) {
    return { label: 'Current', value: known.capacitance * known.rate, unit: 'A' }
  }
  if (target === 'rate' && has('current', 'capacitance') && known.capacitance !== 0) {
    return { label: 'Rate of Voltage Change', value: known.current / known.capacitance, unit: 'V/s' }
  }
  return null
}

export function solveFrequencyPeriod(target, values) {
  const parsed = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, parseOptionalNumber(value)]),
  )
  if (!['frequency', 'period'].includes(target)) return null
  if (target === 'frequency' && parsed.period !== null && parsed.period > 0 && parsed.frequency === null) {
    return { label: 'Frequency', value: 1 / parsed.period, unit: 'Hz' }
  }
  if (target === 'period' && parsed.frequency !== null && parsed.frequency > 0 && parsed.period === null) {
    return { label: 'Period', value: 1 / parsed.frequency, unit: 's' }
  }
  return null
}

export function decodeFourBandResistor(band1, band2, multiplier, tolerance = 'Gold') {
  const c1 = RESISTOR_DIGIT_COLORS.find(([name]) => name === band1)
  const c2 = RESISTOR_DIGIT_COLORS.find(([name]) => name === band2)
  const c3 = RESISTOR_DIGIT_COLORS.find(([name]) => name === multiplier)
  const tolerancePercent = RESISTOR_TOLERANCES[tolerance]
  if (!c1 || !c2 || !c3 || tolerancePercent === undefined || band1 === 'Black') return null
  return { ohms: (c1[1] * 10 + c2[1]) * c3[2], tolerancePercent }
}

export function getResistorDigitColors({ includeBlack = true } = {}) {
  return RESISTOR_DIGIT_COLORS.filter(([name]) => includeBlack || name !== 'Black').map(([name]) => name)
}

export function getResistorToleranceColors() {
  return Object.keys(RESISTOR_TOLERANCES)
}

export function convertElectricalUnit(value, from, to) {
  const numeric = Number(value)
  const source = ELECTRICAL_UNITS[from]
  const target = ELECTRICAL_UNITS[to]
  if (!Number.isFinite(numeric) || !source || !target || source.group !== target.group) return null
  return numeric * source.factor / target.factor
}

export function getElectricalUnitGroups() {
  return Object.entries(ELECTRICAL_UNITS).reduce((groups, [unit, metadata]) => {
    groups[metadata.group] ||= []
    groups[metadata.group].push(unit)
    return groups
  }, {})
}

function parseOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}
