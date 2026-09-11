import AddressPicker from "@/components/AddressPicker";
import CheckRender from "@/components/CheckRender";
import ConfirmationModal from "@/components/ConfirmationModal";
import { ROLE } from "@/constants/UserConstants";
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
  Modal,
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

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        placeId: "",
        description: "",
        latitude: 0,
        longitude: 0,
        additionalInfo: "",
      },
    ]);
  };

  const removeAddress = (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
      </View>
    );
  }

  const fullName = `${user.names} ${user.lastNames}`;
  const avatarUri = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.role}>
          {user.userType === "client" ? "Cliente" : "Conductor"}
        </Text>
      </View>

      <View style={styles.cardSharp}>
        <InfoRow
          label="Tipo de identificación"
          value={user.identificationType}
          icon={<Feather name="credit-card" size={22} color="#E31E24" />}
        />
        <InfoRow
          label="Número de identificación"
          value={user.identification}
          icon={<Feather name="hash" size={22} color="#E31E24" />}
        />
        <InfoRow
          label="Correo electrónico"
          value={user.email}
          icon={<Feather name="mail" size={22} color="#E31E24" />}
        />
        {isEditing ? (
          <InputRow
            label="Teléfono"
            value={phone}
            onChange={setPhone}
            placeholder="Introduce el nuevo teléfono"
            icon={<Feather name="phone" size={22} color="#E31E24" />}
          />
        ) : (
          <InfoRow
            label="Teléfono"
            value={user.phone}
            icon={<Feather name="phone" size={22} color="#E31E24" />}
          />
        )}
      </View>

      <CheckRender allowed={user?.userType === ROLE.CLIENT}>
        <View style={styles.cardSharp}>
          <Text style={styles.sectionTitle}>Direcciones de Entrega</Text>

          {isEditing ? (
            <>
              {addresses.length > 0 ? (
                addresses.map((addr, index) => (
                  <View key={index} style={{ marginBottom: 15 }}>
                    <Text style={{ marginBottom: 4, fontWeight: "500" }}>
                      {addr?.description || "Selecciona una dirección"}
                    </Text>
                    <AddressPicker
                      initialValue={addr?.description || ""}
                      onPlaceSelected={(place) => {
                        const updated = [...addresses];
                        updated[index] = { ...updated[index], ...place };
                        setAddresses(updated);
                      }}
                    />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Información adicional (ej: Apto. 402, frente a Supermercado)"
                      placeholderTextColor="#999"
                      value={addr.additionalInfo}
                      onChangeText={(text) => {
                        const updated = [...addresses];
                        updated[index].additionalInfo = text;
                        setAddresses(updated);
                      }}
                    />
                    {addresses.length > 1 && (
                      <TouchableOpacity onPress={() => removeAddress(index)}>
                        <Text style={styles.link}>Eliminar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No hay direcciones registradas
                </Text>
              )}
              <TouchableOpacity onPress={addAddress}>
                <Text style={styles.link}>+ Agregar dirección</Text>
              </TouchableOpacity>
            </>
          ) : user.addresses.length > 0 ? (
            user.addresses.map((address, i) => (
              <View key={i} style={styles.addressItem}>
                <Ionicons
                  name="location-sharp"
                  size={20}
                  color="#E31E24"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.addressText}>
                  {address?.description}
                  {address?.additionalInfo && `, ${address.additionalInfo}`}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay direcciones registradas</Text>
          )}
        </View>
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
                    color="#E31E24"
                  />
                }
              />
              <InfoRow
                label="Modelo"
                value={user.vehicle.model}
                icon={<Feather name="tag" size={22} color="#E31E24" />}
              />
            </>
          ) : (
            <Text style={styles.emptyText}>No registrado</Text>
          )}
        </View>
      </CheckRender>

      {/* Apartado Legal y Términos y Condiciones */}
      <View style={styles.cardSharp}>
        <Text style={styles.sectionTitle}>Legal e Información</Text>
        <TouchableOpacity
          style={styles.termsOptionRow}
          onPress={() => setIsTermsModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.termsOptionLeft}>
            <Ionicons name="document-text-outline" size={22} color="#E31E24" />
            <Text style={styles.termsOptionText}>Términos y Condiciones de Uso</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.termsOptionRow, { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f0f0f0" }]}
          onPress={toggleTermsNotice}
          activeOpacity={0.7}
        >
          <View style={styles.termsOptionLeft}>
            <Ionicons
              name={termsNoticeEnabledState ? "checkbox-outline" : "square-outline"}
              size={22}
              color={termsNoticeEnabledState ? "#E31E24" : "#666"}
            />
            <Text style={styles.termsOptionText}>
              Aviso al Login: {termsNoticeEnabledState ? "Habilitado" : "Deshabilitado"}
            </Text>
          </View>
          <View style={[
            styles.toggleBadge,
            { backgroundColor: termsNoticeEnabledState ? "#ffebee" : "#f1f5f9" }
          ]}>
            <Text style={[
              styles.toggleBadgeText,
              { color: termsNoticeEnabledState ? "#E31E24" : "#475569" }
            ]}>
              {termsNoticeEnabledState ? "Deshabilitar" : "Habilitar"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

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

      {/* Modal Releable de Términos y Condiciones */}
      <Modal
        visible={isTermsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTermsModalVisible(false)}
      >
        <View style={styles.termsModalOverlay}>
          <View style={styles.termsModalCard}>
            <View style={styles.termsHeader}>
              <Ionicons name="shield-checkmark-outline" size={28} color="#E31E24" />
              <Text style={styles.termsTitle}>Términos y Condiciones Suplicem</Text>
            </View>
            <Text style={styles.termsSubtitle}>
              Acuerdo legal y políticas de servicio de distribución y logística.
            </Text>

            <ScrollView style={styles.termsScrollView} showsVerticalScrollIndicator={true}>
              <Text style={styles.contractSectionHeader}>1. Descripción del Servicio Suplicem</Text>
              <Text style={styles.contractParagraph}>
                Suplicem es una plataforma de distribución y logística para la compra y despacho de cemento, agregados y materiales de construcción. Los pedidos se gestionan por fundas y toneladas con entregas directas a domicilio/obra o retiro en almacén.
              </Text>

              <Text style={styles.contractSectionHeader}>2. Registro y Responsabilidad de Cuenta</Text>
              <Text style={styles.contractParagraph}>
                El usuario garantiza que la información de registro (dirección de obra, número de cédula/RNC y contacto) es verídica. Cada cliente es responsable de garantizar un acceso adecuado para los vehículos pesados de transporte en el lugar de entrega designado.
              </Text>

              <Text style={styles.contractSectionHeader}>3. Modalidades de Pago y Comprobantes</Text>
              <Text style={styles.contractParagraph}>
                - Transferencia Bancaria: El cliente debe adjuntar la captura del comprobante oficial emitido por el banco para validar el pedido.
                {"\n\n"}- Pago a Crédito: La modalidad de crédito se otorga sujeta a acuerdos comerciales previos y límites de cuenta autorizados por la administración de Suplicem.
              </Text>

              <Text style={styles.contractSectionHeader}>4. Recepción de Mercancía y Garantía</Text>
              <Text style={styles.contractParagraph}>
                Al momento del descargue en la obra o almacén, el cliente o su representante debe verificar la cantidad de fundas recibidas y su estado. Cualquier novedad debe ser notificada de inmediato.
              </Text>

              <Text style={styles.contractSectionHeader}>5. Política de Privacidad y Protección de Datos</Text>
              <Text style={styles.contractParagraph}>
                Los datos recabados se utilizan exclusivamente para la gestión de compras, emisión de facturas y coordinación logística de despacho. Suplicem no comparte información personal con terceros ajenos a la operación.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeTermsButton}
              onPress={() => setIsTermsModalVisible(false)}
            >
              <Text style={styles.closeTermsButtonText}>Cerrar y Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmationModal
        visible={isLogoutModalVisible}
        title="Cerrar Sesión"
        message="¿Estás seguro que deseas cerrar sesión?"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
      />
    </ScrollView>
  );
};

export default ClientSettingsMainScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 60,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#AAA",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#E31E24",
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
  },
  role: {
    fontSize: 15,
    color: "#E31E24",
    marginTop: 2,
    fontWeight: "600",
  },
  // Estilo "Sharp" Híbrido: Bordes sutiles afilados (borderRadius 6) con sombras elegantes
  cardSharp: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 18,
    paddingHorizontal: 16,
    width: "100%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconWrapper: {
    marginRight: 12,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E31E24",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: "#0F294A",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 14,
    borderBottomColor: "#E2E8F0",
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  termsOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  termsOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  termsOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F294A",
  },
  addressItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  emptyText: {
    fontStyle: "italic",
    color: "#AAA",
    fontSize: 14,
  },
  sharpButton: {
    marginTop: 10,
    backgroundColor: "#0F294A",
    paddingVertical: 14,
    borderRadius: 6,
    width: "100%",
    alignItems: "center",
  },
  buttonTextSharp: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  logoutButtonSharp: {
    marginTop: 12,
    backgroundColor: "#ffffff",
    borderColor: "#E31E24",
    borderWidth: 1.5,
    paddingVertical: 13,
    borderRadius: 6,
    width: "100%",
    alignItems: "center",
  },
  logoutTextSharp: {
    color: "#E31E24",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#757575",
  },
  inputField: {
    fontSize: 15,
    color: "#333",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E31E24",
  },
  link: {
    color: "#E31E24",
    textDecorationLine: "underline",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 10,
  },
  // Modal de Términos
  termsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  termsModalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 20,
    width: "95%",
    maxHeight: "85%",
  },
  termsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
    flex: 1,
  },
  termsSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 14,
  },
  termsScrollView: {
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#fafafa",
    marginBottom: 16,
    maxHeight: 340,
  },
  contractSectionHeader: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#0F294A",
    marginTop: 8,
    marginBottom: 4,
  },
  contractParagraph: {
    fontSize: 13,
    color: "#444",
    lineHeight: 19,
    marginBottom: 8,
  },
  closeTermsButton: {
    backgroundColor: "#0F294A",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  closeTermsButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  toggleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  toggleBadgeText: {
    fontSize: 13,
    fontWeight: "bold",
  },
});
