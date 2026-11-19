import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConfirmationModal from "@/components/ConfirmationModal";
import { ProfileAddressesCard } from "@/components/profile/ProfileAddressesCard";
import { LegalSectionCard } from "@/components/profile/LegalSectionCard";
import { TermsAndConditionsModal } from "@/components/profile/TermsAndConditionsModal";
import {
  SettingsProfileCard,
  SettingsMenuCard,
  SettingsMenuRow,
  SettingsLogoutButton,
  SettingsInfoRow,
  SupportContactModal,
} from "@/components/settings";
import { Palette } from "@/constants/theme";
import { useClientSettings } from "../hooks/useClientSettings";

export const ClientSettingsScreen: React.FC = () => {
  const {
    user,
    fullName,
    phone,
    setPhone,
    addresses,
    setAddresses,
    isEditing,
    setIsEditing,
    isLogoutModalVisible,
    setIsLogoutModalVisible,
    isTermsModalVisible,
    setIsTermsModalVisible,
    isSupportModalVisible,
    setIsSupportModalVisible,
    handleLogout,
    confirmLogout,
    handleEdit,
    handleCancel,
  } = useClientSettings();

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando datos del cliente...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Mi Cuenta</Text>

      <SettingsProfileCard
        name={fullName}
        email={user?.email}
        phone={user?.phone}
        badgeText={user.status === "active" ? "Cliente Activo" : "Cliente Registrado"}
        badgeIcon="person"
        badgeColor="#0369A1"
        badgeBgColor="#E0F2FE"
        badgeBorderColor="#BAE6FD"
        avatarIcon="person"
      />

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

      <ProfileAddressesCard
        isEditing={isEditing}
        addresses={addresses}
        setAddresses={setAddresses}
        userAddresses={user.addresses}
      />

      <LegalSectionCard onOpenTerms={() => setIsTermsModalVisible(true)} />

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

      <View style={styles.actionButtonsContainer}>
        {isEditing ? (
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.saveBtn]}
              onPress={handleEdit}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editToggleBtn}
            onPress={() => setIsEditing(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={18} color={Palette.primary} />
            <Text style={styles.editToggleText}>Editar Perfil y Direcciones</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isEditing && <SettingsLogoutButton onPress={handleLogout} />}

      <TermsAndConditionsModal
        visible={isTermsModalVisible}
        onClose={() => setIsTermsModalVisible(false)}
      />

      <SupportContactModal
        visible={isSupportModalVisible}
        onClose={() => setIsSupportModalVisible(false)}
      />

      <ConfirmationModal
        visible={isLogoutModalVisible}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
      />
    </ScrollView>
  );
};

export default ClientSettingsScreen;

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
    fontSize: 14,
    color: "#64748B",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F294A",
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  actionButtonsContainer: {
    marginVertical: 16,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  cancelBtnText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: Palette.primary,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  editToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    paddingVertical: 12,
  },
  editToggleText: {
    color: Palette.primary,
    fontWeight: "700",
    fontSize: 14,
  },
});
