import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DriverTripMap } from "@/components/driver/DriverTripMap";
import { Palette } from "@/constants/theme";
import { useDriverTripPreview } from "../hooks/useDriverTripPreview";
import { TripPreviewSummaryCard } from "../components/TripPreviewSummaryCard";
import { TripPreviewOrderCard } from "../components/TripPreviewOrderCard";

interface DriverTripPreviewScreenProps {
  tripId?: string;
}

export const DriverTripPreviewScreen: React.FC<DriverTripPreviewScreenProps> = ({ tripId }) => {
  const {
    trip,
    loadingTrip,
    handleCallClient,
    handleWhatsapp,
    handleAccept,
  } = useDriverTripPreview(tripId);

  if (loadingTrip) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Cargando información del viaje...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.headerContainer}>
          <ScreenHeader title="Detalle del Viaje" showBack={true} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={56} color="#94A3B8" />
          <Text style={styles.emptyText}>No se encontró el viaje solicitado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.headerContainer}>
        <ScreenHeader
          title="Detalle del Viaje"
          subtitle={`Viaje #${trip.tripNumber || ""}`}
          showBack={true}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TripPreviewSummaryCard
          totalTons={trip.totalTons || 0}
          ordersCount={trip.orders?.length || 0}
          comments={trip.comments}
        />

        <Text style={styles.sectionTitle}>
          Órdenes del Viaje ({trip.orders?.length || 0})
        </Text>

        {trip.orders?.map((order: any, index: number) => (
          <TripPreviewOrderCard
            key={order.id || index}
            order={order}
            index={index}
            onCallClient={handleCallClient}
            onWhatsapp={handleWhatsapp}
          />
        ))}

        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Ruta del Viaje y Tiempo Estimado</Text>
          <DriverTripMap
            orders={trip.orders}
            tripStatus={trip.status || "created"}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAccept}
          activeOpacity={0.88}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
          <Text style={styles.acceptButtonText}>Aceptar este Viaje</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DriverTripPreviewScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 10,
  },
  mapSection: {
    marginTop: 16,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  acceptButton: {
    backgroundColor: "#E31E24",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
