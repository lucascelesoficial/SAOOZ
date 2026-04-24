import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PDFExpenseItem {
  description?: string
  category: string
  amount: number
  date?: string
}

export interface PDFIncomeItem {
  name: string
  type: string
  amount: number
  date?: string
}

export interface PDFKeyValueRow {
  label: string
  value: string
  note?: string
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray'
  bold?: boolean
  divider?: boolean // renders a top separator
}

export interface PDFSection {
  title: string
  rows: PDFKeyValueRow[]
}

export interface PDFTaxBreakdown {
  regime: string
  ratePct: string
  totalAmount: number
  annualProjection: number
  items: Array<{ label: string; ratePct: string; amount: number }>
}

export interface PDFProLabore {
  conservative: number
  balanced: number
  aggressive: number
  operationalProfit: number
  operationalReserve: number
  reason: string
}

export interface FinancialReportData {
  title: string
  subtitle: string
  month: string
  totalIncome: number
  totalExpenses: number
  balance: number
  expenses?: PDFExpenseItem[]
  incomes?: PDFIncomeItem[]
  // PJ core
  taxAmount?: number
  netProfit?: number
  profitMargin?: string
  businessName?: string
  taxRegime?: string
  // Tab-specific structured data
  sections?: PDFSection[]       // generic key-value sections (fits any tab)
  taxBreakdown?: PDFTaxBreakdown
  proLabore?: PDFProLabore
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const C = {
  green: '#249833',
  red: '#dc2626',
  yellow: '#d97706',
  blue: '#249833',
  gray: '#666',
  bg: '#f4faf5',
  border: '#d6eeda',
  line: '#f0f0f0',
  text: '#0f1f10',
  muted: '#888',
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: C.blue,
  },
  brandName: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: C.blue, letterSpacing: 2 },
  brandTagline: { fontSize: 8, color: C.muted, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  reportTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.text },
  reportSubtitle: { fontSize: 9, color: C.gray, marginTop: 2 },
  reportMonth: { fontSize: 9, color: C.blue, marginTop: 2, fontFamily: 'Helvetica-Bold' },

  metaRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
    backgroundColor: C.bg,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  metaLabel: { fontSize: 8, color: C.muted },
  metaValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#333', marginTop: 2 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  summaryCard: {
    flex: 1, padding: 10, borderRadius: 6,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
  },
  summaryLabel: { fontSize: 7, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  summaryValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.text },
  summaryValueGreen: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.green },
  summaryValueRed: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.red },
  summaryValueBlue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.blue },
  summaryValueYellow: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.yellow },

  sectionTitle: {
    fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.text,
    marginBottom: 6, marginTop: 14, paddingBottom: 4,
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },

  // key-value rows
  kvRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  kvRowAlt: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: C.line,
    backgroundColor: '#fafafa',
  },
  kvDivider: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, paddingHorizontal: 8,
    borderTopWidth: 1, borderTopColor: '#d0d0d0',
    marginTop: 2,
  },
  kvLabel: { fontSize: 9, color: '#444', flex: 3 },
  kvLabelBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.text, flex: 3 },
  kvNote: { fontSize: 7, color: C.muted, marginTop: 1 },
  kvValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  // table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 6, paddingHorizontal: 8,
    borderRadius: 4, marginBottom: 2,
  },
  tableHeaderText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#555', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: C.line },
  tableRowAlt: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: C.line, backgroundColor: '#fafafa' },
  cellDescription: { flex: 3, fontSize: 9, color: '#333' },
  cellCategory: { flex: 2, fontSize: 9, color: '#666' },
  cellDate: { flex: 1.5, fontSize: 9, color: '#999', textAlign: 'center' },
  cellAmount: { flex: 1.5, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  cellAmountRed: { flex: 1.5, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: C.red },
  cellAmountGreen: { flex: 1.5, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: C.green },

  // pro-labore scenarios
  proLaboreGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  proLaboreCard: { flex: 1, padding: 10, borderRadius: 6, borderWidth: 1 },
  proLaboreCardLabel: { fontSize: 7, color: C.muted, textTransform: 'uppercase', marginBottom: 4 },
  proLaboreCardValue: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  proLaboreDesc: { fontSize: 7, color: C.muted, marginTop: 3 },

  footer: {
    position: 'absolute',
    bottom: 20, left: 40, right: 40,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 6, borderTopWidth: 1, borderTopColor: '#e5e7eb',
  },
  footerText: { fontSize: 7, color: '#aaa' },
  footerBrand: { fontSize: 7, color: C.blue, fontFamily: 'Helvetica-Bold' },

  disclaimer: { fontSize: 7, color: '#bbb', marginTop: 12, textAlign: 'center' },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function colorStyle(c?: 'green' | 'red' | 'yellow' | 'blue' | 'gray') {
  const map = { green: C.green, red: C.red, yellow: C.yellow, blue: C.blue, gray: C.gray }
  return c ? { color: map[c] } : { color: C.text }
}

// ─── Sub-renderers ─────────────────────────────────────────────────────────────

function KVSection({ section, startIndex = 0 }: { section: PDFSection; startIndex?: number }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.rows.map((row, i) => {
        const rowStyle = row.divider
          ? styles.kvDivider
          : (startIndex + i) % 2 === 0
          ? styles.kvRow
          : styles.kvRowAlt
        return (
          <View key={i} style={rowStyle}>
            <View style={{ flex: 3 }}>
              <Text style={row.bold || row.divider ? styles.kvLabelBold : styles.kvLabel}>{row.label}</Text>
              {row.note ? <Text style={styles.kvNote}>{row.note}</Text> : null}
            </View>
            <Text style={[styles.kvValue, colorStyle(row.color)]}>{row.value}</Text>
          </View>
        )
      })}
    </View>
  )
}

function TaxBreakdownSection({ data }: { data: PDFTaxBreakdown }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Composição do Imposto — {data.regime}</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 3 }]}>Tributo</Text>
        <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>Alíquota</Text>
        <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Valor</Text>
      </View>
      {data.items.map((item, i) => (
        <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
          <Text style={{ flex: 3, fontSize: 9, color: '#333' }}>{item.label}</Text>
          <Text style={{ flex: 1.5, fontSize: 9, color: C.gray, textAlign: 'center' }}>{item.ratePct}</Text>
          <Text style={[styles.cellAmountRed, { color: C.yellow }]}>{fmt(item.amount)}</Text>
        </View>
      ))}
      <View style={[styles.kvDivider, { marginTop: 4 }]}>
        <Text style={styles.kvLabelBold}>Total — {data.ratePct}</Text>
        <Text style={[styles.kvValue, { color: C.yellow }]}>{fmt(data.totalAmount)}</Text>
      </View>
      <View style={[styles.kvRow, { backgroundColor: '#fff8ed', borderColor: '#f59e0b30' }]}>
        <View style={{ flex: 3 }}>
          <Text style={styles.kvLabel}>Projeção anual (base atual × 12)</Text>
          <Text style={styles.kvNote}>Estimativa. Pode variar conforme faturamento real.</Text>
        </View>
        <Text style={[styles.kvValue, { color: C.red }]}>{fmt(data.annualProjection)}</Text>
      </View>
    </View>
  )
}

function ProLaboreSection({ data }: { data: PDFProLabore }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Pró-labore Sugerido</Text>
      <View style={styles.proLaboreGrid}>
        {[
          { label: 'Conservador', value: data.conservative, color: C.blue, desc: 'Mais seguro para o caixa' },
          { label: 'Equilibrado', value: data.balanced, color: C.green, desc: 'Recomendado pela PearFy' },
          { label: 'Agressivo', value: data.aggressive, color: C.yellow, desc: 'Menos reserva operacional' },
        ].map((s) => (
          <View key={s.label} style={[styles.proLaboreCard, { borderColor: s.color + '40', backgroundColor: s.color + '08' }]}>
            <Text style={styles.proLaboreCardLabel}>{s.label}</Text>
            <Text style={[styles.proLaboreCardValue, { color: s.color }]}>{fmt(s.value)}</Text>
            <Text style={styles.proLaboreDesc}>{s.desc}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Como a PearFy calcula</Text>
      {[
        { label: 'Lucro disponível', value: fmt(data.operationalProfit), color: data.operationalProfit >= 0 ? 'blue' as const : 'red' as const, bold: true, divider: true },
        { label: 'Reserva operacional (30%)', value: fmt(data.operationalReserve), color: 'gray' as const, note: 'Mantida antes da retirada' },
        { label: 'Pró-labore equilibrado', value: fmt(data.balanced), color: 'green' as const, bold: true },
      ].map((row, i) => (
        <View key={i} style={row.divider ? styles.kvDivider : i % 2 === 0 ? styles.kvRow : styles.kvRowAlt}>
          <View style={{ flex: 3 }}>
            <Text style={row.bold ? styles.kvLabelBold : styles.kvLabel}>{row.label}</Text>
            {row.note ? <Text style={styles.kvNote}>{row.note}</Text> : null}
          </View>
          <Text style={[styles.kvValue, colorStyle(row.color)]}>{row.value}</Text>
        </View>
      ))}
      {data.reason ? (
        <Text style={[styles.disclaimer, { marginTop: 8, textAlign: 'left', color: C.gray }]}>{data.reason}</Text>
      ) : null}
    </View>
  )
}

// ─── Document ─────────────────────────────────────────────────────────────────

export function FinancialReportPDF({ data }: { data: FinancialReportData }) {
  const isPJ = !!data.businessName
  const now = new Date().toLocaleDateString('pt-BR')
  const showCoreSummary = data.totalIncome > 0 || data.totalExpenses > 0 || data.balance !== 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>PearFy</Text>
            <Text style={styles.brandTagline}>Gestão Financeira PF e PJ com IA</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>{data.title}</Text>
            <Text style={styles.reportSubtitle}>{data.subtitle}</Text>
            <Text style={styles.reportMonth}>{data.month}</Text>
          </View>
        </View>

        {/* Business meta (PJ only) */}
        {isPJ && (
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>EMPRESA</Text>
              <Text style={styles.metaValue}>{data.businessName}</Text>
            </View>
            {data.taxRegime && (
              <View>
                <Text style={styles.metaLabel}>REGIME</Text>
                <Text style={styles.metaValue}>{data.taxRegime.toUpperCase()}</Text>
              </View>
            )}
            <View>
              <Text style={styles.metaLabel}>GERADO EM</Text>
              <Text style={styles.metaValue}>{now}</Text>
            </View>
          </View>
        )}

        {/* Summary cards — shown when there's meaningful financial data */}
        {showCoreSummary && (
          <View style={styles.summaryRow}>
            {data.totalIncome > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{isPJ ? 'Faturamento' : 'Renda Total'}</Text>
                <Text style={styles.summaryValueGreen}>{fmt(data.totalIncome)}</Text>
              </View>
            )}
            {data.totalExpenses > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Despesas</Text>
                <Text style={styles.summaryValueRed}>{fmt(data.totalExpenses)}</Text>
              </View>
            )}
            {isPJ && data.taxAmount !== undefined && data.taxAmount > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Impostos Est.</Text>
                <Text style={styles.summaryValueYellow}>{fmt(data.taxAmount)}</Text>
              </View>
            )}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{isPJ ? 'Lucro Líquido' : 'Saldo'}</Text>
              <Text style={(isPJ ? (data.netProfit ?? data.balance) : data.balance) >= 0 ? styles.summaryValueBlue : styles.summaryValueRed}>
                {fmt(isPJ ? (data.netProfit ?? data.balance) : data.balance)}
              </Text>
            </View>
            {isPJ && data.profitMargin && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Margem</Text>
                <Text style={styles.summaryValue}>{data.profitMargin}</Text>
              </View>
            )}
          </View>
        )}

        {/* Generic key-value sections (fully flexible per tab) */}
        {data.sections?.map((section, i) => (
          <KVSection key={i} section={section} startIndex={0} />
        ))}

        {/* Tax breakdown section */}
        {data.taxBreakdown && data.taxBreakdown.items.length > 0 && (
          <TaxBreakdownSection data={data.taxBreakdown} />
        )}

        {/* Pro-labore section */}
        {data.proLabore && data.proLabore.balanced > 0 && (
          <ProLaboreSection data={data.proLabore} />
        )}

        {/* Expenses table */}
        {data.expenses && data.expenses.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Despesas</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Descrição</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Categoria</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>Data</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Valor</Text>
            </View>
            {data.expenses.map((item, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.cellDescription}>{item.description ?? item.category}</Text>
                <Text style={styles.cellCategory}>{item.category}</Text>
                <Text style={styles.cellDate}>{item.date ?? '-'}</Text>
                <Text style={styles.cellAmountRed}>{fmt(item.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Income / Revenues table */}
        {data.incomes && data.incomes.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>{isPJ ? 'Receitas' : 'Rendas'}</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>{isPJ ? 'Descrição' : 'Nome'}</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Tipo / Categoria</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>Data</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Valor</Text>
            </View>
            {data.incomes.map((item, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.cellDescription}>{item.name}</Text>
                <Text style={styles.cellCategory}>{item.type}</Text>
                <Text style={styles.cellDate}>{item.date ?? '-'}</Text>
                <Text style={styles.cellAmountGreen}>{fmt(item.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.disclaimer}>
          ⚠️ Valores são estimativas para fins informativos. Consulte seu contador para apurações oficiais.
        </Text>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Gerado por PearFy em {now} · Apenas para fins informativos</Text>
          <Text style={styles.footerBrand}>pearfy.com.br</Text>
        </View>
      </Page>
    </Document>
  )
}
