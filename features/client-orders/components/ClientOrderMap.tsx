import React from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";

interface ClientOrderMapProps {
  driverLocation: { latitude: number; longitude: number } | null;
  trip: any;
  deliveries?: any[];
  orderId?: string;
}

export const ClientOrderMap: React.FC<ClientOrderMapProps> = ({
  driverLocation,
  trip,
  deliveries,
  orderId,
}) => {
  const shouldShowMap =
    Boolean(driverLocation) &&
    Boolean(trip?.assignedDriverId || trip?.driver) &&
    (trip?.status === "accepted" ||
      trip?.status === "started" ||
      trip?.status === "in_progress");

  if (!shouldShowMap || !driverLocation) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ubicación actual del camión</Text>
      <MapView
        style={styles.map}
        mapType="none"
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          zIndex={-1}
        />
        <Marker
          coordinate={driverLocation}
          title="Camión"
          description="Ubicación actual"
        >
          <Image
            source={require("@/assets/images/camion.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </Marker>

        {deliveries?.map((delivery: any, index: number) => {
          if (delivery?.address?.latitude && delivery?.address?.longitude) {
            return (
              <Marker
                key={`${orderId || "del"}-${index}`}
                coordinate={{
                  latitude: delivery.address.latitude,
                  longitude: delivery.address.longitude,
                }}
                title="📍 Punto de entrega"
                description={`${delivery.address.description || ""}${
                  delivery.address.additionalInfo
                    ? `, ${delivery.address.additionalInfo}`
                    : ""
                }`}
                pinColor="green"
              />
            );
          }
          return null;
        })}
      </MapView>
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
  map: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
});
