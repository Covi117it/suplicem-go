import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRD } from "@/utils/currencyUtils";
import { TON_OPTIONS } from "@/constants/cartConstants";
import { Palette } from "@/constants/theme";

export type CartItemData = {
  id: string;
  name: string;
  basePrice: number;
  quantity: number;
  fundas?: number;
};

type CartItemCardProps = {
  item: CartItemData;
  onUpdateFundas: (fundas: number) => void;
  onRemove: () => void;
};

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateFundas,
  onRemove,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.itemCardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <TouchableOpacity style={styles.deleteItemBtn} onPress={onRemove}>
          <Ionicons name="trash-outline" size={18} color={Palette.danger} />
          <Text style={styles.deleteItemBtnText}>Borrar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.details}>
        Precio por unidad: {formatRD(item.basePrice)}
      </Text>

      <Text style={styles.label}>Cantidad / Toneladas:</Text>
      <View style={styles.tonContainer}>
        {TON_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.fundas}
            onPress={() => onUpdateFundas(option.fundas)}
            style={[
              styles.tonButton,
              item.fundas === option.fundas && styles.tonButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tonButtonText,
                item.fundas === option.fundas && { color: "#fff" },
              ]}
            >
              {option.toneladas} t ({option.fundas} fundas)
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtotalItemText}>
        Subtotal del producto:{" "}
        <Text style={{ fontWeight: "bold", color: Palette.primary }}>
          {formatRD((item.fundas || 1) * item.basePrice * item.quantity)}
        </Text>
      </Text>
    </View>
  );
};

export default CartItemCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: Palette.primaryDark,
    flex: 1,
  },
  deleteItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: Palette.dangerBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Palette.dangerBorder,
  },
  deleteItemBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Palette.danger,
  },
  details: {
    marginTop: 2,
    fontSize: 13,
    color: Palette.textMuted,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: Palette.primaryDark,
  },
  subtotalItemText: {
    marginTop: 10,
    fontSize: 14,
    color: "#334155",
  },
  tonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  tonButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.accent,
    marginRight: 4,
    marginBottom: 4,
  },
  tonButtonActive: {
    backgroundColor: Palette.accent,
  },
  tonButtonText: {
    fontSize: 12,
    color: Palette.accent,
    fontWeight: "500",
  },
});
