import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FilterChips } from "@/components/FilterChips";
import {
  AdminTrip,
  TRIP_FILTER_OPTIONS,
  useAdminTripsList,
} from "../hooks/useAdminTripsList";
import { AdminTripCard } from "../components/AdminTripCard";

export const AdminTripsListScreen: React.FC = () => {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    tripCounts,
    filteredTrips,
    handleViewTrip,
  } = useAdminTripsList();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Gestión de viajes</Text>
      </View>

      <TextInput
        placeholder="Buscar viaje..."
        placeholderTextColor="#999"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      <FilterChips
        options={TRIP_FILTER_OPTIONS}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
        counts={tripCounts}
        style={styles.filterChips}
      />

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={filteredTrips}
        keyExtractor={(item: AdminTrip) => item.id}
        renderItem={({ item }: { item: AdminTrip }) => (
          <AdminTripCard trip={item} onPress={handleViewTrip} />
        )}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
};

export default AdminTripsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
    marginBottom: 12,
  },
  filterChips: {
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120,
  },
});
