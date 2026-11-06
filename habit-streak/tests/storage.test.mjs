import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { loadHabits, loadCheckIns, toggleCheckIn, saveHabits, saveCheckIns, updateHabits, getLongestStreak } from '../src/lib/storage.ts'
import * as storage from '../src/lib/storage.ts'
let values
beforeEach(() => {
  values = new Map()
  globalThis.window = {}
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
})
test('first read does not write habits or invent completed check-ins', () => {
  assert.equal(loadHabits().length, 3)
  assert.deepEqual(loadCheckIns(), {})
  assert.equal(values.size, 0)
})
test('unavailable storage does not crash initial loading', () => {
  globalThis.localStorage = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } }
  assert.equal(loadHabits().length, 3)
  assert.deepEqual(loadCheckIns(), {})
})
test('invalid habit containers and entries cannot reach rendering', () => {
  for (const raw of ['null', '{}', '42', '[null, {}, {"id":"h1","name":42}]', '{']) {
    values.set('habit-streak:habits', raw)
    assert.ok(Array.isArray(loadHabits()))
    for (const habit of loadHabits()) assert.equal(typeof habit.name, 'string')
  }
})
test('explicit empty habits and valid saved habits are retained', () => {
  saveHabits([])
  assert.deepEqual(loadHabits(), [])
  const habits = [{ id:'test', name:'Read', emoji:'📚', color:'#58a6ff', createdAt:'2026-10-29' }]
  saveHabits(habits)
  assert.deepEqual(loadHabits(), habits)
})
test('check-in loader rejects invalid dates and non-array values, deduplicates dates', () => {
  values.set('habit-streak:checkins', JSON.stringify({ h1: ['2026-02-29', '2024-02-29', '2024-02-29', null, 42], h2: 'bad', h3: ['2026-13-01'] }))
  assert.deepEqual(loadCheckIns(), { h1:['2024-02-29'], h3:[] })
  assert.doesNotThrow(() => toggleCheckIn('h2', '2026-10-29'))
})
test('malformed check-in roots safely produce an empty record', () => {
  for (const raw of ['null', '[]', '42', '{']) {
    values.set('habit-streak:checkins', raw)
    assert.deepEqual(loadCheckIns(), {})
  }
})
test('prototype-like habit IDs remain normal own records', () => {
  assert.deepEqual(toggleCheckIn('__proto__', '2026-10-29')['__proto__'], ['2026-10-29'])
  assert.deepEqual(toggleCheckIn('constructor', '2026-10-29')['constructor'], ['2026-10-29'])
})
test('valid toggle round-trip and leap-day streak are unchanged', () => {
  assert.deepEqual(toggleCheckIn('h1', '2026-10-29').h1, ['2026-10-29'])
  assert.deepEqual(toggleCheckIn('h1', '2026-10-29').h1, [])
  assert.equal(getLongestStreak(['2024-02-28','2024-02-29','2024-03-01']),3)
})
test('failed habit writes report a safe error and retain the previous cache', () => {
  saveHabits([])
  globalThis.localStorage.setItem = () => { throw new Error('private browser details') }
  assert.throws(() => saveHabits(loadHabits()), error =>
    error.name === 'HabitStorageError' && !error.message.includes('private browser details'))
  assert.deepEqual(loadHabits(), [])
})
test('failed check-in writes do not return success or change existing records', () => {
  saveCheckIns({ h1: ['2026-10-28'] })
  const previous = values.get('habit-streak:checkins')
  globalThis.localStorage.setItem = () => { throw new Error('quota exceeded') }
  assert.throws(() => toggleCheckIn('h1', '2026-10-29'), { name: 'HabitStorageError' })
  assert.equal(values.get('habit-streak:checkins'), previous)
})
test('a failed read cannot overwrite existing check-ins with an empty fallback', () => {
  saveCheckIns({ h1: ['2026-10-28'], h2: ['2026-10-27'] })
  const previous = values.get('habit-streak:checkins')
  globalThis.localStorage.getItem = () => { throw new Error('storage denied') }
  assert.throws(() => toggleCheckIn('h1', '2026-10-29'), { name: 'HabitStorageError' })
  assert.equal(values.get('habit-streak:checkins'), previous)
})
test('unparseable check-ins are backed up and allow a fresh check-in', () => {
  values.set('habit-streak:checkins', '{broken')
  const messages = []
  assert.deepEqual(loadCheckIns(message => messages.push(message)), {})
  assert.equal(values.get('habit-streak:checkins:corrupt'), '{broken')
  assert.equal(values.get('habit-streak:checkins'), '{broken')
  assert.deepEqual(messages, [storage.STORAGE_RECOVERY_MESSAGE])
  assert.match(messages[0], /无法读取/)
  messages.length = 0
  assert.deepEqual(toggleCheckIn('h1', '2026-10-29', message => messages.push(message)), { h1: ['2026-10-29'] })
  assert.deepEqual(messages, [storage.STORAGE_RECOVERY_MESSAGE])
  assert.deepEqual(loadCheckIns(), { h1: ['2026-10-29'] })
  assert.deepEqual(toggleCheckIn('h1', '2026-10-29'), { h1: [] })
  assert.equal(values.get('habit-streak:checkins:corrupt'), '{broken')
})

test('unparseable habits are backed up and allow adding and deleting', () => {
  const added = { id: 'new', name: 'Read', emoji: '📚', color: '#58a6ff', createdAt: '2026-10-29' }
  for (const action of ['add', 'delete']) {
    values.clear()
    values.set('habit-streak:habits', '{broken habits')
    const messages = []
    const updated = updateHabits(current => action === 'add'
      ? [...current, added] : current.filter(habit => habit.id !== 'h1'), message => messages.push(message))
    assert.equal(values.get('habit-streak:habits:corrupt'), '{broken habits')
    assert.deepEqual(messages, [storage.STORAGE_RECOVERY_MESSAGE])
    assert.match(messages[0], /无法读取/)
    assert.deepEqual(loadHabits(), updated)
    assert.equal(updated.some(habit => habit.id === (action === 'add' ? 'new' : 'h1')), action === 'add')
  }
})

test('loading corrupt habits reports recovery without replacing the original cache', () => {
  values.set('habit-streak:habits', '{broken habits')
  const messages = []
  assert.equal(loadHabits(message => messages.push(message)).length, 3)
  assert.equal(values.get('habit-streak:habits:corrupt'), '{broken habits')
  assert.equal(values.get('habit-streak:habits'), '{broken habits')
  assert.deepEqual(messages, [storage.STORAGE_RECOVERY_MESSAGE])
  assert.notEqual(messages[0], storage.STORAGE_ERROR_MESSAGE)
})

test('recovery preserves earlier backups and does not duplicate the same raw value', () => {
  const key = 'habit-streak:checkins'
  values.set(`${key}:corrupt`, 'earlier damaged data')
  values.set(key, '{new damage')
  loadCheckIns()
  loadCheckIns()
  assert.equal(values.get(`${key}:corrupt`), 'earlier damaged data')
  assert.equal(values.get(`${key}:corrupt:1`), '{new damage')
  assert.equal(values.size, 3)
})

test('an empty cached string is corrupt JSON and is backed up before restarting', () => {
  for (const key of ['habit-streak:habits', 'habit-streak:checkins']) {
    values.set(key, '')
    const messages = []
    const load = key.endsWith('habits') ? loadHabits : loadCheckIns
    load(message => messages.push(message))
    assert.equal(values.get(`${key}:corrupt`), '')
    assert.deepEqual(messages, [storage.STORAGE_RECOVERY_MESSAGE])
  }
})

test('a failed backup reports a storage error and never replaces corrupt data', () => {
  for (const [key, load, mutate] of [
    ['habit-streak:habits', loadHabits, notify => updateHabits(() => [], notify)],
    ['habit-streak:checkins', loadCheckIns, notify => toggleCheckIn('h1', '2026-10-29', notify)],
  ]) {
    values.clear()
    values.set(key, '{broken')
    const messages = []
    const notify = message => messages.push(message)
    globalThis.localStorage.setItem = () => { throw new Error('quota exceeded') }
    load(notify)
    assert.deepEqual(messages, [storage.STORAGE_ERROR_MESSAGE])
    assert.throws(() => mutate(notify), { name: 'HabitStorageError', message: storage.STORAGE_ERROR_MESSAGE })
    assert.equal(values.get(key), '{broken')
    assert.equal(values.size, 1)
  }
})

test('failed writes after a successful backup keep both the raw cache and its backup', () => {
  for (const [key, mutate] of [
    ['habit-streak:habits', () => updateHabits(() => [])],
    ['habit-streak:checkins', () => toggleCheckIn('h1', '2026-10-29')],
  ]) {
    values.clear()
    values.set(key, '{broken')
    globalThis.localStorage.setItem = (target, value) => {
      if (target === key) throw new Error('quota exceeded')
      values.set(target, value)
    }
    assert.throws(mutate, { name: 'HabitStorageError', message: storage.STORAGE_ERROR_MESSAGE })
    assert.equal(values.get(key), '{broken')
    assert.equal(values.get(`${key}:corrupt`), '{broken')
  }
})
test('storage becomes usable again after a temporary failure', () => {
  const setItem = globalThis.localStorage.setItem
  globalThis.localStorage.setItem = () => { throw new Error('blocked') }
  assert.throws(() => saveHabits([]), { name: 'HabitStorageError' })
  globalThis.localStorage.setItem = setItem
  saveHabits([])
  assert.deepEqual(loadHabits(), [])
  assert.deepEqual(toggleCheckIn('h1', '2026-10-29'), { h1: ['2026-10-29'] })
})
test('habit mutations fail before writing if the latest cache cannot be read', () => {
  saveHabits([])
  globalThis.localStorage.getItem = () => { throw new Error('blocked') }
  assert.throws(() => updateHabits(() => loadHabits()), { name: 'HabitStorageError' })
  assert.equal(values.get('habit-streak:habits'), '[]')
})
test('adding and deleting use the latest saved habits instead of a stale display fallback', () => {
  const saved = { id: 'custom', name: 'Read', emoji: '📚', color: '#58a6ff', createdAt: '2026-10-29' }
  const added = { ...saved, id: 'new' }
  saveHabits([saved])
  assert.deepEqual(updateHabits(current => [...current, added]), [saved, added])
  assert.deepEqual(updateHabits(current => current.filter(h => h.id !== 'custom')), [added])
  assert.deepEqual(loadHabits(), [added])
})
test('failed habit additions and deletions leave the saved collection unchanged', () => {
  const before = loadHabits()
  saveHabits(before)
  globalThis.localStorage.setItem = () => { throw new Error('quota') }
  assert.throws(() => updateHabits(() => []), { name: 'HabitStorageError' })
  assert.deepEqual(loadHabits(), before)
})
test('missing prototype-like habit IDs produce an empty list for rendering', () => {
  assert.equal(typeof storage.getCheckInDates, 'function')
  for (const id of ['__proto__', 'constructor', 'toString', 'missing']) {
    assert.deepEqual(storage.getCheckInDates({}, id), [])
  }
  const checkIns = JSON.parse('{"__proto__":["2026-10-29"],"constructor":["2026-10-28"]}')
  assert.deepEqual(storage.getCheckInDates(checkIns, '__proto__'), ['2026-10-29'])
  assert.deepEqual(storage.getCheckInDates(checkIns, 'constructor'), ['2026-10-28'])
})
