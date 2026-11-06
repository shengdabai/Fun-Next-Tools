import { beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'
import { renderToStaticMarkup } from 'react-dom/server'
import * as storage from '../src/lib/storage.ts'

const require = createRequire(import.meta.url)
const page = ts.transpileModule(readFileSync(new URL('../src/app/page.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText
const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8')
let values

beforeEach(() => {
  values = new Map()
  globalThis.window = {}
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
})

// Run the page's handlers and initial effect without a browser or new dependencies.
function mountPage() {
  const states = []
  const effects = []
  let cursor = 0
  let initial = true
  const hooks = {
    useState(value) {
      const slot = cursor++
      if (initial) states[slot] = value
      return [states[slot], next => { states[slot] = typeof next === 'function' ? next(states[slot]) : next }]
    },
    useEffect(effect) { if (initial) effects.push(effect) },
    useCallback(callback) { return callback },
  }
  const module = { exports: {} }
  vm.runInNewContext(page, {
    module, exports: module.exports,
    require(name) {
      if (name === 'react') return hooks
      if (name === '@/lib/storage') return storage
      if (name === '@/components/HeatMap') return { default: () => null }
      if (name === 'react/jsx-runtime') return require(name)
      throw new Error(`Unexpected page dependency: ${name}`)
    },
  })
  function render() {
    cursor = 0
    return module.exports.default()
  }
  render()
  initial = false
  effects.forEach(effect => effect())
  return render
}

function find(node, predicate) {
  if (Array.isArray(node)) return node.flatMap(child => find(child, predicate))
  if (!node || typeof node !== 'object') return []
  return [...(predicate(node) ? [node] : []), ...find(node.props?.children, predicate)]
}

function assertAlert(tree, message) {
  const alerts = find(tree, node => node.props?.role === 'alert')
  assert.equal(alerts.length, 1)
  const alert = alerts[0]
  assert.equal(alert.props.children, message)
  assert.equal(typeof message, 'string')
  // Verify the rendered alert uses a CSS rule backed by the existing danger token.
  const classes = (alert.props.className ?? '').split(/\s+/).filter(Boolean)
  const rule = classes.map(name => css.match(new RegExp(`\\.${name}\\s*\\{([^}]+)\\}`))?.[1])
    .find(body => body && /color:\s*var\(--danger\)/.test(body))
  assert.ok(rule, 'alert must use the existing --danger error color')
  assert.doesNotMatch(rule, /#[\da-f]{3,8}\b|rgba?\(/i)
  assert.match(renderToStaticMarkup(alert), /role="alert"/)
}

test('initial corrupt habits and check-ins show a styled recovery alert', () => {
  values.set('habit-streak:habits', '{broken habits')
  values.set('habit-streak:checkins', '{broken check-ins')
  const render = mountPage()
  assertAlert(render(), storage.STORAGE_RECOVERY_MESSAGE)
  assert.equal(values.get('habit-streak:habits:corrupt'), '{broken habits')
  assert.equal(values.get('habit-streak:checkins:corrupt'), '{broken check-ins')
})

test('check-in recovery stays visible after a successful click', () => {
  const render = mountPage()
  values.set('habit-streak:checkins', '{broken check-ins')
  find(render(), node => node.type === 'button' && node.props.className?.startsWith('btn-check'))[0].props.onClick()
  assertAlert(render(), storage.STORAGE_RECOVERY_MESSAGE)
  assert.deepEqual(storage.loadCheckIns().h1, [storage.localDateKey()])
})

test('deletion recovery stays visible after a successful click', () => {
  const render = mountPage()
  values.set('habit-streak:habits', '{broken habits')
  find(render(), node => node.props?.title === '删除习惯')[0].props.onClick()
  assertAlert(render(), storage.STORAGE_RECOVERY_MESSAGE)
  assert.equal(storage.loadHabits().some(habit => habit.id === 'h1'), false)
})

function fillNewHabit(render) {
  find(render(), node => node.props?.className === 'btn-add')[0].props.onClick()
  find(render(), node => node.type === 'input')[0].props.onChange({ target: { value: 'Read' } })
}

test('addition recovery stays visible after the modal closes', () => {
  const render = mountPage()
  fillNewHabit(render)
  values.set('habit-streak:habits', '{broken habits')
  find(render(), node => node.props?.className === 'btn-primary')[0].props.onClick()
  assertAlert(render(), storage.STORAGE_RECOVERY_MESSAGE)
  assert.equal(find(render(), node => node.props?.className === 'modal').length, 0)
  assert.equal(storage.loadHabits().some(habit => habit.name === 'Read'), true)
})

test('main-page storage access errors use the error style and preserve saved data', () => {
  const render = mountPage()
  storage.saveCheckIns({ h1: ['2026-10-28'] })
  const previous = values.get('habit-streak:checkins')
  globalThis.localStorage.setItem = () => { throw new Error('quota') }
  find(render(), node => node.type === 'button' && node.props.className?.startsWith('btn-check'))[0].props.onClick()
  assertAlert(render(), storage.STORAGE_ERROR_MESSAGE)
  assert.equal(values.get('habit-streak:checkins'), previous)
})

test('modal storage access errors use the same error style and keep the form open', () => {
  const render = mountPage()
  fillNewHabit(render)
  globalThis.localStorage.setItem = () => { throw new Error('quota') }
  find(render(), node => node.props?.className === 'btn-primary')[0].props.onClick()
  assertAlert(render(), storage.STORAGE_ERROR_MESSAGE)
  assert.equal(find(render(), node => node.props?.className === 'modal').length, 1)
  assert.equal(find(render(), node => node.type === 'input')[0].props.value, 'Read')
})
