import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatRD } from "@/utils/currencyUtils";
import { OrderItem } from "@/types/orders";

interface OrderProductsCardProps {
  items: OrderItem[];
}

export const OrderProductsCard: React.FC<OrderProductsCardProps> = ({ items }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Productos</Text>
      {(items || []).map((item, index) => (
        <View key={item.productId || `item-${index}`} style={styles.productCard}>
          <Text style={styles.productTitle}>🛒 Producto {index + 1}</Text>
          <Text style={styles.productLine}>
            📄 <Text style={styles.bold}>Descripción:</Text> {item.name}
          </Text>
          <Text style={styles.productLine}>
            📦 <Text style={styles.bold}>Cantidad:</Text> {item.quantity}{" "}
            {item.unit}
          </Text>
          <Text style={styles.productLine}>
            💰 <Text style={styles.bold}>Monto total:</Text>{" "}
            {formatRD(item.subtotal)}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C1810",
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#A04A0E",
    marginBottom: 6,
  },
  productLine: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
});
