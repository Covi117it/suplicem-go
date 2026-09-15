import React from "react";
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

type ProfileAddressesCardProps = {
  isEditing: boolean;
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  userAddresses?: Address[] | null;
};

export const ProfileAddressesCard: React.FC<ProfileAddressesCardProps> = ({
  isEditing,
  addresses,
  setAddresses,
  userAddresses = [],
}) => {
  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        placeId: "",
        description: "",
        latitude: 0,
        longitude: 0,
        additionalInfo: "",
      },
    ]);
  };

  const removeAddress = (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
  };

  const addressesList = userAddresses || [];

  return (
    <View style={styles.cardSharp}>
      <Text style={styles.sectionTitle}>Direcciones de Entrega</Text>

      {isEditing ? (
        <>
          {addresses.length > 0 ? (
            addresses.map((addr, index) => (
              <View key={index} style={{ marginBottom: 15 }}>
                <Text style={{ marginBottom: 4, fontWeight: "500" }}>
                  {addr?.description || "Selecciona una dirección"}
                </Text>
                <AddressPicker
                  initialValue={addr?.description || ""}
                  onPlaceSelected={(place) => {
                    const updated = [...addresses];
                    updated[index] = { ...updated[index], ...place };
                    setAddresses(updated);
                  }}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Información adicional (ej: Apto. 402, frente a Supermercado)"
                  placeholderTextColor="#999"
                  value={addr.additionalInfo}
                  onChangeText={(text) => {
                    const updated = [...addresses];
                    updated[index].additionalInfo = text;
                    setAddresses(updated);
                  }}
                />
                {addresses.length > 1 && (
                  <TouchableOpacity onPress={() => removeAddress(index)}>
                    <Text style={styles.link}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay direcciones registradas</Text>
          )}
          <TouchableOpacity onPress={addAddress}>
            <Text style={styles.link}>+ Agregar dirección</Text>
          </TouchableOpacity>
        </>
      ) : addressesList.length > 0 ? (
        addressesList.map((address, i) => (
          <View key={i} style={styles.addressItem}>
            <Ionicons
              name="location-sharp"
              size={20}
              color={Palette.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.addressText}>
              {address?.description}
              {address?.additionalInfo && `, ${address.additionalInfo}`}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No hay direcciones registradas</Text>
      )}
    </View>
  );
};

export default ProfileAddressesCard;

const styles = StyleSheet.create({
  cardSharp: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Palette.primaryDark,
    marginBottom: 12,
  },
  inputField: {
    backgroundColor: "#FAF8F5",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 42,
    fontSize: 13,
    color: Palette.primaryDark,
    marginTop: 6,
  },
  addressItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  addressText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  link: {
    color: Palette.primary,
    fontWeight: "bold",
    marginTop: 6,
  },
  emptyText: {
    color: "#6b7280",
    fontStyle: "italic",
    marginVertical: 4,
  },
});
