import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AdminUserRoleCardProps {
  user: any;
}

export const AdminUserRoleCard: React.FC<AdminUserRoleCardProps> = ({ user }) => {
  if (user?.userType === "driver") {
    const driverCode =
      user?.driverCode || (user?.uid ? `COND-${user.uid.slice(0, 5).toUpperCase()}` : "COND-XXXX");
    const v = user?.vehicle;

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información de Conductor</Text>
        <View style={styles.badgeRow}>
          <Text style={styles.label}>Código de Chofer:</Text>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{driverCode}</Text>
          </View>
        </View>

        <Text style={[styles.sectionSubtitle, { marginTop: 12 }]}>Vehículo Asignado</Text>
        {v ? (
          <View style={styles.vehicleBox}>
            <View style={styles.vehicleRow}>
              <Ionicons name="car-sport-outline" size={18} color="#0F294A" />
              <Text style={styles.vehicleText}>
                {v.brand} {v.model} ({v.year || "Año N/A"})
              </Text>
            </View>
            <View style={styles.vehicleRow}>
              <Ionicons name="pricetag-outline" size={18} color="#0F294A" />
              <Text style={styles.vehicleText}>
                Placa: <Text style={{ fontWeight: "700" }}>{v.plateNumber || "N/A"}</Text>
              </Text>
            </View>
            <View style={styles.vehicleRow}>
              <Ionicons name="speedometer-outline" size={18} color="#0F294A" />
              <Text style={styles.vehicleText}>Capacidad: {v.tons ? `${v.tons} Tons` : "N/A"}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>Sin datos de vehículo registrados.</Text>
        )}
      </View>
    );
  }

  if (user?.userType === "client") {
    const addresses = user?.addresses || [];
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Direcciones Registradas ({addresses.length})</Text>
        {addresses.length === 0 ? (
          <Text style={styles.emptyText}>El cliente aún no tiene direcciones registradas.</Text>
        ) : (
          addresses.map((addr: any, idx: number) => (
            <View key={addr.placeId || idx} style={styles.addressBox}>
              <Ionicons name="location-outline" size={18} color="#E31E24" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressDesc}>{addr.description}</Text>
                {addr.additionalInfo ? (
                  <Text style={styles.addressNotes}>Ref: {addr.additionalInfo}</Text>
                ) : null}
              </View>
            </View>
          ))
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Privilegios Administrativos</Text>
      <View style={styles.adminBox}>
        <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
        <Text style={styles.adminText}>
          Este usuario cuenta con permisos de administrador en Suplicem.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: "#64748B",
  },
  codeBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  codeText: {
    color: "#E31E24",
    fontWeight: "700",
    fontSize: 12,
  },
  vehicleBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vehicleText: {
    fontSize: 13,
    color: "#334155",
  },
  addressBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  addressDesc: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  addressNotes: {
    fontSize: 12,
    color: "#A04A0E",
    marginTop: 2,
  },
  adminBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
  },
  adminText: {
    fontSize: 13,
    color: "#166534",
    fontWeight: "500",
    flex: 1,
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
  },
});
