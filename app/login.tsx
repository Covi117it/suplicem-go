import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { getCurrentUser, login, recoverPassword } from "@/services/authService";
import {
  saveAuthSession,
  saveAcceptedTerms,
  checkAcceptedTerms,
} from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { useAlert } from "@/context/alertContext";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const authContext = useContext(AuthContext);
  const { show, hide } = useLoading();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { showAlert } = useAlert();

  // Estados para el Modal de Términos y Condiciones
  const [termsDisclaimerVisible, setTermsDisclaimerVisible] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isCheckedAccepted, setIsCheckedAccepted] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<{
    session: any;
    user: any;
  } | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        message: "Por favor, complete todos los campos",
        type: "error",
      });
      return;
    }

    show();

    const responseLogin = await login(email, password);

    if (responseLogin?.data?.success) {
      const responseUser = await getCurrentUser(responseLogin?.data?.idToken);

      if (responseUser?.data?.success) {
        const user = responseUser?.data?.user;

        if (user?.status === "pending") {
          const now = Date.now();
          const newSession = {
            token: responseLogin?.data?.idToken,
            refreshToken: responseLogin?.data?.refreshToken,
            expiresAt: now + parseInt(responseLogin?.data?.expiresIn || "3600") * 1000,
          };
          await saveAuthSession(newSession);
          authContext.logIn(user);
          hide();
          router.replace("/pending-approval");
          return;
        }

        if (user?.status === "inactive") {
          Alert.alert("¡Hola!", "");
          showAlert({
            message: "Cuenta suspendida temporalmente.",
            type: "info",
          });
          hide();
          return;
        }

        if (!responseLogin?.data?.emailVerified) {
          Alert.alert("¡Hola!", "");
          showAlert({
            message:
              "Aún no has verificado tu cuenta. Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación para activar tu cuenta.",
            type: "info",
          });
          hide();
          return;
        }

        const now = Date.now();
        const newSession = {
          token: responseLogin?.data?.idToken,
          refreshToken: responseLogin?.data?.refreshToken,
          expiresAt: now + parseInt(responseLogin?.data?.expiresIn) * 1000,
        };

        // Verificar si el usuario YA aceptó los términos previamente en este dispositivo
        const alreadyAccepted = await checkAcceptedTerms(user.uid);

        if (alreadyAccepted) {
          await saveAuthSession(newSession);
          authContext.logIn(user);
        } else {
          // Mostrar términos solo la primera vez que inicia sesión
          setPendingSessionData({
            session: newSession,
            user,
          });
          setHasScrolledToBottom(false);
          setIsCheckedAccepted(false);
          setTermsDisclaimerVisible(true);
        }
      } else {
        Alert.alert("Error", "");
        showAlert({
          message: "Usuario no encontrado",
          type: "error",
        });
      }
    } else {
      showAlert({
        message: responseLogin?.message || "Credenciales inválidas",
        type: "error",
      });
    }

    hide();
  };

  const handleAcceptTerms = async () => {
    if (!pendingSessionData) return;
    if (!hasScrolledToBottom || !isCheckedAccepted) return;

    const session = pendingSessionData;
    setTermsDisclaimerVisible(false);
    setPendingSessionData(null);

    if (session.user?.uid) {
      await saveAcceptedTerms(session.user.uid);
    }
    await saveAuthSession(session.session);

    // En iOS, esperar a que la animación del Modal termine para evitar congelamiento de navegación
    setTimeout(() => {
      authContext.logIn(session.user);
    }, Platform.OS === "ios" ? 300 : 50);
  };

  const handleDeclineTerms = () => {
    setTermsDisclaimerVisible(false);
    setPendingSessionData(null);
    showAlert({
      message:
        "Debes aceptar los Términos y Condiciones para poder ingresar a la plataforma Suplicem.",
      type: "warning",
    });
  };

  const handleScrollTerms = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 30;
    const isBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    if (isBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handlePasswordReset = async () => {
    if (!recoveryEmail) {
      showAlert({
        message: "Ingrese su correo electrónico",
        type: "error",
      });
      return;
    }

    setModalVisible(false);
    show();

    const responseRecovery = await recoverPassword(recoveryEmail);

    if (responseRecovery?.data?.success) {
      Alert.alert("Recuperación");
      showAlert({
        message: `Se enviará un correo a ${recoveryEmail} para restablecer su contraseña.`,
        type: "info",
      });
      setRecoveryEmail("");
    } else {
      showAlert({
        message: "El correo no existe",
        type: "error",
      });
    }

    hide();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../assets/images/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={24}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Usuario"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#999"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.linkText}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Al acceder demuestras tu conformidad con nuestros{" "}
            <Text
              style={styles.linkInline}
              onPress={() => router.push("/terms")}
            >
              Términos de Uso
            </Text>{" "}
            y{" "}
            <Text
              style={styles.linkInline}
              onPress={() => router.push("/privacy")}
            >
              Política de Privacidad
            </Text>
            .
          </Text>
        </View>

        {/* Modal de Recuperar Contraseña */}
        <Modal
          transparent
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Recuperar contraseña</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Correo electrónico"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={recoveryEmail}
                onChangeText={setRecoveryEmail}
              />

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handlePasswordReset}
              >
                <Text style={styles.modalButtonText}>Enviar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Disclaimer de Términos y Condiciones (Bordes afilados y contenido real) */}
        <Modal
          transparent
          visible={termsDisclaimerVisible}
          animationType="slide"
          onRequestClose={() => {}}
        >
          <View style={styles.termsModalOverlay}>
            <View style={styles.termsModalCardSharp}>
              <View style={styles.termsHeader}>
                <Ionicons name="shield-checkmark-outline" size={30} color="#E31E24" />
                <Text style={styles.termsTitleLarge}>Términos y Condiciones de Suplicem</Text>
              </View>
              <Text style={styles.termsSubtitleLarge}>
                Por favor, desplázate hasta el final para leer el acuerdo de servicio antes de continuar.
              </Text>

              <View style={styles.termsScrollBox}>
                <ScrollView
                  onScroll={handleScrollTerms}
                  scrollEventThrottle={16}
                  showsVerticalScrollIndicator={true}
                  style={styles.termsScrollViewArea}
                >
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
                    - <Text style={{ fontWeight: "bold" }}>Transferencia Bancaria:</Text> El cliente debe adjuntar la captura del comprobante oficial emitido por el banco para validar el pedido.
                    {"\n\n"}- <Text style={{ fontWeight: "bold" }}>Pago a Crédito:</Text> La modalidad de crédito se otorga sujeta a acuerdos comerciales previos y límites de cuenta autorizados por la administración de Suplicem.
                  </Text>

                  <Text style={styles.contractSectionHeader}>4. Recepción de Mercancía y Garantía</Text>
                  <Text style={styles.contractParagraph}>
                    Al momento del descargue en la obra o almacén, el cliente o su representante debe verificar la cantidad de fundas recibidas y su estado. Cualquier novedad debe ser notificada de inmediato a través de los canales de atención.
                  </Text>

                  <Text style={styles.contractSectionHeader}>5. Política de Privacidad y Protección de Datos</Text>
                  <Text style={styles.contractParagraph}>
                    Los datos recabados se utilizan exclusivamente para la gestión de compras, emisión de facturas y coordinación logística de despacho. Suplicem no comparte información personal con terceros ajenos a la operación.
                  </Text>

                  <View style={styles.endOfDocumentContainer}>
                    <Ionicons
                      name={hasScrolledToBottom ? "checkmark-circle" : "arrow-down-circle-outline"}
                      size={22}
                      color={hasScrolledToBottom ? "#2e7d32" : "#999"}
                    />
                    <Text
                      style={[
                        styles.endOfDocumentText,
                        hasScrolledToBottom && { color: "#2e7d32" },
                      ]}
                    >
                      {hasScrolledToBottom
                        ? "Has leído todo el contrato de servicio."
                        : "Continúa desplazándote hasta el final..."}
                    </Text>
                  </View>
                </ScrollView>
              </View>

              {/* Casilla de verificación (Checkbox) */}
              <TouchableOpacity
                disabled={!hasScrolledToBottom}
                style={[
                  styles.checkboxRow,
                  !hasScrolledToBottom && styles.checkboxRowDisabled,
                ]}
                onPress={() => setIsCheckedAccepted(!isCheckedAccepted)}
              >
                <Ionicons
                  name={isCheckedAccepted ? "checkbox" : "square-outline"}
                  size={24}
                  color={
                    !hasScrolledToBottom
                      ? "#b0bec5"
                      : isCheckedAccepted
                      ? "#E31E24"
                      : "#333"
                  }
                />
                <Text
                  style={[
                    styles.checkboxLabel,
                    !hasScrolledToBottom && { color: "#b0bec5" },
                  ]}
                >
                  He leído y acepto los Términos y Condiciones de Suplicem.
                </Text>
              </TouchableOpacity>

              {/* Botones de Aceptar y Declinar con bordes rectos */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  disabled={!hasScrolledToBottom}
                  style={[
                    styles.declineButtonSharp,
                    !hasScrolledToBottom && styles.buttonDisabledSharp,
                  ]}
                  onPress={handleDeclineTerms}
                >
                  <Text
                    style={[
                      styles.declineButtonText,
                      !hasScrolledToBottom && { color: "#90a4ae" },
                    ]}
                  >
                    Declinar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!hasScrolledToBottom || !isCheckedAccepted}
                  style={[
                    styles.acceptButtonSharp,
                    (!hasScrolledToBottom || !isCheckedAccepted) &&
                      styles.buttonDisabledSharp,
                  ]}
                  onPress={handleAcceptTerms}
                >
                  <Text style={styles.acceptButtonTextSharp}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 200,
    height: 140,
    alignSelf: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fdfdfd",
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  eyeIcon: {
    marginLeft: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 14,
    alignItems: "center",
  },
  linkText: {
    color: "#E31E24",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  termsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  termsText: {
    textAlign: "center",
    fontSize: 13,
    color: "#555",
  },
  linkInline: {
    color: "#E31E24",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 6,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  modalInput: {
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: "#f9f9f9",
  },
  modalButton: {
    backgroundColor: "#E31E24",
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  modalCancelText: {
    color: "#0F294A",
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },

  // Estilos del Modal de Términos con bordes más afilados/rectos y área más grande
  termsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "android" ? 36 : 16,
  },
  termsModalCardSharp: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    padding: 16,
    width: "96%",
    maxHeight: Platform.OS === "android" ? "78%" : "84%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    paddingBottom: Platform.OS === "android" ? 20 : 16,
  },
  termsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  termsTitleLarge: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
    flex: 1,
  },
  termsSubtitleLarge: {
    fontSize: 13,
    color: "#555",
    marginBottom: 10,
  },
  termsScrollBox: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#fafafa",
    maxHeight: Platform.OS === "android" ? 260 : 340,
  },
  termsScrollViewArea: {
    maxHeight: Platform.OS === "android" ? 245 : 320,
  },
  contractSectionHeader: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#0F294A",
    marginTop: 10,
    marginBottom: 4,
  },
  contractParagraph: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 10,
  },
  endOfDocumentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f0f4f8",
    borderRadius: 4,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  endOfDocumentText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 13,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  checkboxRowDisabled: {
    opacity: 0.6,
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#222",
    fontWeight: "600",
    flex: 1,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  declineButtonSharp: {
    flex: 1,
    backgroundColor: "#eceff1",
    borderColor: "#cfd8dc",
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  declineButtonText: {
    color: "#37474f",
    fontSize: 15,
    fontWeight: "bold",
  },
  acceptButtonSharp: {
    flex: 1,
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonDisabledSharp: {
    backgroundColor: "#cfd8dc",
    borderColor: "#cfd8dc",
  },
  acceptButtonTextSharp: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
