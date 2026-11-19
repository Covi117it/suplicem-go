import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAdminUserRequests } from "../hooks/useAdminUserRequests";
import { UserRequestCard } from "../components/UserRequestCard";
import { IdPhotoModal } from "../components/IdPhotoModal";

export const AdminUserRequestsScreen: React.FC = () => {
  const {
    pendingUsers,
    aiAlertUsers,
    activeTab,
    setActiveTab,
    selectedIdImage,
    setSelectedIdImage,
    refreshing,
    fetchUsers,
    handleUpdateStatus,
    currentList,
  } = useAdminUserRequests();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchUsers}
          colors={["#E31E24"]}
          tintColor="#E31E24"
        />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Solicitudes de Registro</Text>
        <TouchableOpacity onPress={fetchUsers} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#0F294A" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "pending" && styles.tabButtonActive]}
          onPress={() => setActiveTab("pending")}
        >
          <Text style={[styles.tabText, activeTab === "pending" && styles.tabTextActive]}>
            Pendientes ({pendingUsers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "ai_alerts" && styles.tabButtonActiveAi]}
          onPress={() => setActiveTab("ai_alerts")}
        >
          <Ionicons
            name="warning-outline"
            size={16}
            color={activeTab === "ai_alerts" ? "#fff" : "#D32F2F"}
          />
          <Text style={[styles.tabText, activeTab === "ai_alerts" && styles.tabTextActive]}>
            Alertas IA ({aiAlertUsers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {currentList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyText}>
            {activeTab === "pending"
              ? "No hay solicitudes pendientes de aprobación"
              : "No hay cuentas marcadas con alteración de IA por SynthID"}
          </Text>
        </View>
      ) : (
        currentList.map((user, idx) => (
          <UserRequestCard
            key={user.uid || idx}
            user={user}
            onViewImage={setSelectedIdImage}
            onUpdateStatus={handleUpdateStatus}
          />
        ))
      )}

      <IdPhotoModal
        imageUri={selectedIdImage}
        onClose={() => setSelectedIdImage(null)}
      />
    </ScrollView>
  );
};

export default AdminUserRequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
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
    padding: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: "#0F294A",
    borderColor: "#0F294A",
  },
  tabButtonActiveAi: {
    backgroundColor: "#D32F2F",
    borderColor: "#D32F2F",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#475569",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});
