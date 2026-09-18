import { useAlert } from "@/context/alertContext";
import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import {
  aceptedTrip,
  getDriverActiveTrip,
  getTripAvailable,
  getTripDetail,
} from "@/services/tripsService";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Trip } from "@/types/trips";

// Componente para el mensaje de no hay viajes (NUEVO)
const NoTripsMessage = () => (
  <View style={noTripsStyles.container}>
    <Ionicons name="car-outline" size={80} color="#E31E24" />
    <Text style={noTripsStyles.title}>¡Todo despejado!</Text>
    <Text style={noTripsStyles.message}>
      No hay viajes disponibles en este momento. Vuelve a intentarlo más tarde o
      espera nuevas asignaciones.
    </Text>
  </View>
);

const DriverHomeScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const router = useRouter();
  const { show, hide } = useLoading();
  const { user } = useContext(AuthContext);
  const { saveTrip, clearTrip } = useContext(AcceptedTripContext);
  const [actualTripInProgress, setActualTripInProgress] = useState(false);
  const { showAlert } = useAlert();

  useFocusEffect(
    useCallback(() => {
      const getTripsAsync = async () => {
        show();
        await fetchTrips();
        await validateTrips();
        hide();
      };

      getTripsAsync();

      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const validateTrips = async () => {
    try {
      const response = await getDriverActiveTrip();

      if (response?.success && response?.data?.hasActiveTrip && response?.data?.trip) {
        const trip = response.data.trip;
        const isMyTrip =
          !user?.uid ||
          trip.assignedDriverId === user?.uid ||
          trip.driverId === user?.uid ||
          trip.driver?.id === user?.uid;

        if (isMyTrip) {
          // Un viaje nada más está "en curso" luego de que se le da a iniciar viaje (status === "started" | "in_progress")
          const isStarted = trip.status === "started" || trip.status === "in_progress";
          setActualTripInProgress(isStarted);
          setActiveTrip(trip);
          saveTrip(trip);
          return;
        }
      }

      setActualTripInProgress(false);
      setActiveTrip(null);
      clearTrip();
    } catch (error) {
      console.error("Error validando viaje activo:", error);
      setActualTripInProgress(false);
      setActiveTrip(null);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await getTripAvailable();
      if (response.success && response.trips) {
        const mappedTrips: Trip[] = response.trips.map((trip: any) => ({
          id: trip.id,
          tripNumber: trip.tripNumber,
          totalTons: trip.totalTons,
          createdAt: trip.createdAt,
          assignedDriverId: trip.assignedDriverId,
          comments: trip.comments,
        }));

        setTrips(mappedTrips);
      }
    } catch (error) {
      console.error("❌ Error fetching trips:", error);
    }
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleAcceptTrip = async (tripId: string) => {
    // Si ya hay un viaje iniciado en curso (started/in_progress), no permitir iniciar otro hasta completarlo
    const hasStartedTrip =
      activeTrip && (activeTrip.status === "started" || activeTrip.status === "in_progress");

    if (hasStartedTrip) {
      showAlert({
        message: `Ya tienes el viaje #${activeTrip.tripNumber || ""} en curso. Debes completarlo antes de aceptar uno nuevo.`,
        type: "warning",
      });
      return;
    }

    // Si el conductor ya aceptó este viaje previamente, llevarlo directamente a los detalles para que pueda iniciarlo
    if (activeTrip && activeTrip.id === tripId && activeTrip.status === "accepted") {
      saveTrip(activeTrip);
      router.push("/driver-order");
      return;
    }

    try {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Ubicación no concedida al aceptar el viaje");
        }
      } catch (e) {
        console.warn("Aviso de permisos de ubicación:", e);
      }

      show();

      const acceptResponse = await aceptedTrip(tripId);

      if (acceptResponse.success) {
        // Al aceptar, el viaje queda en estado "accepted" (no "started" hasta que el conductor presione Iniciar viaje)
        try {
          const tripResponse = await getTripDetail(tripId);
          if (tripResponse?.success && tripResponse?.trip) {
            saveTrip(tripResponse.trip);
            setActiveTrip(tripResponse.trip);
          } else {
            const currentTrip = trips.find((t) => t.id === tripId);
            const fallbackTrip = {
              id: tripId,
              tripNumber: currentTrip?.tripNumber || "---",
              totalTons: currentTrip?.totalTons || 0,
              createdAt: currentTrip?.createdAt || new Date().toISOString(),
              assignedDriverId: user?.uid || "",
              status: "accepted",
              orderIds: [],
              orders: [],
              comments: currentTrip?.comments || "",
            };
            saveTrip(fallbackTrip as any);
            setActiveTrip(fallbackTrip);
          }
        } catch (detailErr) {
          console.warn("Aviso al obtener detalle de viaje:", detailErr);
        }

        showAlert({ message: "Viaje aceptado correctamente.", type: "success" });
        await fetchTrips();
        router.push("/driver-order");
      } else {
        showAlert({
          message: acceptResponse?.message || "No se pudo aceptar el viaje.",
          type: "error",
        });

        await fetchTrips();
      }
    } catch (error) {
      console.error("❌ Error accepting trip:", error);
      showAlert({
        message: "Ocurrió un error al aceptar el viaje.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={styles.topLogoContainer}>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

      {/* Banner de Viaje Activo / Aceptado */}
      {activeTrip && (
        <View style={styles.activeTripCard}>
          <View style={styles.activeTripHeaderRow}>
            <View
              style={[
                styles.activeTripIconCircle,
                activeTrip.status === "accepted" && { backgroundColor: "#2563EB" },
              ]}
            >
              <Ionicons
                name={activeTrip.status === "accepted" ? "checkmark-circle" : "navigate"}
                size={20}
                color="#fff"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.activeTripTitle}>
                {activeTrip.status === "accepted"
                  ? `Viaje aceptado: #${activeTrip.tripNumber}`
                  : `Viaje en curso: #${activeTrip.tripNumber}`}
              </Text>
              <Text style={styles.activeTripSubtitle}>
                {activeTrip.status === "accepted"
                  ? `Listo para iniciar ruta • ${activeTrip.totalTons} Toneladas`
                  : `Ruta en camino • ${activeTrip.totalTons} Toneladas`}
              </Text>
            </View>
            <View
              style={[
                styles.activeTripStatusBadge,
                activeTrip.status === "accepted" && { backgroundColor: "#DBEAFE" },
              ]}
            >
              <Text
                style={[
                  styles.activeTripStatusText,
                  activeTrip.status === "accepted" && { color: "#1D4ED8" },
                ]}
              >
                {activeTrip.status === "accepted" ? "Aceptado" : "En curso"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.continueTripButton,
              activeTrip.status === "accepted" && { backgroundColor: "#2563EB" },
            ]}
            activeOpacity={0.85}
            onPress={() => {
              saveTrip(activeTrip);
              router.push("/driver-order");
            }}
          >
            <Text style={styles.continueTripButtonText}>
              {activeTrip.status === "accepted"
                ? "Ir al viaje para iniciar ruta"
                : "Ver detalle del viaje en curso"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.headerRow}>
        <Text style={styles.title}>Viajes disponibles</Text>
        <TouchableOpacity onPress={fetchTrips} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#E31E24" />
        </TouchableOpacity>
      </View>

      {trips.length > 0 ? (
        trips.map((trip, index) => (
          <View key={trip.id} style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.label}>Viaje: {trip.tripNumber}</Text>
              {trip.assignedDriverId && (!user?.uid || trip.assignedDriverId === user?.uid) ? (
                <View style={styles.assignedBadge}>
                  <Text style={styles.assignedBadgeText}>🎯 Asignado para ti</Text>
                </View>
              ) : (
                <View style={styles.generalBadge}>
                  <Text style={styles.generalBadgeText}>Disponible</Text>
                </View>
              )}
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={18} color="#E31E24" />
              <Text style={styles.detail}>Toneladas: {trip.totalTons}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#E31E24" />
              <Text style={styles.detail}>
                Fecha: {formatDate(trip.createdAt)}
              </Text>
            </View>

            {trip.comments ? (
              <View style={styles.infoRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#666" />
                <Text style={[styles.detail, { color: "#666" }]}>
                  {trip.comments}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                actualTripInProgress && { backgroundColor: "#888" },
                activeTrip?.id === trip.id && activeTrip?.status === "accepted" && { backgroundColor: "#2563EB" },
              ]}
              activeOpacity={0.8}
              onPress={() => handleAcceptTrip(trip.id)}
            >
              <Text style={styles.buttonText}>
                {activeTrip?.id === trip.id && activeTrip?.status === "accepted"
                  ? "Iniciar viaje"
                  : actualTripInProgress
                  ? "Viaje en curso"
                  : "Aceptar viaje"}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <NoTripsMessage />
      )}
    </ScrollView>
  );
};

export default DriverHomeScreen;

const noTripsStyles = StyleSheet.create({
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  topLogoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  topLogo: {
    width: 180,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F294A",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F294A",
  },
  assignedBadge: {
    backgroundColor: "#E0E7FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#4338CA",
  },
  assignedBadgeText: {
    color: "#4338CA",
    fontWeight: "bold",
    fontSize: 12,
  },
  generalBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#16A34A",
  },
  generalBadgeText: {
    color: "#16A34A",
    fontWeight: "bold",
    fontSize: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detail: {
    fontSize: 15,
    color: "#555",
    marginLeft: 8,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#E31E24",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    elevation: 2,
  },
  noTripsText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#777",
  },
  activeTripCard: {
    backgroundColor: "#0F294A",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#0F294A",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  activeTripHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  activeTripIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E31E24",
    alignItems: "center",
    justifyContent: "center",
  },
  activeTripTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTripSubtitle: {
    color: "#CBD5E1",
    fontSize: 13,
    marginTop: 2,
  },
  activeTripStatusBadge: {
    backgroundColor: "rgba(227, 30, 36, 0.2)",
    borderColor: "#E31E24",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeTripStatusText: {
    color: "#FFA4A7",
    fontSize: 11,
    fontWeight: "bold",
  },
  continueTripButton: {
    backgroundColor: "#E31E24",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  continueTripButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
