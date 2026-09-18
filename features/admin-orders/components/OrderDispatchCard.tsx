import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OrderDispatchCardProps {
  driver: {
    names: string;
    lastNames: string;
    phone?: string;
    vehicle?: {
      plateNumber?: string;
      brand?: string;
      model?: string;
      year?: string | number;
    };
  };
}

export const OrderDispatchCard: React.FC<OrderDispatchCardProps> = ({ driver }) => {
  return (
    <View style={styles.driverInfoCardAdmin}>
      <View style={styles.driverHeaderAdmin}>
        <Ionicons name="car-sport" size={22} color="#0F294A" />
        <Text style={styles.driverHeaderAdminTitle}>Conductor y Vehículo de Despacho</Text>
      </View>
      <Text style={styles.driverDetailText}>
        👤 <Text style={styles.bold}>Conductor:</Text> {driver.names} {driver.lastNames}
      </Text>
      {Boolean(driver.phone) && (
        <Text style={styles.driverDetailText}>
          📞 <Text style={styles.bold}>Teléfono:</Text> {driver.phone}
        </Text>
      )}
      {Boolean(driver.vehicle) && (
        <View style={styles.driverPlateBadgeAdminDetail}>
          <Text style={styles.driverPlateLabelAdmin}>NÚMERO DE PLACA VEHICULAR</Text>
          <Text style={styles.driverPlateNumberAdmin}>
            {driver.vehicle?.plateNumber || "No registrada"}
          </Text>
          <Text style={styles.driverVehicleModelAdmin}>
            {driver.vehicle?.brand} {driver.vehicle?.model}{" "}
            {driver.vehicle?.year ? `(${driver.vehicle.year})` : ""}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  driverInfoCardAdmin: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 16,
    marginBottom: 20,
  },
  driverHeaderAdmin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  driverHeaderAdminTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  driverDetailText: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  driverPlateBadgeAdminDetail: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  driverPlateLabelAdmin: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "bold",
  },
  driverPlateNumberAdmin: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
    marginVertical: 2,
  },
  driverVehicleModelAdmin: {
    fontSize: 13,
    color: "#475569",
  },
});
