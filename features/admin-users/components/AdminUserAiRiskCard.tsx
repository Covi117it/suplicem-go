import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AdminUserAiRiskCardProps {
  user: any;
}

export const AdminUserAiRiskCard: React.FC<AdminUserAiRiskCardProps> = ({ user }) => {
  if (!user?.aiRiskFlag) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="warning" size={20} color="#991B1B" />
        <Text style={styles.title}>Alerta de Seguridad (SynthID)</Text>
      </View>
      <Text style={styles.desc}>
        El comprobante o documento de este usuario presenta indicios de generación o manipulación por Inteligencia Artificial.
      </Text>
      {user?.aiRiskReason ? (
        <Text style={styles.reason}>
          Motivo: <Text style={{ fontWeight: "700" }}>{user.aiRiskReason}</Text>
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
  },
  desc: {
    fontSize: 13,
    color: "#7F1D1D",
    lineHeight: 18,
  },
  reason: {
    fontSize: 12,
    color: "#991B1B",
    marginTop: 6,
  },
});
