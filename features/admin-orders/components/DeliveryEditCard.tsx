import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomPickerModal from "@/components/CustomPickerModal";
import { Address, User } from "@/types/users";
import { DeliveryDetail } from "@/types/orders";

interface DeliveryEditCardProps {
  delivery: any;
  index: number;
  users: User[];
  productOptions: { label: string; value: string }[];
  maxQuantity: number;
  onUserSelection: (userId: string, deliveryId: string) => void;
  onUpdateDelivery: (id: string, values: Partial<DeliveryDetail>) => void;
  onRemoveDelivery: (id: string) => void;
  onValidateQuantity: (newQuantity: number) => boolean;
}

export const DeliveryEditCard: React.FC<DeliveryEditCardProps> = ({
  delivery,
  index,
  users,
  productOptions,
  maxQuantity,
  onUserSelection,
  onUpdateDelivery,
  onRemoveDelivery,
  onValidateQuantity,
}) => {
  return (
    <View style={styles.deliveryCard}>
      <Text style={styles.deliveryCardTitle}>Entrega #{index + 1}</Text>

      {/* Selector de Usuario */}
      <Text style={styles.deliveryEditLabel}>Usuario Destinatario</Text>
      <CustomPickerModal
        label="Seleccionar usuario"
        selectedValue={delivery.address?.userUid ?? ""}
        onValueChange={(value) => onUserSelection(value, delivery.id)}
        options={[
          { label: "Seleccionar usuario", value: "" },
          ...users.map((user) => ({
            label: `${user.names} ${user.lastNames}`,
            value: user.uid || "",
          })),
        ]}
      />

      {/* Selector de Dirección */}
      <Text style={styles.deliveryEditLabel}>Dirección de Entrega</Text>
      <CustomPickerModal
        label="Seleccionar dirección"
        selectedValue={delivery.address?.placeId ?? ""}
        onValueChange={(value) => {
          const fullAddress =
            delivery.availableAddresses?.find(
              (addr: Address) => addr.placeId === value
            ) || delivery.address;
          if (fullAddress) {
            onUpdateDelivery(delivery.id, { address: fullAddress });
          }
        }}
        options={[
          { label: "Seleccionar dirección", value: "" },
          ...(delivery.availableAddresses?.map((addr: Address) => ({
            label: `${addr?.description}${
              addr?.additionalInfo ? ", " + addr.additionalInfo : ""
            }`,
            value: addr?.placeId,
          })) || []),
        ]}
      />

      {/* Selector de Producto */}
      <Text style={styles.deliveryEditLabel}>Producto</Text>
      <CustomPickerModal
        label="Seleccionar producto"
        selectedValue={delivery.productId}
        onValueChange={(value) =>
          onUpdateDelivery(delivery.id, { productId: value })
        }
        options={[{ label: "Seleccionar", value: "" }, ...productOptions]}
      />

      {/* Input de Cantidad */}
      <Text style={styles.deliveryEditLabel}>
        Cantidad ({delivery.unit || "uds."})
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder={`Cantidad (Máx disponible: ${maxQuantity})`}
        placeholderTextColor="#999"
        value={String(delivery.quantity ?? "")}
        onChangeText={(text) => {
          const num = Number(text) || 0;
          if (onValidateQuantity(num)) {
            onUpdateDelivery(delivery.id, { quantity: num });
          }
        }}
      />

      {/* Botón de Eliminar Entrega */}
      <TouchableOpacity
        style={styles.removeDeliveryButton}
        onPress={() => onRemoveDelivery(delivery.id)}
      >
        <Ionicons name="trash-outline" size={16} color="#fff" />
        <Text style={styles.removeDeliveryText}>Eliminar esta Entrega</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  deliveryCardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 8,
  },
  deliveryEditLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    height: 46,
    borderColor: "#CBD5E1",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    fontSize: 15,
    color: "#1E293B",
  },
  removeDeliveryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EF4444",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 14,
  },
  removeDeliveryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
