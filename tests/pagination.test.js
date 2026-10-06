import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchAllRows } from '../src/lib/pagination.js'

test('retrieves all records across pages, including an exact page boundary', async () => {
  const source = Array.from({length: 300}, (_, id) => ({id}))
  const ranges = []
  const rows = await fetchAllRows(() => ({range: async (from, to) => {
    ranges.push([from, to]); return {data: source.slice(from, to + 1), error: null}
  }}))
  assert.deepEqual(rows, source)
  assert.deepEqual(ranges, [[0,99],[100,199],[200,299],[300,399]])
})
test('stops on a partial page and does not export a failed page as empty', async () => {
  const source = Array.from({length: 125}, (_, id) => ({id}))
  assert.equal((await fetchAllRows(() => ({range: async (from, to) => ({data:source.slice(from,to+1)})}))).length, 125)
  const error = new Error('permission denied')
  await assert.rejects(fetchAllRows(() => ({range: async () => ({error})})), error)
})
