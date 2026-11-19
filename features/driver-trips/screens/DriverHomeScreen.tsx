import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CancelTripModal } from "@/features/admin-trips/components/CancelTripModal";
import { useDriverHomeTrips } from "../hooks/useDriverHomeTrips";
import { ActiveTripBanner } from "../components/ActiveTripBanner";
import { AssignedTripCard } from "../components/AssignedTripCard";
import { NoTripsMessage } from "../components/NoTripsMessage";

export const DriverHomeScreen: React.FC = () => {
  const {
    displayedTrips,
    activeTrip,
    actualTrips,
    hasAcceptedTrip,
    isRejectModalVisible,
    rejectReason,
    setRejectReason,
    isSubmittingReject,
    saveTrip,
    fetchTrips,
    handleOpenRejectModal,
    handleCloseRejectModal,
    handleConfirmReject,
    handleStartTripFromHome,
    router,
  } = useDriverHomeTrips();

  const activeTripsToRender = actualTrips.length > 0 ? actualTrips : activeTrip ? [activeTrip] : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.topLogoContainer}>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

      {activeTripsToRender.map((currTrip) => (
        <ActiveTripBanner
          key={currTrip.id}
          currTrip={currTrip}
          onContinue={(trip) => {
            saveTrip({ ...trip, status: "accepted" } as any);
            router.push("/driver-order");
          }}
          onReject={handleOpenRejectModal}
        />
      ))}

      <View style={styles.headerRow}>
        <Text style={styles.title}>Tus Viajes Asignados</Text>
        <TouchableOpacity onPress={fetchTrips} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#E31E24" />
        </TouchableOpacity>
      </View>

      {displayedTrips.length > 0 ? (
        displayedTrips.map((trip) => (
          <AssignedTripCard
            key={trip.id}
            trip={trip}
            hasAcceptedTrip={hasAcceptedTrip}
            onStartRoute={handleStartTripFromHome}
            onReject={handleOpenRejectModal}
            onViewDetail={(t) => {
              router.push({
                pathname: "/driver-trip-preview",
                params: { tripId: t.id },
              });
            }}
          />
        ))
      ) : (
        <NoTripsMessage />
      )}

      <CancelTripModal
        visible={isRejectModalVisible}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onConfirm={handleConfirmReject}
        onCancel={handleCloseRejectModal}
        isSubmitting={isSubmittingReject}
      />
    </ScrollView>
  );
};

export default DriverHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  topLogoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  topLogo: {
    width: 180,
    height: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F294A",
  },
  refreshButton: {
    padding: 6,
  },
});
