import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { formatRD } from "@/utils/currencyUtils";
import { Product } from "./ProductCatalogCard";

export const QUANTITY_OPTIONS = [
  { fundas: 100, label: "4.25 t (100 fundas)" },
  { fundas: 200, label: "8.5 t (200 fundas)" },
  { fundas: 300, label: "12.75 t (300 fundas)" },
  { fundas: 400, label: "17 t (400 fundas)" },
  { fundas: 500, label: "20.25 t (500 fundas)" },
  { fundas: 600, label: "25.5 t (600 fundas)" },
  { fundas: 1000, label: "42.5 t (1000 fundas)" },
];

type ProductQuantityModalProps = {
  product: Product | null;
  quantity: string;
  setQuantity: (qty: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export const ProductQuantityModal: React.FC<ProductQuantityModalProps> = ({
  product,
  quantity,
  setQuantity,
  onClose,
  onConfirm,
}) => {
  if (!product) return null;

  const currentQtyNum = parseInt(quantity, 10) || 100;
  const subtotal = product.price * currentQtyNum;

  return (
    <Modal
      visible={product !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
            <Ionicons name="close-circle" size={24} color="#94A3B8" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Seleccionar Cantidad</Text>
          <Text style={styles.modalProductName}>{product.name}</Text>
          <Text style={styles.modalProductPrice}>{formatRD(product.price)} c/u</Text>

          <Text style={styles.optionsSectionTitle}>Cantidad / Toneladas:</Text>

          <View style={styles.optionsGrid}>
            {QUANTITY_OPTIONS.map((opt) => {
              const isSelected = parseInt(quantity, 10) === opt.fundas;
              return (
                <TouchableOpacity
                  key={opt.fundas}
                  style={[
                    styles.fixedOptionChip,
                    isSelected && styles.fixedOptionChipSelected,
                  ]}
                  onPress={() => setQuantity(String(opt.fundas))}
                >
                  <Text
                    style={[
                      styles.fixedOptionText,
                      isSelected && styles.fixedOptionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.subtotalText}>
            Subtotal:{" "}
            <Text style={{ color: Palette.primary, fontWeight: "bold" }}>
              {formatRD(subtotal)}
            </Text>
          </Text>

          <TouchableOpacity style={styles.confirmAddBtn} onPress={onConfirm}>
            <Ionicons
              name="cart-sharp"
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.confirmAddBtnText}>Agregar al Carrito</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ProductQuantityModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 41, 74, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  closeModalBtn: {
    position: "absolute",
    top: 14,
    right: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Palette.primaryDark,
    marginBottom: 6,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    marginBottom: 2,
  },
  modalProductPrice: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  optionsSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Palette.primaryDark,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    rowGap: 10,
    marginBottom: 18,
  },
  fixedOptionChip: {
    width: "48%",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  fixedOptionChipSelected: {
    backgroundColor: Palette.primaryDark,
    borderColor: Palette.primaryDark,
    shadowColor: Palette.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  fixedOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
  fixedOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  subtotalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 18,
  },
  confirmAddBtn: {
    backgroundColor: Palette.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
  },
  confirmAddBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
