import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface AdminUserActionsBarProps {
  phone?: string;
  status?: string;
  onCall: (phone?: string) => void;
  onWhatsapp: (phone?: string) => void;
  onToggleStatus: (newStatus: "active" | "inactive") => void;
}

export const AdminUserActionsBar: React.FC<AdminUserActionsBarProps> = ({
  phone,
  status,
  onCall,
  onWhatsapp,
  onToggleStatus,
}) => {
  const isActive = status === "active";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, styles.callBtn]}
        onPress={() => onCall(phone)}
        activeOpacity={0.7}
      >
        <Ionicons name="call" size={18} color="#ffffff" />
        <Text style={styles.btnText}>Llamar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.whatsappBtn]}
        onPress={() => onWhatsapp(phone)}
        activeOpacity={0.7}
      >
        <Ionicons name="logo-whatsapp" size={18} color="#ffffff" />
        <Text style={styles.btnText}>WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, isActive ? styles.inactivateBtn : styles.activateBtn]}
        onPress={() => onToggleStatus(isActive ? "inactive" : "active")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isActive ? "close-circle-outline" : "checkmark-circle-outline"}
          size={18}
          color="#ffffff"
        />
        <Text style={styles.btnText}>{isActive ? "Inactivar" : "Activar"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    elevation: 1,
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  callBtn: {
    backgroundColor: "#0F294A",
  },
  whatsappBtn: {
    backgroundColor: "#16A34A",
  },
  activateBtn: {
    backgroundColor: "#2563EB",
  },
  inactivateBtn: {
    backgroundColor: Palette.primary,
  },
});
