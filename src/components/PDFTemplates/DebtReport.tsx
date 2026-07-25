// src/components/PDFTemplates/DebtReport.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { getCurrencySymbol } from '@/utils/formatCurrency';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
  },
  overview: {
    marginBottom: 20,
  },
  description: {
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  },
  lastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "8px 0",
  },
  label: {
    color: "#666",
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    fontWeight: "bold",
  },
  progress: {
    height: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    // marginVertical: 15,
  },
  progressBar: {
    height: "100%",
    borderRadius: 50,
    backgroundColor: "#CDF345",
  },
  transactions: {
    // marginTop: 20,
  },
  transaction: {
    marginBottom: 16,
  },
  transactionText: {
    fontSize: 10,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 8,
    color: "#666",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#666",
  },
});

const getTransactionDescription = (transaction: any, record: any, userName?: string, currency?: string) => {
  const amount = `${getCurrencySymbol(currency || 'USD')}${transaction.amount.toFixed(2)}`;
  const reasonText = transaction.reason ? ` for ${transaction.reason}` : '';
  
  if (record.debtType === "given") {
    return transaction.type === "return"
      ? `${record.title} gave ${amount} to ${userName}${reasonText}`
      : `${record.title} borrowed ${amount} from ${userName}${reasonText}`;
  } else {
    return transaction.type === "return"
      ? `${userName} gave ${amount} to ${record.title}${reasonText}`
      : `${userName} borrowed ${amount} from ${record.title}${reasonText}`;
  }
};

const DebtReport = ({ record, session, currency }: { record: any; session: any; currency?: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Debt Details - {record.title}</Text>
      </View>

      <View style={styles.overview}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Overview</Text>
        <View style={styles.description}>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.value}>{getCurrencySymbol(currency || 'USD')}{record.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount Paid</Text>
            <Text style={styles.value}>{getCurrencySymbol(currency || 'USD')}{record.amountPaid.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>
              {record.debtType === "given"
                ? `${record.title} owes`
                : `${session?.user?.name} owes`} {getCurrencySymbol(currency || 'USD')}{record.amountRemaining.toFixed(2)}
            </Text>
          </View>
          <View style={styles.lastRow}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>
              {dayjs(record.date).format("DD MMM YYYY, hh:mm A")}
            </Text>
          </View>
        </View>

        <View style={styles.progress}>
          <View
            style={[
              styles.progressBar,
              { width: `${(record.amountPaid / record.totalAmount) * 100}%` },
            ]}
          />
        </View>
      </View>

      {record.transactions && record.transactions.length > 0 && (
        <View style={styles.transactions}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            Transaction History
          </Text>
          {record.transactions.map((transaction: any, index: number) => (
            <View key={index} style={styles.transaction}>
              <Text style={styles.transactionText}>
                {getTransactionDescription(transaction, record, session?.user?.name, currency)}
              </Text>
              <Text style={styles.transactionDate}>
                {dayjs(transaction.date).format("DD MMM YYYY, hh:mm A")}
              </Text>
              {transaction.notes && (
                <Text style={[styles.transactionText, { fontStyle: "italic" }]}>
                  {transaction.notes}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Generated using SmartSpend</Text>
      </View>
    </Page>
  </Document>
);

export default DebtReport;
