import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import StatusBadge from "@/components/StatusBadge";
import CheckRender from "@/components/CheckRender";
import CancelTripModal from "./components/CancelTripModal";
import AppButton from "@/components/ui/AppButton";
import { DriverTripMap } from "@/components/driver/DriverTripMap";
import { useAdminTripDetail } from "./hooks/useAdminTripDetail";
import { AdminTripDriverCard } from "./components/AdminTripDriverCard";
import { AdminTripOrdersList } from "./components/AdminTripOrdersList";
import { AdminTripTrackingSteps } from "./components/AdminTripTrackingSteps";

export const AdminTripDetailScreen: React.FC = () => {
  const {
    trip,
    driverLocation,
    isCancelModalVisible,
    setIsCancelModalVisible,
    cancellationReason,
    setCancellationReason,
    handleCancelTrip,
    handleForceCompleteTrip,
    isTerminalStatus,
  } = useAdminTripDetail();

  if (!trip) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No se encontró información del viaje.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Detalle del viaje: {trip.tripNumber}</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Estado del viaje:</Text>
          <StatusBadge status={trip.status || "available"} />
        </View>

        <CheckRender allowed={Boolean(trip.driver)}>
          <AdminTripDriverCard driver={trip.driver} />
        </CheckRender>

        <AdminTripOrdersList orders={trip.orders || []} />

        <AdminTripTrackingSteps status={trip.status} />

        {Boolean(trip.comments) && (
          <View style={styles.commentsBox}>
            <Text style={styles.commentsLabel}>Comentarios del viaje:</Text>
            <Text style={styles.commentsText}>{trip.comments}</Text>
          </View>
        )}

        {Boolean(trip.cancellationReason) && (
          <View style={styles.cancellationBox}>
            <Text style={styles.cancellationLabel}>Motivo de cancelación:</Text>
            <Text style={styles.cancellationText}>{trip.cancellationReason}</Text>
          </View>
        )}

        <DriverTripMap
          location={driverLocation}
          orders={trip.orders || []}
          tripStatus={trip.status}
        />

         {Boolean(trip.deliveryPin) && (
          <View style={styles.pinBox}>
            <Text style={styles.pinLabel}>🔐 PIN de Entrega (Seguridad):</Text>
            <Text style={styles.pinValue}>{trip.deliveryPin}</Text>
          </View>
        )}
        {!isTerminalStatus && (
          <View style={styles.actionButtonsContainer}>
            <AppButton
              title="✅ Completar Entrega Directamente"
              variant="primary"
              style={styles.completeButton}
              onPress={handleForceCompleteTrip}
            />
            <AppButton
              title="🛑 Cancelar Viaje Definitivamente"
              variant="danger-outline"
              style={styles.cancelButton}
              onPress={() => setIsCancelModalVisible(true)}
            />
          </View>
        )}
      </ScrollView>

      <CancelTripModal
        visible={isCancelModalVisible}
        reason={cancellationReason}
        onReasonChange={setCancellationReason}
        onConfirm={handleCancelTrip}
        onCancel={() => {
          setIsCancelModalVisible(false);
          setCancellationReason("");
        }}
      />
    </>
  );
};

export default AdminTripDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f3",
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff8f3",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  commentsBox: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  commentsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  commentsText: {
    fontSize: 14,
    color: "#4B5563",
  },
  cancellationBox: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 16,
  },
  cancellationLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#991B1B",
    marginBottom: 4,
  },
  cancellationText: {
    fontSize: 14,
    color: "#7F1D1D",
  },
  cancelButton: {
    marginTop: 0,
  },
  pinBox: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pinLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  pinValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
    letterSpacing: 2,
  },
  actionButtonsContainer: {
    gap: 12,
    marginTop: 12,
    marginBottom: 30,
  },
  completeButton: {
    backgroundColor: "#16A34A",
  },
});
