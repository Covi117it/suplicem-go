import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface AdminTripTrackingStepsProps {
  status?: string | null;
}

const TRACKING_STEPS = ["Pendiente de iniciar", "En camino", "Completado"];

export const AdminTripTrackingSteps: React.FC<AdminTripTrackingStepsProps> = ({ status }) => {
  const isStepCompleted = (step: string): boolean => {
    const stepIndex = TRACKING_STEPS.indexOf(step);
    const currentIndex = TRACKING_STEPS.indexOf(
      status === "accepted"
        ? "Pendiente de iniciar"
        : status === "started" || status === "in_progress"
        ? "En camino"
        : status === "completed"
        ? "Completado"
        : ""
    );
    return stepIndex <= currentIndex;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Seguimiento del pedido</Text>
      <View style={styles.stepsRow}>
        {TRACKING_STEPS.map((step, index) => {
          const completed = isStepCompleted(step);
          return (
            <View key={index} style={styles.stepContainer}>
              <View
                style={[
                  styles.circle,
                  { backgroundColor: completed ? "#16A34A" : "#D1D5DB" },
                ]}
              />
              <Text
                style={[
                  styles.stepLabel,
                  completed ? styles.stepLabelActive : styles.stepLabelInactive,
                ]}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default AdminTripTrackingSteps;

const styles = StyleSheet.create({
  container: {
    marginVertical: 18,
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  stepsRow: {
    gap: 12,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  stepLabel: {
    fontSize: 14,
  },
  stepLabelActive: {
    color: "#1F2937",
    fontWeight: "600",
  },
  stepLabelInactive: {
    color: "#6B7280",
  },
});
