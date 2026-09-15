import React from "react";
import { Image, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

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
  if (!location || (tripStatus !== "accepted" && tripStatus !== "started")) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker.Animated
          coordinate={location}
          title="Tu ubicación"
          description="Ubicación actual"
        >
          <Image
            source={require("@/assets/images/camion.png")}
            style={styles.truckIcon}
            resizeMode="contain"
          />
        </Marker.Animated>

        {orders.map((order: any) =>
          order?.deliveries?.map((delivery: any, index: number) => {
            if (delivery?.address?.latitude && delivery?.address?.longitude) {
              return (
                <Marker
                  key={`${order.id}-${index}`}
                  coordinate={{
                    latitude: delivery.address.latitude,
                    longitude: delivery.address.longitude,
                  }}
                  title={`👤: ${order.userNames} ${order.userLastNames}`}
                  description={`${delivery.address.description}${
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
    </View>
  );
};

export default DriverTripMap;

const styles = StyleSheet.create({
  container: {
    height: 300,
    marginBottom: 20,
    paddingTop: 20,
  },
  map: {
    flex: 1,
    borderRadius: 10,
  },
  truckIcon: {
    width: 50,
    height: 50,
  },
});
