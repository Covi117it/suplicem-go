import CheckRender from "@/components/CheckRender";
import StatusBadge from "@/components/StatusBadge";
import InfoRow from "@/components/InfoRow";
import ScreenHeader from "@/components/ScreenHeader";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { Palette } from "@/constants/theme";
import { CartContext, Product } from "@/context/cartContext";
import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { useOrders } from "@/context/orderContext";
import { getOrderTracking } from "@/services/orderService";
import { formatRD } from "@/utils/currencyUtils";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";

const TRACKING_STEPS = ["Pendiente de iniciar", "En camino", "Completado"];

const OrderDetailScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { orders } = useOrders();
  const { show, hide } = useLoading();
  const { orderId } = useLocalSearchParams();
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [trip, setTrip] = useState<any>(null);

  // Encontrar la orden basándose en el ID de la URL
  const selectedOrder = orders.find((order) => order.id === orderId);

  useFocusEffect(
    useCallback(() => {
      // Asegúrate de que la orden seleccionada exista antes de continuar
      if (!selectedOrder) return;
      show();
      refreshDriverLocationAndTripStatus();
      hide();

      const interval = setInterval(() => {
        refreshDriverLocationAndTripStatus();
      }, 8000);

      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOrder?.id])
  );

  const refreshDriverLocationAndTripStatus = async () => {
    if (!selectedOrder) return;

    try {
      const response = await getOrderTracking(selectedOrder.id);
      if (response?.success && response?.data?.tracking) {
        const { trip: trackingTrip, location, driver } = response.data.tracking;
        if (trackingTrip) {
          const mergedTrip = {
            ...trackingTrip,
            assignedDriverId: trackingTrip.assignedDriverId || driver?.id,
            driver: trackingTrip.driver || driver,
          };
          setTrip(mergedTrip);
        }
        if (location) {
          setDriverLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        }
      }
    } catch (error) {
      console.error("Error al obtener tracking de orden:", error);
    }
  };

  if (!selectedOrder) {
    return (
      <View style={styles.container}>
        <Text>No se encontró información de la orden.</Text>
      </View>
    );
  }

  const getStepCompleted = (step: string) => {
    const stepIndex = TRACKING_STEPS.indexOf(step);
    const currentIndex = TRACKING_STEPS.indexOf(
      trip?.status === "accepted"
        ? "Pendiente de iniciar"
        : trip?.status === "started" || trip?.status === "in_progress"
        ? "En camino"
        : trip?.status === "completed"
        ? "Completado"
        : ""
    );
    return stepIndex <= currentIndex;
  };

  const handleCallDriver = () => {
    if (trip?.driver?.phone) {
      Linking.openURL(`tel:${trip?.driver?.phone}`);
    }
  };

  const handleWhatsapp = (phone: string) => {
    if (phone) {
      const formattedPhone = phone.startsWith("+") ? phone : `+1${phone}`;
      Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
    }
  };

  const { cart, setCartItems, addToCart } = useContext(CartContext);
  const router = useRouter();

  const handleRepeatOrder = () => {
    if (!selectedOrder?.items || selectedOrder.items.length === 0) return;

    const formattedProducts: Product[] = selectedOrder.items.map((item: any) => {
      const qty = Number(item.quantity) || 100;
      const unitPrice =
        Number(item.unitPrice) ||
        Number(item.price) ||
        (item.subtotal ? Math.round(Number(item.subtotal) / qty) : 480);

      return {
        id: item.productId || item.id || `prod-${Math.random()}`,
        name: item.name,
        price: unitPrice,
        fundas: qty,
      };
    });

    const executeReorder = (replace: boolean) => {
      if (replace) {
        setCartItems(formattedProducts);
      } else {
        formattedProducts.forEach((p: Product) => addToCart(p));
      }
      router.push("/client-cart");
    };

    if (cart.length > 0) {
      Alert.alert(
        "Carrito con productos",
        "Ya tienes materiales en tu carrito. ¿Deseas reemplazar el carrito con los productos de este pedido o sumarlos?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sumar al carrito", onPress: () => executeReorder(false) },
          { text: "Reemplazar carrito", style: "destructive", onPress: () => executeReorder(true) },
        ]
      );
    } else {
      executeReorder(true);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <ScreenHeader title="Detalle de Orden" showBack={true} />

      <View style={styles.section}>
        <InfoRow
          icon="receipt-outline"
          label="Número de Orden"
          value={`${ORDER_PREFIX.ORD}${selectedOrder.orderNumber}`}
        />
        <InfoRow icon="shield-checkmark-outline" label="Estado">
          <StatusBadge status={selectedOrder.status} size="small" />
        </InfoRow>

        {Boolean(selectedOrder.userPhone || user?.phone) && (
          <InfoRow
            icon="call-outline"
            label="Teléfono de Contacto"
            value={selectedOrder.userPhone || user?.phone || "No registrado"}
          />
        )}

        <InfoRow
          icon="cube-outline"
          label="Tipo de Entrega"
          value={
            selectedOrder.deliveryType === "domicilio"
              ? "Entrega a Domicilio / Obra"
              : "Retiro en Almacén"
          }
        />

        {selectedOrder.deliveryType === "domicilio" &&
          Boolean(
            selectedOrder.deliveryAddress ||
              selectedOrder.deliveries?.[0]?.address
          ) && (
            <InfoRow
              icon="location-outline"
              label="Dirección de Entrega"
              value={`${
                (
                  selectedOrder.deliveryAddress ||
                  selectedOrder.deliveries?.[0]?.address
                )?.description || ""
              }${
                (
                  selectedOrder.deliveryAddress ||
                  selectedOrder.deliveries?.[0]?.address
                )?.additionalInfo
                  ? ", " +
                    (
                      selectedOrder.deliveryAddress ||
                      selectedOrder.deliveries?.[0]?.address
                    )?.additionalInfo
                  : ""
              }`}
            />
          )}

        {trip && (
          <InfoRow icon="car-outline" label="Estado del Viaje">
            <StatusBadge status={trip.status || "available"} size="small" />
          </InfoRow>
        )}

        {/* Banner de Estado del Viaje (Aceptado o En camino) */}
        {trip?.status === "accepted" && (
          <View style={styles.acceptedBanner}>
            <View style={styles.acceptedBannerIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.acceptedBannerTitle}>¡Viaje Aceptado por el Conductor!</Text>
              <Text style={styles.acceptedBannerText}>
                {trip?.driver?.names
                  ? `${trip.driver.names} aceptó tu pedido y está preparando la carga para iniciar ruta.`
                  : "Tu pedido ya fue aceptado por el conductor y se está preparando para salir."}
              </Text>
            </View>
          </View>
        )}

        {(trip?.status === "started" || trip?.status === "in_progress") && (
          <View
            style={[
              styles.acceptedBanner,
              { backgroundColor: "#EFF6FF", borderColor: "#93C5FD" },
            ]}
          >
            <View
              style={[
                styles.acceptedBannerIcon,
                { backgroundColor: "#DBEAFE" },
              ]}
            >
              <Ionicons name="navigate" size={24} color="#1D4ED8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.acceptedBannerTitle, { color: "#1E40AF" }]}>
                ¡Pedido en Camino!
              </Text>
              <Text style={[styles.acceptedBannerText, { color: "#1E3A8A" }]}>
                {trip?.driver?.names
                  ? `${trip.driver.names} va en camino con tu entrega. Puedes ver su avance en el mapa.`
                  : "El conductor ha iniciado la ruta de entrega hacia tu dirección."}
              </Text>
            </View>
          </View>
        )}

        {/* Banner de Repetir Pedido */}
        <View style={styles.reorderCard}>
          <View style={styles.reorderHeader}>
            <View style={styles.reorderIconBadge}>
              <Ionicons name="repeat" size={22} color={Palette.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reorderTitle}>¿Volver a pedir estos materiales?</Text>
              <Text style={styles.reorderSubtitle}>
                Carga los {selectedOrder.items?.length || 0} productos directamente a tu carrito
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.reorderButton}
            onPress={handleRepeatOrder}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.reorderButtonText}>Repetir este pedido</Text>
          </TouchableOpacity>
        </View>

        <CheckRender allowed={trip !== null}>
          <InfoRow
            icon="navigate-outline"
            label="Número de Viaje"
            value={trip?.tripNumber}
          />
        </CheckRender>

        <CheckRender allowed={Boolean(trip?.assignedDriverId || trip?.driver)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚚 Conductor y Vehículo de Despacho</Text>
            <View style={styles.driverInfoCard}>
              <Text style={styles.value}>
                👤 <Text style={{ fontWeight: "bold" }}>Conductor:</Text> {trip?.driver?.names} {trip?.driver?.lastNames}
              </Text>
              <Text style={styles.value}>
                📞 <Text style={{ fontWeight: "bold" }}>Teléfono:</Text> {trip?.driver?.phone}
              </Text>

              {trip?.driver?.vehicle && (
                <View style={styles.driverPlateBadge}>
                  <Ionicons name="car-sport" size={20} color="#0F294A" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.driverPlateLabel}>NÚMERO DE PLACA VEHICULAR</Text>
                    <Text style={styles.driverPlateNumber}>
                      {trip?.driver?.vehicle?.plateNumber || "No registrada"}
                    </Text>
                    <Text style={styles.driverVehicleModel}>
                      {trip?.driver?.vehicle?.brand} {trip?.driver?.vehicle?.model} {trip?.driver?.vehicle?.year ? `(${trip?.driver?.vehicle?.year})` : ""}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCallDriver}
          >
            <Text style={styles.actionText}>📞 Llamar al conductor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.callButton, styles.whatsappButton]}
            onPress={() => handleWhatsapp(trip?.driver?.phone)}
          >
            <Text style={styles.actionText}>💬 Chat en WhatsApp</Text>
          </TouchableOpacity>

          <View style={{ marginBottom: 10 }} />
        </CheckRender>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos</Text>
          {selectedOrder.items.map((item, index) => (
            <View key={index} style={styles.productCard}>
              <Text style={styles.productTitle}>🛒 Producto {index + 1}</Text>
              <Text style={styles.productLine}>
                📄 <Text style={styles.bold}>Descripción:</Text> {item.name}
              </Text>
              <Text style={styles.productLine}>
                📦 <Text style={styles.bold}>Cantidad:</Text> {item.quantity}{" "}
                {item.unit}
              </Text>
              <Text style={styles.productLine}>
                💰 <Text style={styles.bold}>Monto total:</Text>{" "}
                {formatRD(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>
        {selectedOrder.deliveries?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entregas</Text>
            <View style={styles.deliveriesContainer}>
              {selectedOrder.deliveries.map((delivery, idx) => (
                <View key={idx} style={styles.deliveryCard}>
                  <Text style={styles.deliveryAddress}>
                    📍 {delivery.address?.description}
                    {delivery.address?.additionalInfo &&`, ${delivery.address.additionalInfo}`}
                  </Text>
                  <Text style={styles.value}>
                    🪣{" "}
                    {
                      selectedOrder?.items?.find(
                        (o) => o.productId === delivery.productId
                      )?.name
                    }{" "}
                    - {delivery.quantity} {delivery.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {selectedOrder.comments && (
          <>
            <Text style={styles.label}>Comentarios:</Text>
            <Text style={styles.value}>{selectedOrder.comments}</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seguimiento del pedido</Text>
        {TRACKING_STEPS.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: getStepCompleted(step) ? "#4CAF50" : "#ccc",
                },
              ]}
            />
            <Text style={styles.stepLabel}>{step}</Text>
          </View>
        ))}
      </View>

      {driverLocation &&
        Boolean(trip?.assignedDriverId || trip?.driver) &&
        (trip?.status === "accepted" || trip?.status === "started" || trip?.status === "in_progress") && (
          <View style={styles.section}>
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

              {selectedOrder?.deliveries?.map(
                (delivery: any, index: number) => {
                  if (
                    delivery?.address?.latitude &&
                    delivery?.address?.longitude
                  ) {
                    return (
                      <Marker
                        key={`${selectedOrder.id}-${index}`}
                        coordinate={{
                          latitude: delivery.address.latitude,
                          longitude: delivery.address.longitude,
                        }}
                        title={"📍 Punto de entrega"}
                        description={`${delivery.address.description}${
                          delivery.address.additionalInfo && `, ${delivery.address.additionalInfo}`
                        }`}
                        pinColor="green"
                      />
                    );
                  }
                  return null;
                }
              )}
            </MapView>
          </View>
        )}
    </ScrollView>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f3",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
  },
  value: {
    fontSize: 16,
    color: "#222",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  stepLabel: {
    fontSize: 16,
  },
  deliveriesContainer: {
    marginBottom: -20,
  },
  deliveriesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  deliveryCard: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  deliveryAddress: {
    fontSize: 16,
    color: "#333",
  },
  deliveryItem: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  map: {
    width: Dimensions.get("window").width - 32,
    height: 200,
    borderRadius: 10,
  },
  callButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    marginTop: 8,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  productLine: {
    fontSize: 15,
    color: "#444",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "600",
    color: "#222",
  },
  driverInfoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  driverPlateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  driverPlateLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  driverPlateNumber: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#0F294A",
    marginTop: 2,
  },
  driverVehicleModel: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  reorderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderLeftWidth: 4,
    borderLeftColor: Palette.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reorderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  reorderIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(227, 30, 36, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  reorderTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Palette.textDark,
  },
  reorderSubtitle: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  reorderButton: {
    backgroundColor: Palette.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  reorderButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13,
  },
  acceptedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    gap: 12,
  },
  acceptedBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  acceptedBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#15803D",
    marginBottom: 2,
  },
  acceptedBannerText: {
    fontSize: 13,
    color: "#166534",
    lineHeight: 18,
  },
});
