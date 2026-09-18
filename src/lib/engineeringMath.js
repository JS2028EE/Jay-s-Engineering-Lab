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
}

export function formatEngineeringValue(value) {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs === 0) return '0'
  if (abs >= 1e6 || abs < 1e-3) return value.toExponential(5)
  return Number(value.toPrecision(6)).toString()
}

export function solveOhmsLaw({ voltage, current, resistance, power }) {
  const values = {
    voltage: parseOptionalNumber(voltage),
    current: parseOptionalNumber(current),
    resistance: parseOptionalNumber(resistance),
    power: parseOptionalNumber(power),
  }
  const supplied = Object.entries(values).filter(([, value]) => value !== null)
  if (supplied.length !== 2) return null

  const [first, second] = supplied
  const a = first[1]
  const b = second[1]

  if ((first[0] === 'voltage' && second[0] === 'current') || (first[0] === 'current' && second[0] === 'voltage')) {
    const v = first[0] === 'voltage' ? a : b
    const i = first[0] === 'current' ? a : b
    if (i === 0) return null
    return { label: 'Resistance', value: v / i, unit: 'Ω' }
  }

  if ((first[0] === 'voltage' && second[0] === 'resistance') || (first[0] === 'resistance' && second[0] === 'voltage')) {
    const v = first[0] === 'voltage' ? a : b
    const r = first[0] === 'resistance' ? a : b
    if (r === 0) return null
    return { label: 'Current', value: v / r, unit: 'A' }
  }

  if ((first[0] === 'current' && second[0] === 'resistance') || (first[0] === 'resistance' && second[0] === 'current')) {
    const i = first[0] === 'current' ? a : b
    const r = first[0] === 'resistance' ? a : b
    return { label: 'Voltage', value: i * r, unit: 'V' }
  }

  if ((first[0] === 'voltage' && second[0] === 'power') || (first[0] === 'power' && second[0] === 'voltage')) {
    const v = first[0] === 'voltage' ? a : b
    const p = first[0] === 'power' ? a : b
    if (v === 0) return null
    return { label: 'Current', value: p / v, unit: 'A' }
  }

  if ((first[0] === 'current' && second[0] === 'power') || (first[0] === 'power' && second[0] === 'current')) {
    const i = first[0] === 'current' ? a : b
    const p = first[0] === 'power' ? a : b
    if (i === 0) return null
    return { label: 'Voltage', value: p / i, unit: 'V' }
  }

  if ((first[0] === 'power' && second[0] === 'resistance') || (first[0] === 'resistance' && second[0] === 'power')) {
    const p = first[0] === 'power' ? a : b
    const r = first[0] === 'resistance' ? a : b
    if (r <= 0 || p < 0) return null
    return { label: 'Current', value: Math.sqrt(p / r), unit: 'A' }
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
