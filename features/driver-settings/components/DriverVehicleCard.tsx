import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SettingsInfoRow } from "@/components/settings";
import { DRIVER_VEHICLE_TON_OPTIONS } from "@/constants/cartConstants";

interface DriverVehicleCardProps {
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: string | number;
  vehicleTons?: string | number;
  vehiclePlateNumber?: string;
}

export const DriverVehicleCard: React.FC<DriverVehicleCardProps> = ({
  vehicleBrand,
  vehicleModel,
  vehicleYear,
  vehicleTons,
  vehiclePlateNumber,
}) => {
  const tonsLabel =
    DRIVER_VEHICLE_TON_OPTIONS.find((opt) => opt.value === String(vehicleTons))?.label ||
    (vehicleTons ? `${vehicleTons} Toneladas` : "No registrada");

  return (
    <View style={styles.card}>
      <View style={styles.plateHeaderBox}>
        <Ionicons name="car-sport" size={20} color="#0F294A" />
        <View style={{ flex: 1 }}>
          <Text style={styles.plateHeaderLabel}>PLACA VEHICULAR</Text>
          <Text style={styles.plateHeaderValue}>
            {vehiclePlateNumber ? vehiclePlateNumber.toUpperCase() : "NO ASIGNADA"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />
      <SettingsInfoRow
        label="Marca"
        value={vehicleBrand || "No registrada"}
        icon={<Ionicons name="car-outline" size={18} color="#0F294A" />}
      />
      <View style={styles.divider} />
      <SettingsInfoRow
        label="Modelo"
        value={vehicleModel || "No registrado"}
        icon={<Ionicons name="speedometer-outline" size={18} color="#0F294A" />}
      />
      <View style={styles.divider} />
      <SettingsInfoRow
        label="Año"
        value={vehicleYear ? String(vehicleYear) : "No registrado"}
        icon={<Ionicons name="calendar-outline" size={18} color="#0F294A" />}
      />
      <View style={styles.divider} />
      <SettingsInfoRow
        label="Capacidad de Carga"
        value={tonsLabel}
        icon={<Ionicons name="cube-outline" size={18} color="#0F294A" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 64,
  },
  plateHeaderBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F1F5F9",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  plateHeaderLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  plateHeaderValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
    marginTop: 1,
  },
});
