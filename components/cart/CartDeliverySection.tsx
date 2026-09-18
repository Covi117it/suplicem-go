import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AddressPicker from "@/components/AddressPicker";
import { Palette } from "@/constants/theme";
import { Address } from "@/types/users";

export type DeliveryItem = {
  address: Address;
  products: { id: string; fundas: number }[];
};

type CartDeliverySectionProps = {
  deliveryType: string;
  onUpdateDeliveryType: (type: "domicilio" | "almacen") => void;
  userAddresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  customAddressText: string;
  onChangeCustomAddressText: (text: string) => void;
  customAdditionalInfo: string;
  onChangeCustomAdditionalInfo: (text: string) => void;
  onCustomPlaceSelected: (place: any) => void;
  saveAddressToProfile: boolean;
  onToggleSaveAddress: (save: boolean) => void;
};

export const CartDeliverySection: React.FC<CartDeliverySectionProps> = ({
  deliveryType,
  onUpdateDeliveryType,
  userAddresses,
  selectedAddress,
  onSelectAddress,
  customAddressText,
  onChangeCustomAddressText,
  customAdditionalInfo,
  onChangeCustomAdditionalInfo,
  onCustomPlaceSelected,
  saveAddressToProfile,
  onToggleSaveAddress,
}) => {
  const hasSavedAddresses = userAddresses && userAddresses.length > 0;
  const [activeTab, setActiveTab] = useState<"saved" | "new">(
    hasSavedAddresses ? "saved" : "new"
  );

  return (
    <View style={styles.container}>
      {/* 1. Selector de Tipo de Entrega */}
      <Text style={styles.sectionHeading}>Tipo de Entrega</Text>
      <View style={styles.deliveryTypeRow}>
        <TouchableOpacity
          style={[
            styles.deliveryTypeCard,
            deliveryType === "domicilio" && styles.deliveryTypeCardActive,
          ]}
          onPress={() => onUpdateDeliveryType("domicilio")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <Ionicons
              name="car-outline"
              size={22}
              color={deliveryType === "domicilio" ? Palette.primary : "#64748B"}
            />
            <Ionicons
              name={
                deliveryType === "domicilio"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={18}
              color={deliveryType === "domicilio" ? Palette.primary : "#94A3B8"}
            />
          </View>
          <Text
            style={[
              styles.deliveryTypeTitle,
              deliveryType === "domicilio" && styles.deliveryTypeTitleActive,
            ]}
          >
            A Domicilio / Obra
          </Text>
          <Text style={styles.deliveryTypeSub}>
            Llevamos el pedido hasta tu dirección
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deliveryTypeCard,
            deliveryType === "almacen" && styles.deliveryTypeCardActive,
          ]}
          onPress={() => onUpdateDeliveryType("almacen")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <Ionicons
              name="business-outline"
              size={22}
              color={deliveryType === "almacen" ? Palette.primary : "#64748B"}
            />
            <Ionicons
              name={
                deliveryType === "almacen"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={18}
              color={deliveryType === "almacen" ? Palette.primary : "#94A3B8"}
            />
          </View>
          <Text
            style={[
              styles.deliveryTypeTitle,
              deliveryType === "almacen" && styles.deliveryTypeTitleActive,
            ]}
          >
            Retiro en Almacén
          </Text>
          <Text style={styles.deliveryTypeSub}>
            Retiras en nuestra sede principal
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Sección de Dirección de Entrega (Solo para domicilio) */}
      {deliveryType === "domicilio" && (
        <View style={styles.addressSection}>
          <Text style={styles.sectionHeading}>Dirección de Entrega</Text>
          <Text style={styles.sectionSub}>
            Selecciona a dónde enviaremos tu material
          </Text>

          {/* Selector de pestañas: Guardadas vs Nueva */}
          {hasSavedAddresses && (
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "saved" && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab("saved")}
              >
                <Ionicons
                  name="home-outline"
                  size={16}
                  color={activeTab === "saved" ? Palette.primary : "#64748B"}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "saved" && styles.tabButtonTextActive,
                  ]}
                >
                  Guardadas ({userAddresses.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "new" && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab("new")}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={16}
                  color={activeTab === "new" ? Palette.primary : "#64748B"}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "new" && styles.tabButtonTextActive,
                  ]}
                >
                  Nueva Dirección
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Opción A: Direcciones Guardadas */}
          {activeTab === "saved" && hasSavedAddresses && (
            <View style={styles.savedAddressesList}>
              {userAddresses.map((addr, index) => {
                const isSelected =
                  selectedAddress?.description === addr.description &&
                  selectedAddress?.placeId === addr.placeId;

                return (
                  <TouchableOpacity
                    key={addr.placeId || `saved-addr-${index}`}
                    style={[
                      styles.addressCard,
                      isSelected && styles.addressCardSelected,
                    ]}
                    onPress={() => onSelectAddress(addr)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.addressCardLeft}>
                      <Ionicons
                        name={
                          isSelected
                            ? "radio-button-on"
                            : "radio-button-off"
                        }
                        size={20}
                        color={isSelected ? Palette.primary : "#94A3B8"}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.addressTitleRow}>
                        <Text
                          style={[
                            styles.addressDescription,
                            isSelected && styles.addressDescriptionSelected,
                          ]}
                          numberOfLines={2}
                        >
                          {addr.description}
                        </Text>
                        {index === 0 && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>Principal</Text>
                          </View>
                        )}
                      </View>
                      {Boolean(addr.additionalInfo) && (
                        <Text style={styles.addressAdditional}>
                          📍 {addr.additionalInfo}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Opción B: Nueva Dirección */}
          {(activeTab === "new" || !hasSavedAddresses) && (
            <View style={styles.newAddressContainer}>
              {!hasSavedAddresses && (
                <View style={styles.infoBanner}>
                  <Ionicons name="information-circle" size={20} color="#2563EB" />
                  <Text style={styles.infoBannerText}>
                    No tienes direcciones guardadas en tu perfil. Ingresa la dirección donde deseas recibir el pedido:
                  </Text>
                </View>
              )}

              <Text style={styles.fieldLabel}>Buscar o escribir dirección:</Text>
              <AddressPicker
                initialValue={customAddressText}
                onPlaceSelected={onCustomPlaceSelected}
              />

              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                Detalles adicionales / Referencia (Opcional):
              </Text>
              <TextInput
                style={styles.textInput}
                value={customAdditionalInfo}
                onChangeText={onChangeCustomAdditionalInfo}
                placeholder="Ej. Frente a la plaza, Apto 2B, portón negro..."
                placeholderTextColor={Palette.placeholder}
              />

              {/* Checkbox para guardar en el perfil */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => onToggleSaveAddress(!saveAddressToProfile)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={saveAddressToProfile ? "checkbox" : "square-outline"}
                  size={22}
                  color={saveAddressToProfile ? Palette.primary : "#94A3B8"}
                />
                <Text style={styles.checkboxLabel}>
                  Guardar esta dirección en mi cuenta para próximos pedidos
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 3. Confirmación Visual de Dirección Seleccionada */}
          {selectedAddress && (
            <View style={styles.confirmedBox}>
              <View style={styles.confirmedHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                <Text style={styles.confirmedTitle}>
                  Dirección confirmada para el despacho:
                </Text>
              </View>
              <Text style={styles.confirmedAddressText}>
                📍 {selectedAddress.description}
              </Text>
              {Boolean(selectedAddress.additionalInfo) && (
                <Text style={styles.confirmedAdditionalText}>
                  ℹ️ {selectedAddress.additionalInfo}
                </Text>
              )}
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
    marginTop: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: Palette.primaryDark,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: Palette.textMuted,
    marginBottom: 12,
  },
  deliveryTypeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    marginTop: 6,
  },
  deliveryTypeCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  deliveryTypeCardActive: {
    borderColor: Palette.primary,
    backgroundColor: "#F0F7FF",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  deliveryTypeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 2,
  },
  deliveryTypeTitleActive: {
    color: Palette.primary,
  },
  deliveryTypeSub: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 14,
  },
  addressSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    padding: 3,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabButtonTextActive: {
    color: Palette.primary,
  },
  savedAddressesList: {
    gap: 8,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  addressCardSelected: {
    borderColor: Palette.primary,
    backgroundColor: "#F0F7FF",
  },
  addressCardLeft: {
    marginTop: 2,
  },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  addressDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  addressDescriptionSelected: {
    color: Palette.primary,
  },
  primaryBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: "#1D4ED8",
    fontWeight: "700",
  },
  addressAdditional: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  newAddressContainer: {
    marginTop: 4,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoBannerText: {
    fontSize: 12,
    color: "#1E40AF",
    flex: 1,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: "#1E293B",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },
  confirmedBox: {
    marginTop: 14,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 10,
    padding: 12,
  },
  confirmedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  confirmedTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#15803D",
  },
  confirmedAddressText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#166534",
  },
  confirmedAdditionalText: {
    fontSize: 12,
    color: "#15803D",
    marginTop: 3,
  },
});
