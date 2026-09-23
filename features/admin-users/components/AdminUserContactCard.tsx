import React, { useState } from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AdminUserContactCardProps {
  user: any;
}

export const AdminUserContactCard: React.FC<AdminUserContactCardProps> = ({ user }) => {
  const [modalImageVisible, setModalImageVisible] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Datos Personales y Contacto</Text>

      <View style={styles.row}>
        <Ionicons name="card-outline" size={20} color="#0F294A" />
        <View style={styles.rowContent}>
          <Text style={styles.label}>
            {user?.identificationType || "Identificación"}:
          </Text>
          <Text style={styles.value}>{user?.identification || "No especificada"}</Text>
        </View>
      </View>

      {user?.identificationImage && (
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imageThumbnailWrap}
            onPress={() => setModalImageVisible(true)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: user.identificationImage }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.tapOverlay}>
              <Ionicons name="scan-outline" size={16} color="#fff" />
              <Text style={styles.tapText}>Ver Cédula</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.row}>
        <Ionicons name="mail-outline" size={20} color="#0F294A" />
        <View style={styles.rowContent}>
          <Text style={styles.label}>Correo Electrónico:</Text>
          <Text style={styles.value}>{user?.email || "Sin correo"}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Ionicons name="call-outline" size={20} color="#0F294A" />
        <View style={styles.rowContent}>
          <Text style={styles.label}>Teléfono:</Text>
          <Text style={styles.value}>{user?.phone || "Sin teléfono"}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Ionicons name="finger-print-outline" size={20} color="#64748B" />
        <View style={styles.rowContent}>
          <Text style={styles.label}>UID del Sistema:</Text>
          <Text style={styles.uidText}>{user?.uid || "N/A"}</Text>
        </View>
      </View>

      {/* Modal Visor de Cédula a Pantalla Completa */}
      <Modal visible={modalImageVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalImageVisible(false)}
          >
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          {user?.identificationImage && (
            <Image
              source={{ uri: user.identificationImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  rowContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  uidText: {
    fontSize: 12,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 6,
  },
  imageSection: {
    marginTop: 4,
    marginBottom: 10,
  },
  imageThumbnailWrap: {
    height: 110,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  tapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 41, 74, 0.75)",
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tapText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullImage: {
    width: "90%",
    height: "75%",
  },
});
