import React from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { InfoRow } from "@/components/InfoRow";
import StatusBadge from "@/components/StatusBadge";
import { DriverTripOrderCard } from "@/components/driver/DriverTripOrderCard";
import { Palette } from "@/constants/theme";
import { useDriverTripHistoryDetail } from "../hooks/useDriverTripHistoryDetail";

interface DriverTripHistoryDetailScreenProps {
  tripId?: string;
}

export const DriverTripHistoryDetailScreen: React.FC<
  DriverTripHistoryDetailScreenProps
> = ({ tripId }) => {
  const router = useRouter();
  const { trip, loading, expandedOrderIndex, toggleOrder } =
    useDriverTripHistoryDetail(tripId);

  const navigateBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)/(orders)/(driver)");
    }
  };

  const handleCallClient = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsapp = (phone: string) => {
    if (!phone) return;
    const formattedPhone = phone.startsWith("+") ? phone : `+1${phone}`;
    Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
  };

  const formatDate = (isoDate?: string): string => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    return date.toLocaleDateString("es-DO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !trip) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Cargando detalle del viaje...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <ScreenHeader
        title="Detalle del viaje"
        subtitle={`Viaje #${trip?.tripNumber || "N/A"}`}
        showBack={true}
        onBack={navigateBack}
      />

      {/* Resumen del viaje histórico */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>
              Viaje #{trip?.tripNumber || "N/A"}
            </Text>
            <Text style={styles.summarySubtitle}>
              {formatDate(trip?.createdAt)}
            </Text>
          </View>
          <StatusBadge status={trip?.status || "completed"} size="small" />
        </View>

        <View style={styles.divider} />

        <InfoRow
          icon="speedometer-outline"
          label="Carga total"
          value={`${trip?.totalTons || 0} Toneladas`}
        />
        <InfoRow
          icon="chatbox-ellipses-outline"
          label="Comentarios"
          value={trip?.comments || "Sin comentarios"}
        />
      </View>

      {/* Sección de Órdenes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Órdenes del viaje ({trip?.orders?.length || 0})
        </Text>
        {trip?.orders?.map((order: any, index: number) => (
          <DriverTripOrderCard
            key={order?.id || index}
            order={order}
            isExpanded={expandedOrderIndex === index}
            onToggle={() => toggleOrder(index)}
            onCall={handleCallClient}
            onWhatsapp={handleWhatsapp}
            tripStatus={trip?.status || "completed"}
            onOpenDeliveryModal={() => {}}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Palette.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Palette.textMuted,
  },
  summaryCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.primaryDark,
  },
  summarySubtitle: {
    fontSize: 13,
    color: Palette.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: Palette.primaryDark,
  },
});
