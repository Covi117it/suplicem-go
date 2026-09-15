import InfoRow from "@/components/InfoRow";
import ScreenHeader from "@/components/ScreenHeader";
import StatusBadge from "@/components/StatusBadge";
import OrderFilterChips, { OrderFilterType } from "@/components/orders/OrderFilterChips";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { Palette } from "@/constants/theme";
import { useAlert } from "@/context/alertContext";
import { useOrders } from "@/context/orderContext";
import { getMyOrders } from "@/services/orderService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ClientOrdersMainScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderFilterType>("all");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const { orders, setOrders } = useOrders();
  const { showAlert } = useAlert();

  const fetchOrders = async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) setRefreshing(true);
      const response = await getMyOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showAlert({
        message: "Error al cargar las órdenes. Por favor, inténtalo de nuevo.",
        type: "error",
      });
    } finally {
      if (isPullToRefresh) setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  // Conteo automático por categoría
  const counts: Record<OrderFilterType, number> = useMemo(() => {
    const res: Record<OrderFilterType, number> = {
      all: orders.length,
      approved: 0,
      on_the_way: 0,
      pending: 0,
      delivered: 0,
      canceled: 0,
    };
    orders.forEach((o) => {
      const st = (o.status || "").toLowerCase().trim();
      if (st === "approved") res.approved++;
      else if (st === "pending") res.pending++;
      else if (st === "on_the_way" || st === "in_progress") res.on_the_way++;
      else if (st === "delivered" || st === "completed") res.delivered++;
      else if (st === "canceled" || st === "cancelled" || st === "rejected") res.canceled++;
    });
    return res;
  }, [orders]);

  // Filtrado reactivo en el dispositivo (sin latencia de red)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Filtro por Chip de Estado
      const st = (order.status || "").toLowerCase().trim();
      if (activeFilter === "approved" && st !== "approved") {
        return false;
      }
      if (activeFilter === "on_the_way" && st !== "on_the_way" && st !== "in_progress") {
        return false;
      }
      if (activeFilter === "pending" && st !== "pending") {
        return false;
      }
      if (activeFilter === "delivered" && st !== "delivered" && st !== "completed") {
        return false;
      }
      if (activeFilter === "canceled" && st !== "canceled" && st !== "cancelled" && st !== "rejected") {
        return false;
      }

      // 2. Filtro por Buscador de texto
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const orderNumStr = String(order.orderNumber ?? "").toLowerCase();
        const fullOrderStr = `${ORDER_PREFIX.ORD}${orderNumStr}`.toLowerCase();
        const hasProductMatch = order.items?.some((item) =>
          item.name.toLowerCase().includes(query)
        );
        const hasNumMatch = orderNumStr.includes(query) || fullOrderStr.includes(query);
        const hasDateMatch = new Date(order.createdAt).toLocaleDateString().includes(query);

        if (!hasNumMatch && !hasProductMatch && !hasDateMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeFilter, search]);

  const goToOrderDetail = (id: string) => {
    router.push({
      pathname: "/client-order-detail",
      params: { orderId: id },
    });
  };

  const renderEmptyState = () => {
    if (search.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No se encontraron órdenes</Text>
          <Text style={styles.emptySubtitle}>
            {`No encontramos coincidencias para "${search}".`}
          </Text>
          <TouchableOpacity
            style={styles.clearSearchBtn}
            onPress={() => setSearch("")}
          >
            <Text style={styles.clearSearchText}>Limpiar búsqueda</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeFilter === "approved") {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No hay órdenes aprobadas</Text>
          <Text style={styles.emptySubtitle}>
            Tus pedidos aprobados en espera de asignación de chofer aparecerán aquí.
          </Text>
        </View>
      );
    }

    if (activeFilter === "on_the_way") {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-sport-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No hay órdenes en camino</Text>
          <Text style={styles.emptySubtitle}>
            Cuando un camión salga a despachar tu pedido, aparecerá aquí.
          </Text>
        </View>
      );
    }

    if (activeFilter === "pending") {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No hay órdenes pendientes</Text>
          <Text style={styles.emptySubtitle}>
            No tienes órdenes pendientes de aprobación en este momento.
          </Text>
        </View>
      );
    }

    if (activeFilter === "delivered") {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No hay órdenes entregadas</Text>
          <Text style={styles.emptySubtitle}>
            Tus pedidos completados aparecerán aquí con su historial.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>Aún no tienes órdenes</Text>
        <Text style={styles.emptySubtitle}>
          Realiza tu primera compra desde el catálogo de productos.
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.headerPadding}>
        <ScreenHeader
          title="Histórico de órdenes"
          onRefresh={() => fetchOrders()}
        />

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholderTextColor="#999"
            placeholder="Buscar por # de orden o producto..."
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={styles.clearIcon}
            >
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <OrderFilterChips
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        counts={counts}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredOrders}
        keyExtractor={(order) => order.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders(true)}
            colors={[Palette.primary]}
            tintColor={Palette.primary}
          />
        }
        renderItem={({ item: order }) => (
          <View style={styles.cardWrapper}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => goToOrderDetail(order.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.orderNumber}>
                {ORDER_PREFIX.ORD}
                {String(order.orderNumber ?? "N/A")}
              </Text>

              <InfoRow
                icon="cube-outline"
                label="Productos"
                value={order.items?.length || 0}
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
          </View>
        )}
      />
    </View>
  );
};

export default ClientOrdersMainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  headerPadding: {
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Palette.textDark,
    height: "100%",
  },
  clearIcon: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  cardWrapper: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Palette.surface,
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 14,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },
  clearSearchBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.primary,
  },
  clearSearchText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.primary,
  },
});
