import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

type LegalSectionCardProps = {
  onOpenTerms: () => void;
  onToggleNotice: () => void;
  termsNoticeEnabled: boolean;
};

export const LegalSectionCard: React.FC<LegalSectionCardProps> = ({
  onOpenTerms,
  onToggleNotice,
  termsNoticeEnabled,
}) => {
  return (
    <View style={styles.cardSharp}>
      <Text style={styles.sectionTitle}>Legal e Información</Text>
      <TouchableOpacity
        style={styles.termsOptionRow}
        onPress={onOpenTerms}
        activeOpacity={0.7}
      >
        <View style={styles.termsOptionLeft}>
          <Ionicons name="document-text-outline" size={22} color={Palette.primary} />
          <Text style={styles.termsOptionText}>Términos y Condiciones de Uso</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.termsOptionRow,
          {
            marginTop: 8,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#f0f0f0",
          },
        ]}
        onPress={onToggleNotice}
        activeOpacity={0.7}
      >
        <View style={styles.termsOptionLeft}>
          <Ionicons
            name={termsNoticeEnabled ? "checkbox-outline" : "square-outline"}
            size={22}
            color={termsNoticeEnabled ? Palette.primary : "#666"}
          />
          <Text style={styles.termsOptionText}>
            Aviso al Login: {termsNoticeEnabled ? "Habilitado" : "Deshabilitado"}
          </Text>
        </View>
        <View
          style={[
            styles.toggleBadge,
            { backgroundColor: termsNoticeEnabled ? "#ffebee" : "#f1f5f9" },
          ]}
        >
          <Text
            style={[
              styles.toggleBadgeText,
              { color: termsNoticeEnabled ? Palette.primary : "#475569" },
            ]}
          >
            {termsNoticeEnabled ? "Deshabilitar" : "Habilitar"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LegalSectionCard;

const styles = StyleSheet.create({
  cardSharp: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Palette.primaryDark,
    marginBottom: 12,
  },
  termsOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  termsOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  termsOptionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  toggleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
