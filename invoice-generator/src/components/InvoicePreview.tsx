'use client'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface InvoiceData {
  // Sender
  senderName: string
  senderAddress: string
  senderEmail: string
  // Client
  clientName: string
  clientAddress: string
  clientEmail: string
  // Invoice meta
  invoiceNumber: string
  issueDate: string
  dueDate: string
  // Items
  lineItems: LineItem[]
  // Settings
  currency: string
  taxRate: number
  notes: string
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CNY: '¥',
  JPY: '¥',
}

interface Props {
  data: InvoiceData
}

function fmt(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' '
  if (currency === 'JPY') {
    return symbol + Math.round(amount).toLocaleString()
  }
  return symbol + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function InvoicePreview({ data }: Props) {
  const subtotal = data.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const taxAmount = subtotal * (data.taxRate / 100)
  const total = subtotal + taxAmount

  const today = new Date().getFullYear()

  return (
    <div
      id="invoice-preview"
      style={{
        background: '#ffffff',
        color: '#1a1a2e',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: '14px',
        lineHeight: '1.6',
        padding: '48px',
        minHeight: '840px',
        borderRadius: '4px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '40px',
          paddingBottom: '32px',
          borderBottom: '2px solid #6366f1',
        }}
      >
        {/* Sender Info */}
        <div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f1117',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
            }}
          >
            {data.senderName || 'Your Company Name'}
          </div>
          {data.senderAddress && (
            <div
              style={{ color: '#555', fontSize: '13px', whiteSpace: 'pre-line' }}
            >
              {data.senderAddress}
            </div>
          )}
          {data.senderEmail && (
            <div style={{ color: '#6366f1', fontSize: '13px', marginTop: '4px' }}>
              {data.senderEmail}
            </div>
          )}
        </div>

        {/* Invoice Label */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#6366f1',
              letterSpacing: '-0.03em',
              lineHeight: '1',
              marginBottom: '8px',
            }}
          >
            INVOICE
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#888',
              fontWeight: '500',
            }}
          >
            {data.invoiceNumber || 'INV-001'}
          </div>
        </div>
      </div>

      {/* Bill To + Dates */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '36px',
          gap: '32px',
        }}
      >
        {/* Bill To */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#999',
              marginBottom: '8px',
            }}
          >
            Bill To
          </div>
          <div
            style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#0f1117',
              marginBottom: '4px',
            }}
          >
            {data.clientName || 'Client Name'}
          </div>
          {data.clientAddress && (
            <div
              style={{
                color: '#555',
                fontSize: '13px',
                whiteSpace: 'pre-line',
              }}
            >
              {data.clientAddress}
            </div>
          )}
          {data.clientEmail && (
            <div style={{ color: '#6366f1', fontSize: '13px', marginTop: '4px' }}>
              {data.clientEmail}
            </div>
          )}
        </div>

        {/* Dates */}
        <div style={{ minWidth: '180px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#999',
                    paddingBottom: '6px',
                    paddingRight: '16px',
                  }}
                >
                  Issue Date
                </td>
                <td
                  style={{
                    fontSize: '13px',
                    color: '#333',
                    paddingBottom: '6px',
                    textAlign: 'right',
                  }}
                >
                  {data.issueDate || '—'}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#999',
                    paddingRight: '16px',
                  }}
                >
                  Due Date
                </td>
                <td
                  style={{
                    fontSize: '13px',
                    color: '#333',
                    textAlign: 'right',
                  }}
                >
                  {data.dueDate || '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Line Items */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '24px',
        }}
      >
        <thead>
          <tr
            style={{
              background: '#6366f1',
              color: '#fff',
            }}
          >
            <th
              style={{
                padding: '10px 14px',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderRadius: '4px 0 0 4px',
              }}
            >
              Description
            </th>
            <th
              style={{
                padding: '10px 14px',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                width: '80px',
              }}
            >
              Qty
            </th>
            <th
              style={{
                padding: '10px 14px',
                textAlign: 'right',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                width: '110px',
              }}
            >
              Unit Price
            </th>
            <th
              style={{
                padding: '10px 14px',
                textAlign: 'right',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                width: '110px',
                borderRadius: '0 4px 4px 0',
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((item, index) => {
            const lineTotal = item.quantity * item.unitPrice
            return (
              <tr
                key={item.id}
                style={{
                  background: index % 2 === 0 ? '#f8f9ff' : '#ffffff',
                  borderBottom: '1px solid #eef0f8',
                }}
              >
                <td
                  style={{
                    padding: '12px 14px',
                    color: '#333',
                    fontSize: '13px',
                  }}
                >
                  {item.description || (
                    <span style={{ color: '#ccc', fontStyle: 'italic' }}>
                      No description
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    textAlign: 'center',
                    color: '#555',
                    fontSize: '13px',
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    textAlign: 'right',
                    color: '#555',
                    fontSize: '13px',
                  }}
                >
                  {fmt(item.unitPrice, data.currency)}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    textAlign: 'right',
                    color: '#0f1117',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                >
                  {fmt(lineTotal, data.currency)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ minWidth: '260px' }}>
          {/* Subtotal */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #eef0f8',
            }}
          >
            <span style={{ color: '#666', fontSize: '13px' }}>Subtotal</span>
            <span style={{ color: '#333', fontSize: '13px', fontWeight: '500' }}>
              {fmt(subtotal, data.currency)}
            </span>
          </div>

          {/* Tax */}
          {data.taxRate > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #eef0f8',
              }}
            >
              <span style={{ color: '#666', fontSize: '13px' }}>
                Tax ({data.taxRate}%)
              </span>
              <span
                style={{ color: '#333', fontSize: '13px', fontWeight: '500' }}
              >
                {fmt(taxAmount, data.currency)}
              </span>
            </div>
          )}

          {/* Total */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              marginTop: '8px',
              background: '#6366f1',
              borderRadius: '6px',
            }}
          >
            <span
              style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}
            >
              Total Due
            </span>
            <span
              style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}
            >
              {fmt(total, data.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div
          style={{
            marginTop: '36px',
            paddingTop: '24px',
            borderTop: '1px solid #eef0f8',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#999',
              marginBottom: '8px',
            }}
          >
            Notes
          </div>
          <div
            style={{
              color: '#555',
              fontSize: '13px',
              lineHeight: '1.7',
              whiteSpace: 'pre-line',
            }}
          >
            {data.notes}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: '48px',
          paddingTop: '16px',
          borderTop: '1px solid #eef0f8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '11px', color: '#bbb' }}>
          Thank you for your business.
        </div>
        <div style={{ fontSize: '11px', color: '#bbb' }}>
          © {today} {data.senderName || 'Invoice Generator'}
        </div>
      </div>
    </div>
  )
}
