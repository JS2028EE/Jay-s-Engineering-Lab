import test from 'node:test'
import assert from 'node:assert/strict'
import {
  convertElectricalUnit,
  decodeFourBandResistor,
  formatEngineeringValue,
  getElectricalUnitGroups,
  solveOhmsLaw,
} from '../src/lib/engineeringMath.js'

test('solves resistance from voltage and current', () => {
  assert.deepEqual(
    solveOhmsLaw({ voltage: 5, current: 0.02 }),
    { label: 'Resistance', value: 250, unit: 'Ω' },
  )
})

test('accepts zero voltage with a nonzero resistance', () => {
  assert.deepEqual(
    solveOhmsLaw({ voltage: 0, resistance: 100 }),
    { label: 'Current', value: 0, unit: 'A' },
  )
})

test('rejects ambiguous or divide-by-zero combinations', () => {
  assert.equal(solveOhmsLaw({ voltage: 0, current: 0 }), null)
  assert.equal(solveOhmsLaw({ voltage: 5, resistance: 0 }), null)
  assert.deepEqual(
    solveOhmsLaw({ voltage: 5, power: 0 }),
    { label: 'Current', value: 0, unit: 'A' },
  )
})

test('decodes a 1 kΩ resistor with 5% tolerance', () => {
  assert.deepEqual(
    decodeFourBandResistor('Brown', 'Black', 'Red', 'Gold'),
    { ohms: 1000, tolerancePercent: 5 },
  )
})

test('rejects black as a leading digit in a standard 4-band resistor', () => {
  assert.equal(decodeFourBandResistor('Black', 'Black', 'Red', 'Gold'), null)
})

test('converts kilo-ohms to ohms', () => {
  assert.equal(convertElectricalUnit(1, 'kΩ', 'Ω'), 1000)
})

test('rejects cross-dimensional electrical conversion', () => {
  assert.equal(convertElectricalUnit(1, 'V', 'A'), null)
})

test('exposes grouped electrical units', () => {
  const groups = getElectricalUnitGroups()
  assert.deepEqual(groups.Resistance, ['Ω', 'kΩ', 'MΩ'])
  assert.deepEqual(groups.Power, ['W', 'mW'])
})

test('formats engineering values predictably', () => {
  assert.equal(formatEngineeringValue(0), '0')
  assert.equal(formatEngineeringValue(1e9), '1.00000e+9')
  assert.equal(formatEngineeringValue(1e-6), '1.00000e-6')
})
