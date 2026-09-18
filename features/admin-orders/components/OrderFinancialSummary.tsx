import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRD } from "@/utils/currencyUtils";
import { OrderItem } from "@/types/orders";

interface OrderFinancialSummaryProps {
  items: OrderItem[];
  comments?: string;
}

export const OrderFinancialSummary: React.FC<OrderFinancialSummaryProps> = ({
  items,
  comments,
}) => {
  const totalItemsCount = (items || []).reduce(
    (acc, item) => acc + (Number(item.quantity) || 0),
    0
  );

  const paymentMethodLabel = comments?.includes("Transferencia")
    ? "Transferencia Bancaria"
    : "Pago a Crédito";

  const totalAmount = (items || []).reduce(
    (sum, item) =>
      sum + (Number(item.subtotal) || Number(item.unitPrice || 0) * Number(item.quantity || 0)),
    0
  );

  return (
    <View style={styles.orderSummaryCard}>
      <View style={styles.orderSummaryHeader}>
        <Ionicons name="receipt-outline" size={20} color="#0F294A" />
        <Text style={styles.orderSummaryTitle}>Resumen General de la Orden</Text>
      </View>
      <View style={styles.orderSummaryRow}>
        <Text style={styles.orderSummaryLabel}>Total Artículos:</Text>
        <Text style={styles.orderSummaryValue}>{totalItemsCount} ítems</Text>
      </View>
      <View style={styles.orderSummaryRow}>
        <Text style={styles.orderSummaryLabel}>Método de Pago:</Text>
        <Text style={styles.orderSummaryValueBold}>{paymentMethodLabel}</Text>
      </View>
      <View style={[styles.orderSummaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>TOTAL GENERAL DE LA ORDEN:</Text>
        <Text style={styles.totalAmountText}>{formatRD(totalAmount)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderSummaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  orderSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  orderSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderSummaryLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  orderSummaryValue: {
    fontSize: 14,
    color: "#1E293B",
  },
  orderSummaryValueBold: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
  },
  totalAmountText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E31E24",
  },
});
