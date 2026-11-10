const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

// Use each standalone app's existing TypeScript dependency, without a root install.
function load(app, file, globals = {}) {
  const root = path.resolve(__dirname, '..', app)
  const ts = require(path.join(root, 'node_modules/typescript'))
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(code, {
    module, exports: module.exports, URL, ...globals,
    require: name => name.startsWith('.')
      ? load(app, path.join(path.dirname(file), `${name}.ts`), globals)
      : globals.require(name),
  })
  return module.exports
}

test('stroke navigation cancels pending steps on reset, character change and show-all', () => {
  const states = [], refs = [], timers = new Map()
  let cursor = 0, refCursor = 0, timerId = 0
  const hooks = {
    useState(initial) {
      const slot = cursor++
      if (!(slot in states)) states[slot] = initial
      return [states[slot], value => { states[slot] = typeof value === 'function' ? value(states[slot]) : value }]
    },
    useRef(initial) { return refs[refCursor++] ?? (refs[refCursor - 1] = { current: initial }) },
    useEffect() {},
  }
  const jsx = (type, props) => ({ type, props })
  const { default: Page } = load('stroke-order-trainer', 'src/app/page.tsx', {
    setTimeout(callback) { timers.set(++timerId, callback); return timerId },
    clearTimeout(id) { timers.delete(id) },
    require(name) {
      if (name === 'react') return hooks
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx }
      if (name === '@/data/characters') return { POPULAR_CHARS: ['一', '二'],
        getCharData: char => ({ char, strokes: ['M0,0 L1,1', 'M1,1 L2,2'], hsk: 1 }) }
      return { default: () => null }
    },
  })
  function render() { cursor = 0; refCursor = 0; return Page() }
  function find(node, label) {
    if (!node || typeof node !== 'object') return null
    if (node.type === 'button' && node.props.children === label) return node
    for (const child of [node.props?.children].flat(Infinity)) {
      const result = find(child, label)
      if (result) return result
    }
    return null
  }
  const click = label => find(render(), label).props.onClick()
  const flush = () => { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()) }
  click('一')
  click('下一笔 →')
  click('↺ 重置')
  flush()
  assert.equal(states[2], 0, 'reset must not be undone by an old timer')
  click('下一笔 →')
  click('二')
  flush()
  assert.equal(states[2], 0, 'a new character must start at zero')
  click('下一笔 →')
  click('全部显示')
  flush()
  assert.equal(states[2], 2, 'show-all must not advance past the final stroke')
})

const profile = {
  name: 'Alex', bio: 'Creator', avatarUrl: '', footerText: '', btnRadius: 'rounded',
  theme: { bg: '#fff', text: '#111', btn: '#123456', btnText: '#fff' },
  links: [{ id: 'one', title: 'Site', url: 'https://example.com', icon: '🌐' }],
}

test('saved profiles reject malformed JSON, containers and fields before rendering', () => {
  const { parseProfile } = load('link-in-bio', 'src/lib/profile.ts')
  for (const raw of [null, '{', 'null', '[]', '{}', '42']) assert.equal(parseProfile(raw), null)
  for (const change of [
    { name: null }, { links: {} }, { links: [null] }, { links: [{ ...profile.links[0], title: {} }] },
    { theme: null }, { theme: { ...profile.theme, bg: 42 } }, { btnRadius: 'invalid' },
    { links: [profile.links[0], profile.links[0]] },
  ]) assert.equal(parseProfile(JSON.stringify({ ...profile, ...change })), null)
  assert.deepEqual(JSON.parse(JSON.stringify(parseProfile(JSON.stringify(profile)))), profile)
  assert.equal(parseProfile(JSON.stringify({ ...profile, links: [] })).links.length, 0)
})

test('profile hydration preserves invalid storage until an actual edit', () => {
  const state = [], refs = [], effects = [], deps = []
  let cursor = 0, refCursor = 0, effectCursor = 0, raw = 'null'
  const jsx = (type, props) => ({ type, props })
  const hooks = {
    useState(initial) {
      const slot = cursor++
      if (!(slot in state)) state[slot] = initial
      return [state[slot], value => { state[slot] = typeof value === 'function' ? value(state[slot]) : value }]
    },
    useRef(initial) { return refs[refCursor++] ?? (refs[refCursor - 1] = { current: initial }) },
    useCallback: fn => fn,
    useEffect(fn, next) {
      const slot = effectCursor++
      if (!deps[slot] || next.some((value, i) => value !== deps[slot][i])) effects.push(fn)
      deps[slot] = next
    },
  }
  const { default: Page } = load('link-in-bio', 'src/app/page.tsx', {
    localStorage: { getItem: () => raw, setItem(key, value) { raw = value } },
    require(name) {
      if (name === 'react') return hooks
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx }
      return load('link-in-bio', `${name.replace('@/', 'src/')}.ts`)
    },
  })
  function render() {
    cursor = 0; refCursor = 0; effectCursor = 0
    const tree = Page()
    effects.splice(0).forEach(fn => fn())
    return tree
  }
  render()
  const tree = render()
  assert.equal(raw, 'null', 'mount must not overwrite malformed storage')
  function edit(node) {
    if (!node || typeof node !== 'object') return
    if (node.type === 'input' && node.props.value === 'Alex Johnson') {
      node.props.onChange({ target: { value: 'New Creator' } })
    }
    for (const child of [node.props?.children].flat(Infinity)) edit(child)
  }
  edit(tree)
  render()
  assert.equal(JSON.parse(raw).name, 'New Creator', 'explicit edits must still save')
})

test('Markdown export treats source text as text and blocks executable link destinations', () => {
  const { generateDigestMarkdown } = load('newsletter-digest', 'src/lib/generator.ts')
  const payload = '<img src=x onerror=alert(1)> [click](javascript:alert(1))'
  const feed = { name: payload, articles: [{ title: payload, summary: payload,
    url: 'javascript:alert(1)', publishedAt: new Date('2026-10-01') }] }
  const result = generateDigestMarkdown({ title: payload, subtitle: payload }, [feed])
  assert.doesNotMatch(result, /<img|\]\(javascript:/)
  assert.match(result, /&lt;img/)
  assert.match(result, /\[Read more →\]\(#\)/)
  feed.articles[0].url = 'https://example.com/a(b)?x=1&y=2'
  const valid = generateDigestMarkdown({ title: 'News', subtitle: 'Daily' }, [feed])
  assert.match(valid, /https:\/\/example.com\/a%28b%29\?x=1&amp;y=2/)
})

test('HTML exports retain escaping and URL/CSS injection protection', () => {
  const { generateHTML } = load('link-in-bio', 'src/lib/export.ts')
  const html = generateHTML({ ...profile, name: '</title><script>alert(1)</script>',
    theme: { ...profile.theme, bg: '#fff;} </style><script>alert(1)</script>' },
    links: [{ id: 'one', title: '<img onerror=alert(1)>', icon: '<script>', url: 'javascript:alert(1)' }] })
  assert.doesNotMatch(html, /<script|<img onerror|href="javascript:/)
  assert.match(html, /href="#"/)
  assert.match(html, /background-color: #ffffff/)
})

for (const app of ['newsletter-digest', 'meeting-cost-clock', 'tone-trainer']) {
  test(`${app}: clipboard success, missing API, denial and synchronous failures`, async () => {
    const { copyText } = load(app, 'src/lib/clipboard.ts')
    let copied
    assert.equal(await copyText('hello', { async writeText(value) { copied = value } }), true)
    assert.equal(copied, 'hello')
    assert.equal(await copyText('hello', null), false)
    assert.equal(await copyText('hello'), false)
    assert.equal(await copyText('hello', { async writeText() { throw new Error('denied') } }), false)
    assert.equal(await copyText('hello', { writeText() { throw new Error('blocked') } }), false)
  })
}

for (const app of ['link-in-bio', 'thread-forge']) {
  test(`${app}: legacy clipboard success, denial and exception always remove the temporary field`, async () => {
    for (const result of [true, false, new Error('denied')]) {
      let removed = 0
      const field = { select() {}, remove() { removed++ } }
      const { copyText } = load(app, 'src/lib/clipboard.ts', {
        document: { createElement: () => field, body: { appendChild() {} },
          execCommand() { if (result instanceof Error) throw result; return result } },
      })
      assert.equal(await copyText('hello'), result === true)
      assert.equal(field.value, 'hello')
      assert.equal(removed, 1)
    }
    let copied
    const { copyText } = load(app, 'src/lib/clipboard.ts', {
      navigator: { clipboard: { async writeText(text) { copied = text } } },
    })
    assert.equal(await copyText('hello'), true)
    assert.equal(copied, 'hello')
  })
}
