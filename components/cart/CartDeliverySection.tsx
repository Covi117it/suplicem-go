import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AddressPicker from "@/components/AddressPicker";
import CustomPickerModal from "@/components/CustomPickerModal";
import { DELIVERY_OPTIONS } from "@/constants/cartConstants";
import { Palette } from "@/constants/theme";
import { Address } from "@/types/users";

export type DeliveryItem = {
  address: Address;
  products: { id: string; fundas: number }[];
};

type CartDeliverySectionProps = {
  deliveryType: string;
  onUpdateDeliveryType: (type: any) => void;
  selectedDeliveryAddress: string;
  onSelectDeliveryAddress: (addressDesc: string) => void;
  addressOptions: { label: string; value: string }[];
  deliveries: DeliveryItem[];
  onCustomPlaceSelected: (place: any) => void;
};

export const CartDeliverySection: React.FC<CartDeliverySectionProps> = ({
  deliveryType,
  onUpdateDeliveryType,
  selectedDeliveryAddress,
  onSelectDeliveryAddress,
  addressOptions,
  deliveries,
  onCustomPlaceSelected,
}) => {
  return (
    <View style={styles.container}>
      <CustomPickerModal
        label="Tipo de entrega"
        selectedValue={deliveryType}
        onValueChange={onUpdateDeliveryType}
        options={DELIVERY_OPTIONS}
      />

      {deliveryType === "domicilio" && (
        <View style={{ marginTop: 14 }}>
          <CustomPickerModal
            label="Dirección de entrega"
            selectedValue={selectedDeliveryAddress}
            onValueChange={onSelectDeliveryAddress}
            options={[
              { label: "Seleccionar dirección registrada", value: "" },
              ...addressOptions,
            ]}
          />

          <Text style={[styles.label, { marginTop: 10 }]}>
            O buscar/ingresar nueva dirección para este pedido:
          </Text>
          <AddressPicker onPlaceSelected={onCustomPlaceSelected} />

          {deliveries.length > 0 && (
            <View style={styles.deliveriesContainer}>
              <Text style={styles.deliveriesTitle}>
                📍 Dirección asignada para el despacho:
              </Text>
              {deliveries.map((delivery, idx) => (
                <View key={idx} style={styles.deliveryCard}>
                  <Text style={styles.deliveryAddress}>
                    {delivery.address.description}
                    {delivery.address.additionalInfo
                      ? `, ${delivery.address.additionalInfo}`
                      : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default CartDeliverySection;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: Palette.primaryDark,
  },
  deliveriesContainer: {
    marginTop: 14,
    padding: 10,
    backgroundColor: Palette.surface,
    borderRadius: 8,
    borderColor: Palette.border,
    borderWidth: 1,
  },
  deliveriesTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 8,
    color: Palette.primaryDark,
  },
  deliveryCard: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
  },
  deliveryAddress: {
    fontWeight: "600",
    fontSize: 13,
    color: "#334155",
  },
});
