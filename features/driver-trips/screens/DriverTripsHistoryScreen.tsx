import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Trip } from "@/types/trips";
import { useDriverTripsHistory } from "../hooks/useDriverTripsHistory";
import { DriverTripHistoryCard } from "../components/DriverTripHistoryCard";

export const DriverTripsHistoryScreen: React.FC = () => {
  const {
    search,
    setSearch,
    filteredTrips,
    fetchTrips,
    handleOpenTrip,
  } = useDriverTripsHistory();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Histórico de viajes</Text>
        <TouchableOpacity onPress={fetchTrips} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#A04A0E" />
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Buscar..."
        placeholderTextColor="#999"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredTrips}
        keyExtractor={(item: Trip) => item.id}
        renderItem={({ item }: { item: Trip }) => (
          <DriverTripHistoryCard trip={item} onPress={handleOpenTrip} />
        )}
        ListEmptyComponent={
          <Text style={styles.noTrips}>No se encontraron viajes</Text>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default DriverTripsHistoryScreen;

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
  refreshButton: {
    padding: 4,
  },
  input: {
    marginBottom: 16,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  noTrips: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#666",
  },
});
