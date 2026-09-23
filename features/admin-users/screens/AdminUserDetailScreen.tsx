import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Palette } from "@/constants/theme";
import { useAdminUserDetail } from "../hooks/useAdminUserDetail";
import { AdminUserHeaderCard } from "../components/AdminUserHeaderCard";
import { AdminUserActionsBar } from "../components/AdminUserActionsBar";
import { AdminUserAiRiskCard } from "../components/AdminUserAiRiskCard";
import { AdminUserContactCard } from "../components/AdminUserContactCard";
import { AdminUserRoleCard } from "../components/AdminUserRoleCard";

interface AdminUserDetailScreenProps {
  userId?: string;
  initialUser?: any;
}

export const AdminUserDetailScreen: React.FC<AdminUserDetailScreenProps> = ({
  userId,
  initialUser,
}) => {
  const {
    user,
    refreshing,
    fetchUser,
    handleCall,
    handleWhatsapp,
    handleToggleStatus,
  } = useAdminUserDetail(userId, initialUser);

  if (!user && refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Detalle de Usuario" showBack />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontró información del usuario.</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchUser}
          colors={[Palette.primary]}
        />
      }
    >
      <ScreenHeader title="Detalle de Usuario" showBack />

      {/* 1. Hero Card: Avatar, Nombre, Rol, Estado */}
      <AdminUserHeaderCard user={user} />

      {/* 2. Barra de Acciones: Llamar, WhatsApp, Activar/Inactivar */}
      <AdminUserActionsBar
        phone={user.phone}
        status={user.status}
        onCall={handleCall}
        onWhatsapp={handleWhatsapp}
        onToggleStatus={handleToggleStatus}
      />

      {/* 3. Alerta de Seguridad SynthID (si aplica) */}
      <AdminUserAiRiskCard user={user} />

      {/* 4. Datos de Contacto e Identificación (con visor de cédula) */}
      <AdminUserContactCard user={user} />

      {/* 5. Datos Específicos según Rol (Vehículo chofer / Direcciones cliente) */}
      <AdminUserRoleCard user={user} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Palette.background,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 15,
  },
});
