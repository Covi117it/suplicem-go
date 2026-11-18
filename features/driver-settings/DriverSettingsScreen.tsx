import React, { useContext, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/context/authContext";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  SettingsProfileCard,
  SettingsMenuCard,
  SettingsMenuRow,
  SettingsLogoutButton,
  SettingsInfoRow,
  SupportContactModal,
} from "@/components/settings";
import { AdminUserVehicleFields } from "@/features/admin-users/components/AdminUserVehicleFields";
import { useDriverProfile } from "./hooks/useDriverProfile";
import { DriverVehicleCard } from "./components/DriverVehicleCard";
import { DriverActionButtons } from "./components/DriverActionButtons";

export const DriverSettingsScreen: React.FC = () => {
  const { logOut } = useContext(AuthContext);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false);

  const {
    user,
    isEditing,
    setIsEditing,
    phone,
    setPhone,
    vehicleBrand,
    vehicleModel,
    vehicleYear,
    vehicleTons,
    vehiclePlateNumber,
    handleEdit,
    handleCancel,
    onChangeVehicle,
  } = useDriverProfile();

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
      </View>
    );
  }

  const fullName = `${user.names || ""} ${user.lastNames || ""}`.trim() || "Conductor Oficial";
  const driverCode =
    (user as any)?.driverCode ||
    (user.uid ? `COND-${user.uid.slice(0, 5).toUpperCase()}` : "COND-OFICIAL");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Panel de Conductor</Text>

      {/* Perfil del Conductor */}
      <SettingsProfileCard
        name={fullName}
        email={user.email}
        phone={user.phone}
        badgeText={`Credencial: ${driverCode}`}
        badgeIcon="bus"
        badgeColor="#0F294A"
        badgeBgColor="#E2E8F0"
        badgeBorderColor="#CBD5E1"
        avatarIcon="bus"
      />

      {/* Información Personal */}
      <Text style={styles.sectionTitle}>Datos Personales</Text>
      <View style={styles.card}>
        <SettingsInfoRow
          label="Identificación"
          value={`${user.identificationType || "Cédula"}: ${user.identification || "N/A"}`}
          icon={<Ionicons name="card-outline" size={18} color="#0F294A" />}
        />
        <View style={styles.divider} />
        <SettingsInfoRow
          label="Correo Electrónico"
          value={user.email || "N/A"}
          icon={<Ionicons name="mail-outline" size={18} color="#0F294A" />}
        />
        <View style={styles.divider} />
        <SettingsInfoRow
          label="Teléfono Móvil"
          value={phone}
          icon={<Ionicons name="call-outline" size={18} color="#0F294A" />}
          isEditing={isEditing}
          onChangeText={setPhone}
          placeholder="Ej: 8095551234"
          keyboardType="phone-pad"
        />
      </View>

      {/* Vehículo Asignado */}
      <Text style={styles.sectionTitle}>Vehículo de Carga</Text>
      {isEditing ? (
        <AdminUserVehicleFields
          vehicle={{
            brand: vehicleBrand,
            model: vehicleModel,
            year: vehicleYear,
            tons: vehicleTons,
            plateNumber: vehiclePlateNumber,
          }}
          onChangeVehicle={onChangeVehicle}
        />
      ) : (
        <DriverVehicleCard
          vehicleBrand={vehicleBrand}
          vehicleModel={vehicleModel}
          vehicleYear={vehicleYear}
          vehicleTons={vehicleTons}
          vehiclePlateNumber={vehiclePlateNumber}
        />
      )}

      {/* Botones de Edición */}
      <DriverActionButtons
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleEdit}
      />

      {/* Soporte y Asistencia */}
      {!isEditing && (
        <SettingsMenuCard>
          <SettingsMenuRow
            icon="headset-outline"
            iconColor="#166534"
            iconBgColor="#DCFCE7"
            title="Soporte y Asistencia"
            subtitle="Canales de contacto y horarios"
            onPress={() => setIsSupportModalVisible(true)}
          />
        </SettingsMenuCard>
      )}

      {/* Cerrar Sesión */}
      {!isEditing && (
        <SettingsLogoutButton onPress={() => setIsLogoutModalVisible(true)} />
      )}

      <SupportContactModal
        visible={isSupportModalVisible}
        onClose={() => setIsSupportModalVisible(false)}
      />

      <ConfirmationModal
        visible={isLogoutModalVisible}
        title="Cerrar sesión"
        message="¿Estás seguro que deseas cerrar tu sesión de conductor?"
        onConfirm={() => {
          setIsLogoutModalVisible(false);
          logOut();
        }}
        onCancel={() => setIsLogoutModalVisible(false)}
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
      />
    </ScrollView>
  );
};

export default DriverSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 10,
    marginTop: 6,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 64,
  },
});
