import { ORDER_PREFIX } from "@/constants/UserConstants";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { useOrders } from "@/context/orderContext";
import { getMyOrders } from "@/services/orderService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import InfoRow from "@/components/InfoRow";
import ScreenHeader from "@/components/ScreenHeader";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type OrderItem = {
  id: string;
  orderNumber?: string | number | null;
  items: {
    name: string;
    quantity: number;
  }[];
  status: string;
  createdAt: string;
};

const ClientOrdersMainScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  // 'setSelectedOrder' ya no se usa, así que la eliminamos de la desestructuración
  const { orders, setOrders } = useOrders();
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const fetchOrders = async (searchTerm = search) => {
    try {
      show();
      const response = await getMyOrders({ search: searchTerm });
      setOrders(response.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showAlert({
        message: "Error al cargar las órdenes. Por favor, inténtalo de nuevo.",
        type: "error",
      });
    }
    hide();
  };


  // Se modificó la función para que no use 'setSelectedOrder'
  const goToOrderDetail = (id: string) => {
    router.push({
      pathname: "/client-order-detail",
      params: { orderId: id },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <ScreenHeader
        title="Histórico de órdenes"
        onRefresh={() => fetchOrders()}
      />

      <TextInput
        style={styles.searchInput}
        placeholderTextColor="#999"
        placeholder="Buscar..."
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          fetchOrders(text);
        }}
      />

      <View style={styles.list}>
        {orders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.card}
            onPress={() => goToOrderDetail(order.id)}
          >
            <Text style={styles.orderNumber}>
              {ORDER_PREFIX.ORD}
              {String(order.orderNumber ?? "N/A")}
            </Text>

            <InfoRow
              icon="cube-outline"
              label="Productos"
              value={order.items.length}
            />
            <InfoRow
              icon="calendar-outline"
              label="Fecha"
              value={new Date(order.createdAt).toLocaleDateString()}
            />
            <InfoRow icon="shield-checkmark-outline" label="Estado">
              <StatusBadge status={order.status} size="small" />
            </InfoRow>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ClientOrdersMainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f3",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#A04A0E",
    marginBottom: 24,
  },
  searchInput: {
    height: 45,
    backgroundColor: "#ffffff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  orderNumber: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
});
