import React from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/components/ScreenHeader";
import OrderFilterChips from "@/components/orders/OrderFilterChips";
import { Palette } from "@/constants/theme";
import { useClientOrdersList } from "../hooks/useClientOrdersList";
import { ClientOrdersEmptyState } from "../components/ClientOrdersEmptyState";
import { ClientOrderListItem } from "../components/ClientOrderListItem";

export const ClientOrdersScreen: React.FC = () => {
  const {
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    refreshing,
    counts,
    filteredOrders,
    fetchOrders,
    goToOrderDetail,
    handleQuickReorder,
  } = useClientOrdersList();

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
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <ClientOrdersEmptyState
            search={search}
            activeFilter={activeFilter}
            onClearSearch={() => setSearch("")}
          />
        }
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
          <ClientOrderListItem
            order={order}
            onPress={() => goToOrderDetail(order.id)}
            onQuickReorder={handleQuickReorder}
          />
        )}
      />
    </View>
  );
};

export default ClientOrdersScreen;

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
});
