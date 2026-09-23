import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ClientOrderDriverCardProps {
  driver: any;
  onCallDriver: () => void;
  onWhatsappDriver: (phone?: string) => void;
}

export const ClientOrderDriverCard: React.FC<ClientOrderDriverCardProps> = ({
  driver,
  onCallDriver,
  onWhatsappDriver,
}) => {
  if (!driver) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionSubtitle}>
        🚚 Conductor y Vehículo de Despacho
      </Text>
      <View style={styles.driverInfoCard}>
        <Text style={styles.driverText}>
          👤 <Text style={{ fontWeight: "bold" }}>Conductor:</Text>{" "}
          {driver?.names} {driver?.lastNames}
        </Text>
        <Text style={styles.driverText}>
          📞 <Text style={{ fontWeight: "bold" }}>Teléfono:</Text>{" "}
          {driver?.phone}
        </Text>

        {driver?.vehicle && (
          <View style={styles.driverPlateBadge}>
            <Ionicons name="car-sport" size={20} color="#0F294A" />
            <View style={{ flex: 1 }}>
              <Text style={styles.driverPlateLabel}>
                NÚMERO DE PLACA VEHICULAR
              </Text>
              <Text style={styles.driverPlateNumber}>
                {driver.vehicle.plateNumber || "No registrada"}
              </Text>
              <Text style={styles.driverVehicleModel}>
                {driver.vehicle.brand} {driver.vehicle.model}{" "}
                {driver.vehicle.year ? `(${driver.vehicle.year})` : ""}
              </Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.callButton} onPress={onCallDriver}>
        <Text style={styles.actionText}>📞 Llamar al conductor</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.callButton, styles.whatsappButton]}
        onPress={() => onWhatsappDriver(driver?.phone)}
      >
        <Text style={styles.actionText}>💬 Chat en WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#0F294A",
  },
  driverInfoCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  driverText: {
    fontSize: 14,
    color: "#222",
    marginBottom: 4,
  },
  driverPlateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    gap: 10,
  },
  driverPlateLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.5,
  },
  driverPlateNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
    letterSpacing: 1,
  },
  driverVehicleModel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  callButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 4,
  },
  whatsappButton: {
    backgroundColor: "#16A34A",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
