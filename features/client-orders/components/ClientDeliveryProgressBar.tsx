import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tonsToBags } from "@/constants/cartConstants";

interface ClientDeliveryProgressBarProps {
  deliveredTons: number;
  totalTons: number;
  items?: any[];
}

export const ClientDeliveryProgressBar: React.FC<ClientDeliveryProgressBarProps> = ({
  deliveredTons,
  totalTons,
  items,
}) => {
  if (!totalTons || totalTons <= 0) return null;

  const delivered = Math.max(0, Number(deliveredTons) || 0);
  const total = Number(totalTons) || 0;
  const progressPercent = Math.min(100, Math.max(0, Math.round((delivered / total) * 100)));

  // Calcular fundas reales sumando directamente los ítems de cemento de la orden
  const totalBagsInOrder = (items || []).reduce((sum: number, item: any) => {
    const isCement = item?.unit === "fundas" || !item?.unit || item?.name?.toLowerCase().includes("cemento");
    return sum + (isCement ? (Number(item?.quantity) || 0) : 0);
  }, 0);

  const hasCement = totalBagsInOrder > 0;
  const progressRatio = total > 0 ? Math.min(1, Math.max(0, delivered / total)) : 0;
  const deliveredBags = Math.round(totalBagsInOrder * progressRatio);
  const totalBags = totalBagsInOrder;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Ionicons name="bar-chart-outline" size={18} color="#0F294A" />
          <Text style={styles.title}>Progreso General de Entrega</Text>
        </View>
        <Text style={styles.percentageText}>{progressPercent}%</Text>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Subtítulo con toneladas y fundas */}
      <View style={styles.labelsRow}>
        <Text style={styles.infoText}>
          <Text style={styles.bold}>{delivered.toFixed(1)}</Text> de{" "}
          <Text style={styles.bold}>{total.toFixed(1)} toneladas</Text> entregadas
          {hasCement && totalBags > 0 ? (
            <Text style={styles.bagsText}>
              {" "}• {deliveredBags.toLocaleString()} de {totalBags.toLocaleString()} fundas
            </Text>
          ) : null}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F294A",
  },
  percentageText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#EA580C",
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#EA580C",
    borderRadius: 6,
  },
  labelsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  infoText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  bold: {
    fontWeight: "bold",
    color: "#0F294A",
  },
  bagsText: {
    color: "#64748B",
    fontSize: 12,
  },
});
