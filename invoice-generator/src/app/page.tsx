'use client'

import { useState, useEffect, useCallback } from 'react'
import InvoicePreview, { InvoiceData, LineItem } from '@/components/InvoicePreview'
import { MAX_QUANTITY, MAX_TAX_RATE, MAX_UNIT_PRICE, clampAmount, localDateStr, parseDraft } from '@/lib/draft'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY']

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', CNY: '¥', JPY: '¥',
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function generateInvoiceNumber(): string {
  const num = Math.floor(Math.random() * 900) + 100
  return `INV-${num}`
}

function todayStr(): string {
  return localDateStr()
}

function dueDateStr(days = 30): string {
  return localDateStr(new Date(), days)
}

const defaultItem = (): LineItem => ({
  id: generateId(),
  description: '',
  quantity: 1,
  unitPrice: 0,
})

const defaultData = (): InvoiceData => ({
  senderName: '',
  senderAddress: '',
  senderEmail: '',
  clientName: '',
  clientAddress: '',
  clientEmail: '',
  invoiceNumber: generateInvoiceNumber(),
  issueDate: todayStr(),
  dueDate: dueDateStr(30),
  lineItems: [defaultItem()],
  currency: 'USD',
  taxRate: 0,
  notes: '',
})

// Deterministic first render: the page is prerendered, so random ids, invoice
// numbers and "today" must not appear until the client has mounted.
const initialData = (): InvoiceData => ({
  ...defaultData(),
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  lineItems: [{ id: 'item-initial', description: '', quantity: 1, unitPrice: 0 }],
})

const STORAGE_KEY = 'invoice_draft_v1'

function fmt(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' '
  if (currency === 'JPY') return symbol + Math.round(amount).toLocaleString()
  return symbol + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function Home() {
  const [data, setData] = useState<InvoiceData>(initialData)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // On mount: load the saved draft, or fill in fresh defaults (number, dates, ids)
  useEffect(() => {
    const fresh = defaultData()
    try {
      const draft = parseDraft(localStorage.getItem(STORAGE_KEY), fresh)
      if (draft) {
        setData(draft.data)
        setSavedAt(draft.savedAt)
        return
      }
    } catch {
      // ignore corrupt storage
    }
    setData(fresh)
  }, [])

  // Auto-save to localStorage on data change
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedAt = new Date().toLocaleTimeString()
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, savedAt }))
        setSavedAt(savedAt)
      } catch {
        // ignore storage errors
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [data])

  const update = useCallback(<K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateItem = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }))
  }, [])

  const addItem = useCallback(() => {
    setData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, defaultItem()],
    }))
  }, [])

  const removeItem = useCallback((id: string) => {
    setData(prev => {
      if (prev.lineItems.length <= 1) return prev
      return { ...prev, lineItems: prev.lineItems.filter(i => i.id !== id) }
    })
  }, [])

  const newInvoice = useCallback(() => {
    if (window.confirm('Start a new invoice? Current data will be cleared.')) {
      const fresh = defaultData()
      setData(fresh)
      localStorage.removeItem(STORAGE_KEY)
      setSavedAt(null)
    }
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const subtotal = data.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice, 0
  )
  const taxAmount = subtotal * (data.taxRate / 100)
  const total = subtotal + taxAmount

  return (
    <>
      {/* Header */}
      <header className="app-header no-print">
        <div className="container">
          <div className="logo">
            <div className="logo-icon">📄</div>
            <span>Invoice Generator</span>
            <span className="badge badge-success" style={{ marginLeft: '8px' }}>Free</span>
          </div>
          <div className="action-bar">
            {savedAt && (
              <div className="draft-indicator">
                <div className="draft-dot" />
                Draft saved {savedAt}
              </div>
            )}
            <button className="btn btn-ghost btn-sm" onClick={newInvoice}>
              New Invoice
            </button>
            <button className="btn btn-success" onClick={handlePrint}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        <div className="container">
          <div className="editor-grid">

            {/* ─── LEFT: Form Panel ─── */}
            <div className="form-panel no-print">

              {/* Invoice Meta */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <div className="card-title">Invoice Details</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Invoice Number</label>
                    <input
                      type="text"
                      value={data.invoiceNumber}
                      onChange={e => update('invoiceNumber', e.target.value)}
                      placeholder="INV-001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={data.currency}
                      onChange={e => update('currency', e.target.value)}
                    >
                      {CURRENCIES.map(c => (
                        <option key={c} value={c}>{c} ({CURRENCY_SYMBOLS[c]})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Issue Date</label>
                    <input
                      type="date"
                      value={data.issueDate}
                      onChange={e => update('issueDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={data.dueDate}
                      onChange={e => update('dueDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* From / To */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <div className="card-title">From (Your Info)</div>
                <div className="form-group">
                  <label>Company / Full Name</label>
                  <input
                    type="text"
                    value={data.senderName}
                    onChange={e => update('senderName', e.target.value)}
                    placeholder="Acme Studio"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    rows={2}
                    value={data.senderAddress}
                    onChange={e => update('senderAddress', e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={data.senderEmail}
                    onChange={e => update('senderEmail', e.target.value)}
                    placeholder="hello@yourcompany.com"
                  />
                </div>

                <hr className="section-divider" />
                <div className="card-title">Bill To (Client)</div>

                <div className="form-group">
                  <label>Client Name</label>
                  <input
                    type="text"
                    value={data.clientName}
                    onChange={e => update('clientName', e.target.value)}
                    placeholder="Client Company Inc."
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    rows={2}
                    value={data.clientAddress}
                    onChange={e => update('clientAddress', e.target.value)}
                    placeholder="456 Client Ave, City, State 67890"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={data.clientEmail}
                    onChange={e => update('clientEmail', e.target.value)}
                    placeholder="billing@client.com"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <div className="card-title">Line Items</div>
                <table className="line-items-table">
                  <thead>
                    <tr>
                      <th className="col-desc">Description</th>
                      <th className="col-qty">Qty</th>
                      <th className="col-price">Unit Price</th>
                      <th className="col-total">Total</th>
                      <th className="col-action"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lineItems.map(item => {
                      const lineTotal = item.quantity * item.unitPrice
                      return (
                        <tr key={item.id}>
                          <td className="col-desc">
                            <input
                              type="text"
                              value={item.description}
                              onChange={e => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Service or product"
                            />
                          </td>
                          <td className="col-qty">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={item.quantity}
                              onChange={e => updateItem(item.id, 'quantity', clampAmount(e.target.value, MAX_QUANTITY))}
                              style={{ textAlign: 'center' }}
                            />
                          </td>
                          <td className="col-price">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={e => updateItem(item.id, 'unitPrice', clampAmount(e.target.value, MAX_UNIT_PRICE))}
                              style={{ textAlign: 'right' }}
                            />
                          </td>
                          <td className="col-total">
                            <div className="line-total">
                              {fmt(lineTotal, data.currency)}
                            </div>
                          </td>
                          <td className="col-action">
                            <button
                              className="btn btn-danger"
                              onClick={() => removeItem(item.id)}
                              disabled={data.lineItems.length <= 1}
                              title="Remove line"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <button className="btn btn-secondary btn-sm" onClick={addItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Line Item
                </button>
              </div>

              {/* Tax & Notes */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <div className="card-title">Tax & Notes</div>
                <div className="form-group">
                  <label>Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={data.taxRate}
                    onChange={e => update('taxRate', clampAmount(e.target.value, MAX_TAX_RATE))}
                    placeholder="0"
                    style={{ maxWidth: '160px' }}
                  />
                </div>
                <div className="form-group">
                  <label>Notes / Payment Instructions</label>
                  <textarea
                    rows={3}
                    value={data.notes}
                    onChange={e => update('notes', e.target.value)}
                    placeholder="Payment due within 30 days. Bank transfer preferred."
                  />
                </div>
              </div>

              {/* Totals Summary */}
              <div className="totals-box no-print">
                <div className="totals-row">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal, data.currency)}</span>
                </div>
                {data.taxRate > 0 && (
                  <div className="totals-row">
                    <span>Tax ({data.taxRate}%)</span>
                    <span>{fmt(taxAmount, data.currency)}</span>
                  </div>
                )}
                <div className="totals-row total">
                  <span>Total</span>
                  <span className="amount">{fmt(total, data.currency)}</span>
                </div>
              </div>

              {/* Bottom CTA */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handlePrint}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Print / Export PDF
                </button>
              </div>

              <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem' }}>
                Tip: In the print dialog, choose &ldquo;Save as PDF&rdquo; to download your invoice.
              </p>
            </div>

            {/* ─── RIGHT: Preview Panel ─── */}
            <div className="preview-panel">
              <div className="preview-header no-print">
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Live Preview
                </h3>
                <span className="badge badge-accent">
                  {fmt(total, data.currency)} total
                </span>
              </div>
              <div className="preview-wrapper">
                <div className="preview-toolbar no-print">
                  <div className="dot dot-red" />
                  <div className="dot dot-yellow" />
                  <div className="dot dot-green" />
                  <span style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Invoice Preview
                  </span>
                </div>
                <div className="preview-scroll">
                  <InvoicePreview data={data} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
