import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const NoTripsMessage: React.FC = () => (
  <View style={styles.container}>
    <Ionicons name="car-outline" size={80} color="#E31E24" />
    <Text style={styles.title}>¡Todo despejado!</Text>
    <Text style={styles.message}>
      No tienes viajes asignados en este momento. Vuelve a intentarlo más tarde o
      espera nuevas asignaciones del administrador.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F294A",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
  },
});
