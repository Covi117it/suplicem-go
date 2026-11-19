import React from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { Palette } from "@/constants/theme";
import {
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  useAdminUsersList,
} from "../hooks/useAdminUsersList";
import { AdminUserCard } from "../components/AdminUserCard";

export const AdminUsersListScreen: React.FC = () => {
  const {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    refreshing,
    onRefresh,
    roleCounts,
    statusCounts,
    filteredUsers,
    authUser,
    handleSelectUser,
    handleActivate,
    handleInactivate,
  } = useAdminUsersList();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Palette.primary]}
        />
      }
    >
      <ScreenHeader
        title="Lista de Usuarios"
        showBack={true}
        style={styles.header}
      />

      <SearchBar
        placeholder="Buscar por nombre, cédula o vendedor..."
        value={search}
        onChangeText={setSearch}
        containerStyle={styles.searchBar}
      />

      <FilterChips
        options={ROLE_OPTIONS}
        activeFilter={roleFilter}
        onSelectFilter={setRoleFilter}
        counts={roleCounts}
      />

      <FilterChips
        options={STATUS_OPTIONS}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
        counts={statusCounts}
      />

      {filteredUsers.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={42} color="#94A3B8" />
          <Text style={styles.emptyText}>
            No se encontraron usuarios con los filtros seleccionados.
          </Text>
        </View>
      )}

      {filteredUsers.map((user) => (
        <AdminUserCard
          key={user.uid}
          user={user}
          isSelf={user.uid === authUser?.uid}
          onSelect={handleSelectUser}
          onActivate={handleActivate}
          onInactivate={handleInactivate}
        />
      ))}
    </ScrollView>
  );
};

export default AdminUsersListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  header: {
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});
