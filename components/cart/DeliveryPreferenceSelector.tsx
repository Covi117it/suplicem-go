import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

export type DeliveryPreference = "partial" | "single_trip";

interface DeliveryPreferenceSelectorProps {
  preference: DeliveryPreference;
  onSelectPreference: (pref: DeliveryPreference) => void;
}

export const DeliveryPreferenceSelector: React.FC<DeliveryPreferenceSelectorProps> = ({
  preference,
  onSelectPreference,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>Modalidad de Despacho</Text>
      <Text style={styles.sectionSub}>
        Indica a logística cómo prefieres recibir tu material en obra:
      </Text>

      <View style={styles.optionsContainer}>
        {/* Opción 1: Entregas Parciales (Por defecto) */}
        <TouchableOpacity
          style={[
            styles.card,
            preference === "partial" && styles.cardActive,
          ]}
          onPress={() => onSelectPreference("partial")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="layers-outline"
              size={20}
              color={preference === "partial" ? Palette.primary : "#64748B"}
            />
            <Ionicons
              name={preference === "partial" ? "radio-button-on" : "radio-button-off"}
              size={18}
              color={preference === "partial" ? Palette.primary : "#94A3B8"}
            />
          </View>
          <Text style={[styles.title, preference === "partial" && styles.titleActive]}>
            Sin preferencia / En partes
          </Text>
          <Text style={styles.desc}>
            Permite que tu pedido llegue en múltiples viajes según la disponibilidad de camiones.
          </Text>
        </TouchableOpacity>

        {/* Opción 2: Entrega Completa en un solo viaje */}
        <TouchableOpacity
          style={[
            styles.card,
            preference === "single_trip" && styles.cardActive,
          ]}
          onPress={() => onSelectPreference("single_trip")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="cube-outline"
              size={20}
              color={preference === "single_trip" ? Palette.primary : "#64748B"}
            />
            <Ionicons
              name={preference === "single_trip" ? "radio-button-on" : "radio-button-off"}
              size={18}
              color={preference === "single_trip" ? Palette.primary : "#94A3B8"}
            />
          </View>
          <Text style={[styles.title, preference === "single_trip" && styles.titleActive]}>
            Entrega Completa (1 solo viaje)
          </Text>
          <Text style={styles.desc}>
            Prefiero que toda la carga llegue junta en un solo camión de gran tonelaje.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "bold",
    color: Palette.primaryDark,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 12,
    color: Palette.textMuted,
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: Palette.borderLight,
    borderRadius: 12,
    padding: 12,
  },
  cardActive: {
    borderColor: Palette.primary,
    backgroundColor: "#FFF8F8",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.textDark,
    marginBottom: 4,
  },
  titleActive: {
    color: Palette.primary,
  },
  desc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
  },
});
