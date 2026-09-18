import test from 'node:test'
import assert from 'node:assert/strict'
import {
  convertElectricalUnit,
  decodeFourBandResistor,
  formatEngineeringValue,
  solveOhmsLaw,
} from '../src/lib/engineeringMath.js'

test('solves resistance from voltage and current', () => {
  assert.deepEqual(
    solveOhmsLaw({ voltage: 5, current: 0.02 }),
    { label: 'Resistance', value: 250, unit: 'Ω' },
  )
})

test('accepts zero voltage/current inputs without treating zero as missing', () => {
  assert.equal(solveOhmsLaw({ voltage: 0, current: 0 }), null)
  assert.deepEqual(
    solveOhmsLaw({ voltage: 0, resistance: 100 }),
    { label: 'Current', value: 0, unit: 'A' },
  )
})

test('rejects impossible divide-by-zero cases', () => {
  assert.equal(solveOhmsLaw({ voltage: 5, resistance: 0 }), null)
  assert.equal(solveOhmsLaw({ voltage: 5, power: 0 }), { label: 'Current', value: 0, unit: 'A' })
})

test('decodes a standard 1 kΩ resistor', () => {
  assert.equal(decodeFourBandResistor('Brown', 'Black', 'Red'), 1000)
})

test('converts kilo-ohms to ohms', () => {
  assert.equal(convertElectricalUnit(1, 'kΩ', 'Ω'), 1000)
})

test('formats very large and very small engineering values predictably', () => {
  assert.equal(formatEngineeringValue(0), '0')
  assert.equal(formatEngineeringValue(1e9), '1.00000e+9')
  assert.equal(formatEngineeringValue(1e-6), '1.00000e-6')
})
