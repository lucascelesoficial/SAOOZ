import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PDFExpenseItem {
  description: string
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

export interface FinancialReportData {
  title: string
  subtitle: string
  month: string
  totalIncome: number
  totalExpenses: number
  balance: number
  expenses?: PDFExpenseItem[]
  incomes?: PDFIncomeItem[]
  // PJ specific
  taxAmount?: number
  netProfit?: number
  profitMargin?: string
  businessName?: string
  taxRegime?: string
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#0ea5e9',
  },
  brandName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9',
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 8,
    color: '#888',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  reportTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
  },
  reportSubtitle: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  reportMonth: {
    fontSize: 9,
    color: '#0ea5e9',
    marginTop: 2,
    fontFamily: 'Helvetica-Bold',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#f8faff',
    borderWidth: 1,
    borderColor: '#e5eeff',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
  },
  summaryValueGreen: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#16a34a',
  },
  summaryValueRed: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626',
  },
  summaryValueBlue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  cellDescription: { flex: 3, fontSize: 9, color: '#333' },
  cellCategory: { flex: 2, fontSize: 9, color: '#666' },
  cellDate: { flex: 1.5, fontSize: 9, color: '#999', textAlign: 'center' },
  cellAmount: { flex: 1.5, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  cellAmountRed: { flex: 1.5, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: '#dc2626' },
  cellAmountGreen: { flex: 1.5, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: '#16a34a' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: { fontSize: 7, color: '#aaa' },
  footerBrand: { fontSize: 7, color: '#0ea5e9', fontFamily: 'Helvetica-Bold' },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
    backgroundColor: '#f8faff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5eeff',
  },
  metaLabel: { fontSize: 8, color: '#888' },
  metaValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#333', marginTop: 2 },
})

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Document ─────────────────────────────────────────────────────────────────

export function FinancialReportPDF({ data }: { data: FinancialReportData }) {
  const isPJ = !!data.businessName
  const now = new Date().toLocaleDateString('pt-BR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>SAOOZ</Text>
            <Text style={styles.brandTagline}>Sistema Financeiro Operacional</Text>
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
            <View>
              <Text style={styles.metaLabel}>REGIME</Text>
              <Text style={styles.metaValue}>{data.taxRegime?.toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>GERADO EM</Text>
              <Text style={styles.metaValue}>{now}</Text>
            </View>
          </View>
        )}

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{isPJ ? 'Faturamento' : 'Renda Total'}</Text>
            <Text style={styles.summaryValueGreen}>{fmt(data.totalIncome)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Despesas</Text>
            <Text style={styles.summaryValueRed}>{fmt(data.totalExpenses)}</Text>
          </View>
          {isPJ && data.taxAmount !== undefined && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Impostos Est.</Text>
              <Text style={styles.summaryValue}>{fmt(data.taxAmount)}</Text>
            </View>
          )}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{isPJ ? 'Lucro Líquido' : 'Saldo'}</Text>
            <Text style={(isPJ ? data.netProfit ?? data.balance : data.balance) >= 0 ? styles.summaryValueBlue : styles.summaryValueRed}>
              {fmt(isPJ ? data.netProfit ?? data.balance : data.balance)}
            </Text>
          </View>
        </View>

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
                <Text style={styles.cellDescription}>{item.description}</Text>
                <Text style={styles.cellCategory}>{item.category}</Text>
                <Text style={styles.cellDate}>{item.date ?? '-'}</Text>
                <Text style={styles.cellAmountRed}>{fmt(item.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Income table */}
        {data.incomes && data.incomes.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>{isPJ ? 'Receitas' : 'Rendas'}</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>{isPJ ? 'Descrição' : 'Nome'}</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Tipo</Text>
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

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Gerado por SAOOZ em {now} · Apenas para fins informativos</Text>
          <Text style={styles.footerBrand}>saooz.com</Text>
        </View>
      </Page>
    </Document>
  )
}
