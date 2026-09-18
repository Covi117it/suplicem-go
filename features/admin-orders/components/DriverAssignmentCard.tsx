import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomPickerModal from "@/components/CustomPickerModal";
import { User } from "@/types/users";

interface DriverAssignmentCardProps {
  drivers: User[];
  selectedDriverId: string;
  onSelectDriver: (driverId: string) => void;
}

export const DriverAssignmentCard: React.FC<DriverAssignmentCardProps> = ({
  drivers,
  selectedDriverId,
  onSelectDriver,
}) => {
  const selectedDriver = drivers.find((d) => d.uid === selectedDriverId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-add-outline" size={20} color="#0F294A" />
        <Text style={styles.title}>Asignar Conductor al Viaje</Text>
      </View>
      <Text style={styles.subtitle}>
        Selecciona un conductor por su ID para asignarle la entrega exclusivamente, o déjalo en "Sin asignar" para que cualquier conductor disponible pueda tomarlo.
      </Text>

      <CustomPickerModal
        label="Seleccionar conductor..."
        selectedValue={selectedDriverId}
        onValueChange={(val) => onSelectDriver(val)}
        options={[
          { label: "🌐 Sin asignar (Disponible para todos)", value: "" },
          ...drivers.map((drv) => ({
            label: `[${drv.driverCode || ("COND-" + (drv.uid ? drv.uid.slice(0, 5).toUpperCase() : "XXXX"))}] ${drv.names} ${drv.lastNames}${drv.vehicle?.plateNumber ? ` (Placa: ${drv.vehicle.plateNumber})` : ""}`,
            value: drv.uid || "",
          })),
        ]}
      />

      {selectedDriverId ? (
        <View style={styles.selectedDriverBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
          <Text style={styles.selectedDriverBadgeText}>
            Asignado a:{" "}
            {selectedDriver
              ? `[${selectedDriver.driverCode || ("COND-" + (selectedDriver.uid ? selectedDriver.uid.slice(0, 5).toUpperCase() : "XXXX"))}] ${selectedDriver.names} ${selectedDriver.lastNames}`
              : selectedDriverId}
          </Text>
        </View>
      ) : (
        <View style={styles.unassignedDriverBadge}>
          <Ionicons name="information-circle-outline" size={16} color="#0F294A" />
          <Text style={styles.unassignedDriverBadgeText}>
            El viaje estará disponible para cualquier conductor activo en su pantalla principal.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
    lineHeight: 18,
  },
  selectedDriverBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  selectedDriverBadgeText: {
    fontSize: 13,
    color: "#166534",
    fontWeight: "600",
  },
  unassignedDriverBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  unassignedDriverBadgeText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
});
