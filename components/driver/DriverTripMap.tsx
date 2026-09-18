import React from "react";
import { Image, StyleSheet, View, Text } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";

type DriverTripMapProps = {
  location: { latitude: number; longitude: number } | null;
  orders?: any[];
  tripStatus?: string;
};

export const DriverTripMap: React.FC<DriverTripMapProps> = ({
  location,
  orders = [],
  tripStatus,
}) => {
  if (tripStatus !== "accepted" && tripStatus !== "started") {
    return null;
  }

  // Buscar primer destino con coordenadas válidas para centrado inicial
  const firstDestination = orders
    ?.flatMap((order: any) => order?.deliveries || [])
    ?.find((d: any) => d?.address?.latitude && d?.address?.longitude);

  const defaultLatitude = firstDestination?.address?.latitude
    ? Number(firstDestination.address.latitude)
    : 18.4861;
  const defaultLongitude = firstDestination?.address?.longitude
    ? Number(firstDestination.address.longitude)
    : -69.9312;

  const initialLatitude = location?.latitude || defaultLatitude;
  const initialLongitude = location?.longitude || defaultLongitude;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType="none"
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          zIndex={-1}
        />

        {location && (
          <Marker
            coordinate={location}
            title="Tu ubicación"
            description="Ubicación actual"
          >
            <Image
              source={require("@/assets/images/camion.png")}
              style={styles.truckIcon}
              resizeMode="contain"
            />
          </Marker>
        )}

        {orders.map((order: any) =>
          order?.deliveries?.map((delivery: any, index: number) => {
            if (delivery?.address?.latitude && delivery?.address?.longitude) {
              return (
                <Marker
                  key={`${order.id}-${index}`}
                  coordinate={{
                    latitude: Number(delivery.address.latitude),
                    longitude: Number(delivery.address.longitude),
                  }}
                  title={`👤: ${order.userNames || ""} ${order.userLastNames || ""}`}
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
          })
        )}
      </MapView>

      {!location && (
        <View style={styles.locatingBanner}>
          <Text style={styles.locatingText}>
            Buscando señal GPS del camión...
          </Text>
        </View>
      )}
    </View>
  );
};

export default DriverTripMap;

const styles = StyleSheet.create({
  container: {
    height: 300,
    marginBottom: 20,
    paddingTop: 20,
    position: "relative",
  },
  map: {
    flex: 1,
    borderRadius: 10,
  },
  truckIcon: {
    width: 50,
    height: 50,
  },
  locatingBanner: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: "rgba(15, 41, 74, 0.85)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  locatingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
