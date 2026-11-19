import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBadge } from "@/components/StatusBadge";

interface AdminUserCardProps {
  user: any;
  isSelf: boolean;
  onSelect: (user: any) => void;
  onActivate: (uid: string) => void;
  onInactivate: (uid: string) => void;
}

const translateRole = (role: string) => {
  switch (role) {
    case "admin":
      return "Administrador";
    case "driver":
      return "Conductor";
    case "client":
      return "Cliente";
    case "seller":
      return "Vendedor";
    default:
      return role;
  }
};

export const AdminUserCard: React.FC<AdminUserCardProps> = ({
  user,
  isSelf,
  onSelect,
  onActivate,
  onInactivate,
}) => {
  return (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => onSelect(user)}
      activeOpacity={0.7}
    >
      <View style={styles.userHeader}>
        <Ionicons name="person-circle-outline" size={32} color="#E31E24" />
        <View style={styles.headerTextCol}>
          <Text style={styles.userName}>
            {user.names} {user.lastNames}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <StatusBadge status={user.status} size="small" />
        <Ionicons
          name="chevron-forward-outline"
          size={18}
          color="#94A3B8"
          style={styles.chevron}
        />
      </View>

      <View style={styles.userDetailRow}>
        <Ionicons name="briefcase-outline" size={18} color="#0F294A" />
        <Text style={styles.userDetailText}>{translateRole(user.userType)}</Text>
      </View>

      <View style={styles.userDetailRow}>
        <Ionicons name="card-outline" size={18} color="#0F294A" />
        <Text style={styles.userDetailText}>
          {user.identificationType} - {user.identification}
        </Text>
      </View>

      {user.userType === "driver" && (
        <View style={styles.driverIdBadgeAdmin}>
          <Ionicons name="barcode-outline" size={16} color="#0F294A" />
          <Text style={styles.driverIdAdminText}>
            ID Conductor:{" "}
            <Text style={styles.boldRedText}>
              {user.driverCode || "Pendiente de aprobación"}
            </Text>
          </Text>
        </View>
      )}

      {user.userType === "seller" && (
        <View style={styles.driverIdBadgeAdmin}>
          <Ionicons name="pricetag-outline" size={16} color="#0F294A" />
          <Text style={styles.driverIdAdminText}>
            ID Vendedor:{" "}
            <Text style={styles.boldDarkText}>
              {(user as any).sellerCode || (user.uid ? `VEND-${user.uid.slice(0, 5).toUpperCase()}` : "VEND-XXXX")}
            </Text>
          </Text>
        </View>
      )}

      {user.userType === "client" && user.sellerId && (
        <View style={styles.clientSellerBadgeAdmin}>
          <Ionicons name="briefcase-outline" size={16} color="#0284C7" />
          <Text style={styles.clientSellerAdminText}>
            Vendedor:{" "}
            <Text style={styles.boldSkyText}>
              {user.sellerName
                ? `[${user.sellerCode || "VEND-XXXX"}] ${user.sellerName}`
                : `ID: ${user.sellerId.slice(0, 8)}...`}
            </Text>
          </Text>
        </View>
      )}

      {user.userType === "driver" && user.vehicle && (
        <View style={styles.driverPlateBadgeAdmin}>
          <Ionicons name="car-sport-outline" size={16} color="#0F294A" />
          <Text style={styles.driverPlateAdminText}>
            🛞 Placa: <Text style={styles.boldText}>{user.vehicle.plateNumber || "No registrada"}</Text> ({user.vehicle.brand} {user.vehicle.model})
          </Text>
        </View>
      )}

      {isSelf ? (
        <View style={styles.selfBadge}>
          <Ionicons name="shield-checkmark" size={15} color="#166534" />
          <Text style={styles.selfBadgeText}>Tu cuenta (Admin)</Text>
        </View>
      ) : ["pending", "inactive"].includes(user.status) ? (
        <TouchableOpacity
          style={styles.activateButton}
          onPress={() => onActivate(user.uid)}
        >
          <Text style={styles.buttonText}>Activar</Text>
        </TouchableOpacity>
      ) : user.status === "active" ? (
        <TouchableOpacity
          style={styles.inactivateButton}
          onPress={() => onInactivate(user.uid)}
        >
          <Text style={styles.buttonText}>Inactivar</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  userEmail: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  chevron: {
    marginLeft: 6,
  },
  userDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  userDetailText: {
    fontSize: 14,
    color: "#334155",
  },
  driverIdBadgeAdmin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 6,
  },
  driverIdAdminText: {
    fontSize: 13,
    color: "#475569",
  },
  boldRedText: {
    fontWeight: "bold",
    color: "#E31E24",
  },
  boldDarkText: {
    fontWeight: "bold",
    color: "#0F294A",
  },
  clientSellerBadgeAdmin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 6,
  },
  clientSellerAdminText: {
    fontSize: 13,
    color: "#0369A1",
  },
  boldSkyText: {
    fontWeight: "bold",
    color: "#0369A1",
  },
  driverPlateBadgeAdmin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 6,
  },
  driverPlateAdminText: {
    fontSize: 13,
    color: "#475569",
  },
  boldText: {
    fontWeight: "bold",
  },
  selfBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  selfBadgeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#166534",
  },
  activateButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  inactivateButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
