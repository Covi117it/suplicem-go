import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ReassignDriverModalProps {
  visible: boolean;
  onClose: () => void;
  drivers: any[];
  onSelectDriver: (driverId: string) => void;
  tripNumber?: string;
}

export const ReassignDriverModal: React.FC<ReassignDriverModalProps> = ({
  visible,
  onClose,
  drivers,
  onSelectDriver,
  tripNumber,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Reasignar Conductor</Text>
              <Text style={styles.subtitle}>
                {tripNumber ? `Viaje: ${tripNumber}` : "Selecciona un nuevo conductor"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {drivers.length === 0 ? (
              <Text style={styles.emptyText}>No hay conductores activos disponibles.</Text>
            ) : (
              drivers.map((d) => {
                const driverUid = d.uid || d.id;
                const driverCode = d.driverCode || "CHOFER";
                const capacity = d.truckCapacity ? `${d.truckCapacity} t` : "";
                const fullName = `${d.names || ""} ${d.lastNames || ""}`.trim() || "Sin nombre";

                return (
                  <TouchableOpacity
                    key={driverUid}
                    style={styles.driverItem}
                    activeOpacity={0.7}
                    onPress={() => onSelectDriver(driverUid)}
                  >
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={18} color="#0F294A" />
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.name}>{fullName}</Text>
                      <Text style={styles.details}>
                        [{driverCode}] {d.phone || "Sin teléfono"}{capacity ? ` • Camión: ${capacity}` : ""}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReassignDriverModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F294A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginVertical: 20,
    fontSize: 14,
  },
  driverItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  details: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  cancelBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelBtnText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },
});
