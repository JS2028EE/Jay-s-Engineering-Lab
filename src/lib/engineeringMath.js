const RESISTOR_COLORS = [
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

const ELECTRICAL_UNITS = {
  V: 1,
  mV: 1e-3,
  kV: 1e3,
  A: 1,
  mA: 1e-3,
  uA: 1e-6,
  'Ω': 1,
  'kΩ': 1e3,
  'MΩ': 1e6,
  W: 1,
  mW: 1e-3,
}

export function formatEngineeringValue(value) {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs === 0) return '0'
  if (abs >= 1e6 || abs < 1e-3) return value.toExponential(5)
  return Number(value.toPrecision(6)).toString()
}

/**
 * Solve one missing value from any two compatible electrical quantities.
 *
 * Returns null when fewer than two quantities are supplied or when the
 * supplied combination cannot produce a finite result.
 */
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
  const key = [first[0], second[0]].sort().join('|')
  const a = first[1]
  const b = second[1]

  const result = {
    'current|voltage': ['Resistance', safeDivide(a, b, first[0] === 'voltage') ? null : null],
  }

  if ((first[0] === 'voltage' && second[0] === 'current') || (first[0] === 'current' && second[0] === 'voltage')) {
    const v = first[0] === 'voltage' ? a : b
    const i = first[0] === 'current' ? a : b
    return v === 0 ? (i === 0 ? null : { label: 'Resistance', value: 0, unit: 'Ω' }) : { label: 'Resistance', value: v / i, unit: 'Ω' }
  }

  if ((first[0] === 'voltage' && second[0] === 'resistance') || (first[0] === 'resistance' && second[0] === 'voltage')) {
    const v = first[0] === 'voltage' ? a : b
    const r = first[0] === 'resistance' ? a : b
    return r === 0 ? null : { label: 'Current', value: v / r, unit: 'A' }
  }

  if ((first[0] === 'current' && second[0] === 'resistance') || (first[0] === 'resistance' && second[0] === 'current')) {
    const i = first[0] === 'current' ? a : b
    const r = first[0] === 'resistance' ? a : b
    return { label: 'Voltage', value: i * r, unit: 'V' }
  }

  if ((first[0] === 'voltage' && second[0] === 'power') || (first[0] === 'power' && second[0] === 'voltage')) {
    const v = first[0] === 'voltage' ? a : b
    const p = first[0] === 'power' ? a : b
    return v === 0 ? null : { label: 'Current', value: p / v, unit: 'A' }
  }

  if ((first[0] === 'current' && second[0] === 'power') || (first[0] === 'power' && second[0] === 'current')) {
    const i = first[0] === 'current' ? a : b
    const p = first[0] === 'power' ? a : b
    return i === 0 ? null : { label: 'Voltage', value: p / i, unit: 'V' }
  }

  if ((first[0] === 'power' && second[0] === 'resistance') || (first[0] === 'resistance' && second[0] === 'power')) {
    const p = first[0] === 'power' ? a : b
    const r = first[0] === 'resistance' ? a : b
    if (r === 0 || p < 0) return null
    return { label: 'Current', value: Math.sqrt(p / r), unit: 'A' }
  }

  return null
}

export function decodeFourBandResistor(band1, band2, multiplier) {
  const c1 = RESISTOR_COLORS.find(([name]) => name === band1)
  const c2 = RESISTOR_COLORS.find(([name]) => name === band2)
  const c3 = RESISTOR_COLORS.find(([name]) => name === multiplier)
  if (!c1 || !c2 || !c3) return null
  return (c1[1] * 10 + c2[1]) * c3[2]
}

export function convertElectricalUnit(value, from, to) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || !(from in ELECTRICAL_UNITS) || !(to in ELECTRICAL_UNITS)) return null
  return numeric * ELECTRICAL_UNITS[from] / ELECTRICAL_UNITS[to]
}

export function getResistorColorOptions() {
  return RESISTOR_COLORS.map(([name]) => name)
}

export function getElectricalUnits() {
  return Object.keys(ELECTRICAL_UNITS)
}

function parseOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function safeDivide(numerator, denominator) {
  return denominator === 0 ? null : numerator / denominator
}
