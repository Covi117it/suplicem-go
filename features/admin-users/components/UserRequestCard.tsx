import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types/users";

interface UserRequestCardProps {
  user: User;
  onViewImage: (uri: string) => void;
  onUpdateStatus: (uid: string, status: string) => void;
}

export const UserRequestCard: React.FC<UserRequestCardProps> = ({
  user,
  onViewImage,
  onUpdateStatus,
}) => {
  const isAiRisk = (user as any).aiRiskFlag;
  const aiReason = (user as any).aiRiskReason;

  return (
    <View style={[styles.card, isAiRisk && styles.cardAiRisk]}>
      {isAiRisk && (
        <View style={styles.aiAlertBanner}>
          <Ionicons name="warning-outline" size={20} color="#991B1B" />
          <Text style={styles.aiAlertText}>
            Alerta de Seguridad: Contenido posiblemente alterado con inteligencia artificial{aiReason ? ` (${aiReason})` : ""}
          </Text>
        </View>
      )}

      <View style={styles.userInfoRow}>
        <View style={styles.infoCol}>
          <Text style={styles.userName}>
            👤 {user.names} {user.lastNames}
          </Text>
          <Text style={styles.userRole}>
            Rol:{" "}
            <Text style={styles.boldText}>
              {user.userType === "client"
                ? "Cliente"
                : user.userType === "driver"
                ? "Conductor"
                : user.userType === "seller"
                ? "Vendedor"
                : "Admin"}
            </Text>
          </Text>
          <Text style={styles.userDetailHighlight}>
            🪪 {user.identificationType}: {user.identification}
          </Text>
          <Text style={styles.userDetail}>📧 Correo: {user.email}</Text>
          <Text style={styles.userDetail}>📞 Teléfono: {user.phone}</Text>

          {user.addresses && user.addresses.length > 0 && (
            <View style={styles.subDetailBox}>
              <Text style={styles.subDetailTitle}>📍 Direcciones ({user.addresses.length}):</Text>
              {user.addresses.map((addr, aIdx) => (
                <Text key={aIdx} style={styles.subDetailText}>
                  • {addr.description} {addr.additionalInfo ? `(${addr.additionalInfo})` : ""}
                </Text>
              ))}
            </View>
          )}

          {user.vehicle && (
            <View style={styles.subDetailBox}>
              <Text style={styles.subDetailTitle}>🚛 Vehículo:</Text>
              <Text style={styles.subDetailText}>
                • {user.vehicle.brand} {user.vehicle.model} ({user.vehicle.year}) - {user.vehicle.tons} Ton
              </Text>
              {user.vehicle.plateNumber && (
                <Text style={styles.subDetailText}>
                  • Placa: {user.vehicle.plateNumber}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {(user as any).identificationImage ? (
        <View style={styles.idPhotoContainer}>
          <Text style={styles.idPhotoTitle}>
            Comprobante de Cédula Adjuntado (No. {user.identification}):
          </Text>
          <TouchableOpacity
            onPress={() => onViewImage((user as any).identificationImage)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: (user as any).identificationImage }}
              style={styles.idPhotoThumbnail}
              resizeMode="cover"
            />
            <View style={styles.tapToViewOverlay}>
              <Ionicons name="scan-outline" size={18} color="#fff" />
              <Text style={styles.tapToViewText}>Ampliar foto</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (user as any).personType === "juridica" || (user as any).companyRnc ? null : (
        <View style={styles.noPhotoContainer}>
          <Ionicons name="image-outline" size={20} color="#94A3B8" />
          <Text style={styles.noPhotoText}>Sin foto de cédula adjunta</Text>
        </View>
      )}

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => onUpdateStatus(user.uid!, "inactive")}
        >
          <Text style={styles.rejectButtonText}>Rechazar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => onUpdateStatus(user.uid!, "active")}
        >
          <Text style={styles.approveButtonText}>Aprobar Cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardAiRisk: {
    borderColor: "#EF4444",
    borderWidth: 2,
    backgroundColor: "#FEF2F2",
  },
  aiAlertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  aiAlertText: {
    fontSize: 13,
    color: "#991B1B",
    fontWeight: "600",
    flex: 1,
  },
  userInfoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  boldText: {
    fontWeight: "bold",
  },
  userDetailHighlight: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F294A",
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  subDetailBox: {
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  subDetailTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 2,
  },
  subDetailText: {
    fontSize: 12,
    color: "#475569",
    marginLeft: 4,
  },
  idPhotoContainer: {
    marginVertical: 10,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  idPhotoTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  idPhotoThumbnail: {
    width: "100%",
    height: 140,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
  },
  tapToViewOverlay: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(15, 41, 74, 0.85)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tapToViewText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  noPhotoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    marginBottom: 6,
  },
  noPhotoText: {
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  approveButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#16A34A",
    borderRadius: 6,
    alignItems: "center",
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
