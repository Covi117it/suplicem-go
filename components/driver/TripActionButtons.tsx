import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CheckRender from "@/components/CheckRender";

type TripActionButtonsProps = {
  tripStatus: string;
  onStartTrip: () => void;
  onCompleteOrder: () => void;
  onCancel: () => void;
};

export const TripActionButtons: React.FC<TripActionButtonsProps> = ({
  tripStatus,
  onStartTrip,
  onCompleteOrder,
  onCancel,
}) => {
  return (
    <View style={styles.actions}>
      <CheckRender allowed={tripStatus === "accepted"}>
        <TouchableOpacity style={styles.startButton} onPress={onStartTrip}>
          <Text style={styles.actionText}>Iniciar viaje</Text>
        </TouchableOpacity>
      </CheckRender>

      <CheckRender allowed={tripStatus === "started"}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={onCompleteOrder}
        >
          <Text style={styles.actionText}>Completar viaje</Text>
        </TouchableOpacity>
      </CheckRender>

      <CheckRender
        allowed={tripStatus !== "completed" && tripStatus !== "canceled"}
      >
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.actionText}>Cancelar viaje</Text>
        </TouchableOpacity>
      </CheckRender>
    </View>
  );
};

export default TripActionButtons;

const styles = StyleSheet.create({
  actions: {
    marginTop: 30,
    gap: 12,
  },
  startButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
