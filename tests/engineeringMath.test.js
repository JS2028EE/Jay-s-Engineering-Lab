import test from 'node:test'
import assert from 'node:assert/strict'
import {
  convertElectricalUnit,
  decodeFourBandResistor,
  formatEngineeringValue,
  getElectricalUnitGroups,
  solveCapacitor,
  solveCoreEE,
  solveFrequencyPeriod,
  solveInductor,
} from '../src/lib/engineeringMath.js'

test('solves an explicitly selected resistance from voltage and current', () => {
  assert.deepEqual(solveCoreEE('resistance', { voltage: 5, current: 0.02 }), { label: 'Resistance', value: 250, unit: 'Ω' })
})

test('solves an explicitly selected current from voltage and resistance', () => {
  assert.deepEqual(solveCoreEE('current', { voltage: 12, resistance: 600 }), { label: 'Current', value: 0.02, unit: 'A' })
})

test('solves an explicitly selected voltage from current and resistance', () => {
  assert.deepEqual(solveCoreEE('voltage', { current: 0.02, resistance: 600 }), { label: 'Voltage', value: 12, unit: 'V' })
})

test('solves an explicitly selected power from voltage and current', () => {
  assert.deepEqual(solveCoreEE('power', { voltage: 5, current: 0.05 }), { label: 'Power', value: 0.25, unit: 'W' })
})

test('solves core EE power and square-root relationships', () => {
  assert.deepEqual(solveCoreEE('current', { voltage: 5, power: 0.25 }), { label: 'Current', value: 0.05, unit: 'A' })
  const resistance = solveCoreEE('resistance', { current: 0.05, power: 0.25 })
  assert.equal(resistance.label, 'Resistance')
  assert.ok(Math.abs(resistance.value - 100) < 1e-12)

})

test('rejects invalid core EE input', () => {
  assert.equal(solveCoreEE('resistance', { voltage: 5, current: 0 }), null)
  assert.equal(solveCoreEE('current', { voltage: 5, resistance: 0 }), null)
  assert.equal(solveCoreEE('current', { power: -1, resistance: 100 }), null)
  assert.equal(solveCoreEE('voltage', { voltage: 5, current: 0.02, resistance: 250 }), null)
})

test('decodes a 1 kΩ resistor with 5% tolerance', () => {
  assert.deepEqual(decodeFourBandResistor('Brown', 'Black', 'Red', 'Gold'), { ohms: 1000, tolerancePercent: 5 })
})

test('rejects black as a leading digit in a standard 4-band resistor', () => {
  assert.equal(decodeFourBandResistor('Black', 'Black', 'Red', 'Gold'), null)
})

test('solves an inductor inductance from voltage and current slope', () => {
  assert.deepEqual(solveInductor('inductance', { voltage: 2, rate: 400 }), { label: 'Inductance', value: 0.005, unit: 'H' })
})

test('solves inductor reactance and stored energy', () => {
  const reactance = solveInductor('reactance', { frequency: 1000, inductance: 0.005 })
  assert.ok(Math.abs(reactance.value - (2 * Math.PI * 1000 * 0.005)) < 1e-12)
  assert.deepEqual(solveInductor('energy', { inductance: 0.005, current: 0.5 }), { label: 'Stored Energy', value: 0.000625, unit: 'J' })
})

test('solves capacitor capacitance, reactance, and current', () => {
  assert.deepEqual(solveCapacitor('capacitance', { charge: 0.001, voltage: 5 }), { label: 'Capacitance', value: 0.0002, unit: 'F' })
  const reactance = solveCapacitor('reactance', { frequency: 1000, capacitance: 0.000001 })
  assert.ok(Math.abs(reactance.value - (1 / (2 * Math.PI * 1000 * 0.000001))) < 1e-12)
  assert.deepEqual(solveCapacitor('current', { capacitance: 0.000001, rate: 1000 }), { label: 'Current', value: 0.001, unit: 'A' })
})

test('solves frequency and period in the utility calculator', () => {
  assert.deepEqual(solveFrequencyPeriod('frequency', { period: 0.001 }), { label: 'Frequency', value: 1000, unit: 'Hz' })
  assert.deepEqual(solveFrequencyPeriod('period', { frequency: 1000 }), { label: 'Period', value: 0.001, unit: 's' })
})

test('converts common electrical and passive-component units', () => {
  assert.equal(convertElectricalUnit(1, 'kΩ', 'Ω'), 1000)
  assert.ok(Math.abs(convertElectricalUnit(1, 'mH', 'uH') - 1000) < 1e-9)
  assert.ok(Math.abs(convertElectricalUnit(1, 'uF', 'nF') - 1000) < 1e-9)
  assert.ok(Math.abs(convertElectricalUnit(1, 'MHz', 'kHz') - 1000) < 1e-9)
  assert.ok(Math.abs(convertElectricalUnit(1, 'ms', 'us') - 1000) < 1e-9)
  assert.ok(Math.abs(convertElectricalUnit(1, 'mC', 'uC') - 1000) < 1e-9)
  assert.ok(Math.abs(convertElectricalUnit(1, 'mJ', 'uJ') - 1000) < 1e-9)
})

test('rejects cross-dimensional electrical conversion', () => {
  assert.equal(convertElectricalUnit(1, 'V', 'A'), null)
  assert.equal(convertElectricalUnit(1, 'F', 'H'), null)
})

test('exposes expanded grouped electrical units', () => {
  const groups = getElectricalUnitGroups()
  assert.deepEqual(groups.Resistance, ['mΩ', 'Ω', 'kΩ', 'MΩ'])
  assert.deepEqual(groups.Power, ['uW', 'mW', 'W', 'kW'])
  assert.deepEqual(groups.Voltage, ['V', 'mV', 'uV', 'kV'])
  assert.deepEqual(groups.Current, ['A', 'mA', 'uA', 'nA'])
  assert.deepEqual(groups.Frequency, ['Hz', 'kHz', 'MHz', 'GHz'])
  assert.deepEqual(groups.Inductance, ['H', 'mH', 'uH', 'nH'])
  assert.deepEqual(groups.Capacitance, ['F', 'mF', 'uF', 'nF', 'pF'])
  assert.deepEqual(groups.Time, ['s', 'ms', 'us', 'ns'])
})

test('formats engineering values predictably', () => {
  assert.equal(formatEngineeringValue(0), '0')
  assert.equal(formatEngineeringValue(1e9), '1.00000e+9')
  assert.equal(formatEngineeringValue(1e-6), '1.00000e-6')
})
