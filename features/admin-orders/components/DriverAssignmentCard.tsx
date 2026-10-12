import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types/users";
import { Trip } from "@/types/trips";
import { Order } from "@/types/orders";
import { DriverSelectionModal } from "./DriverSelectionModal";

interface DriverAssignmentCardProps {
  order: Order;
  drivers: User[];
  allTrips: Trip[];
  selectedDriverId: string;
  onSelectDriver: (driverId: string) => void;
}

export const DriverAssignmentCard: React.FC<DriverAssignmentCardProps> = ({
  order,
  drivers,
  allTrips,
  selectedDriverId,
  onSelectDriver,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedDriver = drivers.find((d) => d.uid === selectedDriverId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-add-outline" size={20} color="#0F294A" />
        <Text style={styles.title}>Asignar Conductor al Viaje</Text>
      </View>
      <Text style={styles.subtitle}>
        Verifica la capacidad del vehículo y el estado en ruta antes de asignar.
      </Text>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
        <Text style={styles.selectButtonText}>
          {selectedDriverId ? "Cambiar Conductor" : "Seleccionar Conductor"}
        </Text>
      </TouchableOpacity>

      {selectedDriverId && selectedDriver ? (
        <View style={styles.selectedDriverBadge}>
          <Ionicons name="checkmark-circle" size={18} color="#166534" />
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedDriverBadgeText}>
              [{selectedDriver.driverCode || "COND-" + (selectedDriver.uid?.slice(0, 5).toUpperCase() || "XXXX")}] {selectedDriver.names} {selectedDriver.lastNames}
            </Text>
            <Text style={styles.selectedDriverSubtext}>
              Capacidad: {selectedDriver.vehicle?.tons ? `${Number(selectedDriver.vehicle.tons).toFixed(2)} t` : "No reg."} • Placa: {selectedDriver.vehicle?.plateNumber || "N/A"}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.unassignedDriverBadge}>
          <Ionicons name="globe-outline" size={18} color="#1E40AF" />
          <Text style={styles.unassignedDriverBadgeText}>
            Sin asignar: Disponible para todos los conductores activos con capacidad.
          </Text>
        </View>
      )}

      <DriverSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        order={order}
        drivers={drivers}
        allTrips={allTrips}
        selectedDriverId={selectedDriverId}
        onSelectDriver={onSelectDriver}
      />
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
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F294A",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  selectedDriverBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  selectedDriverBadgeText: {
    fontSize: 13,
    color: "#166534",
    fontWeight: "600",
  },
  selectedDriverSubtext: {
    fontSize: 12,
    color: "#15803D",
    marginTop: 2,
  },
  unassignedDriverBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  unassignedDriverBadgeText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
});
