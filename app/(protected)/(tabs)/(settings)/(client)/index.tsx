import CheckRender from "@/components/CheckRender";
import ConfirmationModal from "@/components/ConfirmationModal";
import LegalSectionCard from "@/components/profile/LegalSectionCard";
import ProfileAddressesCard from "@/components/profile/ProfileAddressesCard";
import TermsAndConditionsModal from "@/components/profile/TermsAndConditionsModal";
import { ROLE } from "@/constants/UserConstants";
import { Palette } from "@/constants/theme";
import { useAlert } from "@/context/alertContext";
import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { updateClientProfile } from "@/services/userService";
import { Address } from "@/types/users";
import { isTermsNoticeEnabled, resetAcceptedTerms, setTermsNoticeEnabled } from "@/utils/authStorage";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type InfoRowProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    {icon && <View style={styles.iconWrapper}>{icon}</View>}
    <View style={styles.infoTextWrapper}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

type InputRowProps = {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
};

const InputRow: React.FC<InputRowProps> = ({
  label,
  value,
  onChange,
  placeholder,
  icon,
}) => (
  <View style={styles.infoRow}>
    {icon && <View style={styles.iconWrapper}>{icon}</View>}
    <View style={styles.infoTextWrapper}>
      <Text style={styles.infoLabel}>{label}</Text>
      <TextInput
        style={styles.inputField}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#AAA"
      />
    </View>
  </View>
);

const ClientSettingsMainScreen: React.FC = () => {
  const { user, logOut, logIn } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { show, hide } = useLoading();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [phone, setPhone] = useState(user?.phone || "");
  const [addresses, setAddresses] = useState<Address[]>(user?.addresses || []);
  const [termsNoticeEnabledState, setTermsNoticeEnabledState] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      setPhone(user.phone || "");
      setAddresses(user.addresses || []);
      isTermsNoticeEnabled(user.uid).then(setTermsNoticeEnabledState);
    }
  }, [user]);

  const toggleTermsNotice = async () => {
    if (!user?.uid) return;
    const newState = !termsNoticeEnabledState;
    await setTermsNoticeEnabled(user.uid, newState);
    setTermsNoticeEnabledState(newState);
    showAlert({
      message: newState
        ? "¡Aviso habilitado! Se solicitará aceptación de Términos al iniciar sesión."
        : "¡Aviso deshabilitado! El aviso de Términos no se mostrará al iniciar sesión.",
      type: "info",
    });
  };

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    if (user?.uid) {
      await resetAcceptedTerms(user.uid);
    }
    setIsLogoutModalVisible(false);
    logOut();
  };

  const handleEdit = async () => {
    if (isEditing) {
      if (!user) {
        showAlert({
          message: "No se puede guardar, el usuario no está disponible.",
          type: "error",
        });
        return;
      }
      try {
        show();
        await updateClientProfile(user.uid, phone, addresses);

        const newUser = {
          ...user,
          phone: phone,
          addresses: addresses,
        };

        logIn(newUser);
        showAlert({
          message: "¡Perfil actualizado con éxito!",
          type: "success",
        });
      } catch (error) {
        console.error("❌ Error en la actualización del perfil:", error);
        showAlert({
          message: "No se pudo actualizar el perfil. Inténtelo de nuevo.",
          type: "error",
        });
      } finally {
        hide();
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setPhone(user.phone || "");
      setAddresses(user.addresses || []);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
      </View>
    );
  }

  const fullName = `${user.names} ${user.lastNames}`;

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={48} color={Palette.primary} />
        </View>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.role}>
          {user.userType === "client" ? "Cliente" : "Conductor"}
        </Text>
      </View>

      <View style={styles.cardSharp}>
        <InfoRow
          label="Tipo de identificación"
          value={user.identificationType}
          icon={<Feather name="credit-card" size={22} color={Palette.primary} />}
        />
        <InfoRow
          label="Número de identificación"
          value={user.identification}
          icon={<Feather name="hash" size={22} color={Palette.primary} />}
        />
        <InfoRow
          label="Correo electrónico"
          value={user.email}
          icon={<Feather name="mail" size={22} color={Palette.primary} />}
        />
        {isEditing ? (
          <InputRow
            label="Teléfono"
            value={phone}
            onChange={setPhone}
            placeholder="Introduce el nuevo teléfono"
            icon={<Feather name="phone" size={22} color={Palette.primary} />}
          />
        ) : (
          <InfoRow
            label="Teléfono"
            value={user.phone}
            icon={<Feather name="phone" size={22} color={Palette.primary} />}
          />
        )}
      </View>

      <CheckRender allowed={user?.userType === ROLE.CLIENT}>
        <ProfileAddressesCard
          isEditing={isEditing}
          addresses={addresses}
          setAddresses={setAddresses}
          userAddresses={user.addresses}
        />
      </CheckRender>

      <CheckRender allowed={user?.userType === ROLE.DRIVER}>
        <View style={styles.cardSharp}>
          <Text style={styles.sectionTitle}>Vehículo</Text>
          {user.vehicle ? (
            <>
              <InfoRow
                label="Marca"
                value={user.vehicle.brand}
                icon={
                  <MaterialIcons
                    name="directions-car"
                    size={22}
                    color={Palette.primary}
                  />
                }
              />
              <InfoRow
                label="Modelo"
                value={user.vehicle.model}
                icon={<Feather name="tag" size={22} color={Palette.primary} />}
              />
            </>
          ) : (
            <Text style={styles.emptyText}>No registrado</Text>
          )}
        </View>
      </CheckRender>

      <LegalSectionCard
        onOpenTerms={() => setIsTermsModalVisible(true)}
        onToggleNotice={toggleTermsNotice}
        termsNoticeEnabled={termsNoticeEnabledState}
      />

      {isEditing && (
        <TouchableOpacity
          style={[styles.sharpButton, styles.cancelButton]}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonTextSharp}>Cancelar</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.sharpButton}
        onPress={handleEdit}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonTextSharp}>{isEditing ? "Guardar" : "Editar perfil"}</Text>
      </TouchableOpacity>

      {!isEditing && (
        <TouchableOpacity
          style={styles.logoutButtonSharp}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutTextSharp}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}

      <TermsAndConditionsModal
        visible={isTermsModalVisible}
        onClose={() => setIsTermsModalVisible(false)}
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

export default ClientSettingsMainScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 45,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#4B5563",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    backgroundColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderColor: Palette.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  role: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  cardSharp: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Palette.primaryDark,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  iconWrapper: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginTop: 2,
  },
  inputField: {
    backgroundColor: "#FAF8F5",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 13,
    color: Palette.primaryDark,
    marginTop: 4,
  },
  emptyText: {
    color: "#6b7280",
    fontStyle: "italic",
    marginVertical: 4,
  },
  sharpButton: {
    backgroundColor: Palette.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: "#6b7280",
  },
  buttonTextSharp: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  logoutButtonSharp: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: Palette.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  logoutTextSharp: {
    color: Palette.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
});
