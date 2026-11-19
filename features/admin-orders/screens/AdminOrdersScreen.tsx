import React, { useCallback } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FilterChips } from "@/components/FilterChips";
import { OrderCard } from "@/components/orders/OrderCard";
import { Palette } from "@/constants/theme";
import {
  ORDER_FILTER_OPTIONS,
  useAdminOrdersMain,
} from "../hooks/useAdminOrdersMain";

export const AdminOrdersScreen: React.FC = () => {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    refreshing,
    fetchOrders,
    orderCounts,
    sortedOrders,
    handleViewDetails,
  } = useAdminOrdersMain();

  const renderOrderItem = useCallback(
    ({ item }: { item: any }) => (
      <OrderCard
        key={item.id}
        order={item}
        onPressDetails={handleViewDetails}
      />
    ),
    [handleViewDetails]
  );

  return (
    <View style={styles.container}>
      <View style={styles.topLogoContainer}>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Órdenes de Clientes</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#E31E24" />
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Buscar ..."
        placeholderTextColor="#999"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      <FilterChips
        options={ORDER_FILTER_OPTIONS}
        activeFilter={statusFilter}
        onSelectFilter={(filter) => setStatusFilter(filter as any)}
        counts={orderCounts}
        activeColor={statusFilter === "Alertas IA" ? "#D32F2F" : Palette.primary}
        style={styles.filterChips}
      />

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={sortedOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchOrders}
            colors={["#E31E24"]}
            tintColor="#E31E24"
          />
        }
      />
    </View>
  );
};

export default AdminOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 30,
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
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
  },
  refreshButton: {
    padding: 4,
  },
  input: {
    marginBottom: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
  },
  filterChips: {
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120,
  },
});
