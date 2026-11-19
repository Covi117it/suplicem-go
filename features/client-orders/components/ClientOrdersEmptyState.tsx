import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OrderFilterType } from "@/components/orders/OrderFilterChips";

interface ClientOrdersEmptyStateProps {
  search: string;
  activeFilter: OrderFilterType;
  onClearSearch: () => void;
}

export const ClientOrdersEmptyState: React.FC<ClientOrdersEmptyStateProps> = ({
  search,
  activeFilter,
  onClearSearch,
}) => {
  if (search.trim()) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No se encontraron órdenes</Text>
        <Text style={styles.emptySubtitle}>
          {`No encontramos coincidencias para "${search}".`}
        </Text>
        <TouchableOpacity style={styles.clearSearchBtn} onPress={onClearSearch}>
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

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F294A",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  clearSearchBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  clearSearchText: {
    color: "#0F294A",
    fontWeight: "600",
    fontSize: 13,
  },
});
