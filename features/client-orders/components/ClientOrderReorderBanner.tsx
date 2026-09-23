import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface ClientOrderReorderBannerProps {
  itemsCount: number;
  onRepeatOrder: () => void;
}

export const ClientOrderReorderBanner: React.FC<ClientOrderReorderBannerProps> = ({
  itemsCount,
  onRepeatOrder,
}) => {
  return (
    <View style={styles.reorderCard}>
      <View style={styles.reorderHeader}>
        <View style={styles.reorderIconBadge}>
          <Ionicons name="repeat" size={22} color={Palette.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reorderTitle}>
            ¿Volver a pedir estos materiales?
          </Text>
          <Text style={styles.reorderSubtitle}>
            Carga los {itemsCount} productos directamente a tu carrito
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.reorderButton}
        onPress={onRepeatOrder}
        activeOpacity={0.85}
      >
        <Ionicons
          name="cart-outline"
          size={18}
          color="#fff"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.reorderButtonText}>Repetir este pedido</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  reorderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 14,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reorderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  reorderIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  reorderTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F294A",
  },
  reorderSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  reorderButton: {
    flexDirection: "row",
    backgroundColor: Palette.primary,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  reorderButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
