import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TRACKING_STEPS = ["Pendiente de iniciar", "En camino", "Completado"];

interface ClientOrderTrackingStepsProps {
  tripStatus?: string;
}

export const ClientOrderTrackingSteps: React.FC<
  ClientOrderTrackingStepsProps
> = ({ tripStatus }) => {
  const getStepCompleted = (step: string) => {
    const stepIndex = TRACKING_STEPS.indexOf(step);
    const currentIndex = TRACKING_STEPS.indexOf(
      tripStatus === "accepted"
        ? "Pendiente de iniciar"
        : tripStatus === "started" || tripStatus === "in_progress"
        ? "En camino"
        : tripStatus === "completed"
        ? "Completado"
        : ""
    );
    return stepIndex <= currentIndex;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Seguimiento del pedido</Text>
      {TRACKING_STEPS.map((step, index) => {
        const isDone = getStepCompleted(step);
        return (
          <View key={index} style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                { backgroundColor: isDone ? "#16A34A" : "#CBD5E1" },
              ]}
            />
            <Text
              style={[
                styles.stepLabel,
                isDone && { color: "#0F294A", fontWeight: "600" },
              ]}
            >
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0F294A",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  stepLabel: {
    fontSize: 15,
    color: "#64748B",
  },
});
